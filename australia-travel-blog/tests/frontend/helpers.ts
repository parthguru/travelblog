import { Page, expect } from '@playwright/test';

// Check if we're in mock mode
const USE_MOCKS = process.env.TEST_USE_MOCKS === 'true';

/**
 * Wait for element with retry logic
 */
export async function waitForElementWithRetry(
  page: Page, 
  selector: string, 
  options = { timeout: 5000, interval: 500 }
) {
  const { timeout, interval } = options;
  const startTime = Date.now();
  let lastError;

  while (Date.now() - startTime < timeout) {
    try {
      const element = page.locator(selector);
      await element.waitFor({ timeout: interval });
      
      // Check if element is visible
      if (await element.isVisible()) {
        console.log(`Element found with selector: ${selector}`);
        return true;
      }
    } catch (error) {
      lastError = error;
      // Element not found yet, wait and retry
      await page.waitForTimeout(interval);
    }
  }

  console.log(`Element not found with selector: ${selector} after ${timeout}ms`);
  return false;
}

/**
 * Mock a page in test
 */
export async function mockPage(page: Page, route: string, content: string) {
  console.log(`Mocking page for route: ${route}`);
  
  // Clean up the HTML to ensure it has proper base and content-type
  const cleanedHtml = content.includes('<base') 
    ? content 
    : content.replace('<head>', `<head>\n<base href="http://localhost:3000">`);
  
  // Create a data URL with the HTML content
  const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(cleanedHtml)}`;
  
  // Navigate directly to the data URL
  await page.goto(dataUrl);
  
  // Set up generic route handler for navigation
  await page.route('**/*', async route => {
    const url = route.request().url();
    // Skip data URLs and already handled routes
    if (url.startsWith('data:') || url.includes('/admin/')) {
      await route.continue();
      return;
    }

    // Extract path from URL
    const urlObj = new URL(url);
    const path = urlObj.pathname || '/';
    
    // Respond with a simple mock page
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Travel Blog - ${path}</title>
            <base href="http://localhost:3000">
          </head>
          <body>
            <header>
              <nav>
                <a href="/">Home</a>
                <a href="/blog">Blog</a>
                <a href="/directory">Directory</a>
                <a href="/about">About</a>
                <a href="/contact">Contact</a>
              </nav>
            </header>
            <main>
              <h1>Travel Blog - ${path}</h1>
              <div class="content">Mocked content for ${path}</div>
            </main>
            <footer>
              <p>© ${new Date().getFullYear()} Travel Blog</p>
            </footer>
          </body>
        </html>
      `
    });
  });
}

/**
 * Check all links on a page
 */
export async function checkAllLinks(page: Page) {
  // Get all links on the page
  const links = await page.locator('a[href]:not([href^="#"]):not([href^="javascript:"]):not([href^="mailto:"])').all();
  console.log(`Found ${links.length} links on the page`);
  
  const results = {
    total: links.length,
    successful: 0,
    failed: 0,
    skipped: 0,
    failedLinks: []
  };

  // If in mock mode, we don't actually navigate to links
  if (USE_MOCKS) {
    console.log('Mock mode: Skipping actual link navigation');
    results.skipped = links.length;
    return results;
  }

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    try {
      const href = await link.getAttribute('href');
      const linkText = await link.textContent();
      
      // Skip external links for testing
      if (href.startsWith('http') && !href.includes('localhost')) {
        console.log(`Skipping external link: ${href}`);
        results.skipped++;
        continue;
      }
      
      console.log(`Checking link ${i+1}/${links.length}: ${linkText?.trim() || href}`);
      
      // Create a new page for each link to avoid losing current page context
      const newPage = await page.context().newPage();
      
      // Go to the link
      await newPage.goto(href, { timeout: 10000 });
      
      // Check if navigation was successful
      const status = await newPage.evaluate(() => {
        return {
          url: window.location.href,
          title: document.title,
          status: document.body.innerText.includes('404') ? 404 : 200
        };
      });
      
      if (status.status === 200) {
        console.log(`✓ Link ${linkText?.trim() || href} is working`);
        results.successful++;
      } else {
        console.log(`✗ Link ${linkText?.trim() || href} failed with status ${status.status}`);
        results.failed++;
        results.failedLinks.push({ href, text: linkText?.trim() || href });
      }
      
      // Close the new page
      await newPage.close();
      
    } catch (error) {
      console.error(`Error checking link:`, error);
      results.failed++;
    }
  }
  
  return results;
}

/**
 * Provide mock content for specific pages
 */
export function getMockHtmlForRoute(route: string) {
  const baseMockHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Travel Blog - ${route}</title>
        <base href="http://localhost:3000">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 0;
            line-height: 1.6;
          }
          header { 
            background: #f8f9fa; 
            padding: 1rem;
          }
          nav { 
            display: flex; 
            gap: 1rem;
          }
          main { 
            padding: 2rem; 
          }
          footer { 
            background: #f8f9fa; 
            padding: 1rem;
            text-align: center;
          }
          .card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
          }
          .btn {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <header>
          <nav>
            <a href="/">Home</a>
            <a href="/blog">Blog</a>
            <a href="/directory">Directory</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </nav>
        </header>
        <main>
  `;

  const footerHtml = `
        </main>
        <footer>
          <p>© ${new Date().getFullYear()} Travel Blog</p>
          <nav>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/sitemap">Sitemap</a>
          </nav>
        </footer>
      </body>
    </html>
  `;

  // Specific content for different routes
  let mainContent = '';
  
  switch (route) {
    case '/':
      mainContent = `
        <h1>Welcome to the Travel Blog</h1>
        <p>Discover amazing travel destinations, tips, and stories.</p>
        
        <section>
          <h2>Featured Blog Posts</h2>
          <div class="card">
            <h3>Exploring Sydney's Hidden Gems</h3>
            <p>Beyond the Opera House and Harbour Bridge, Sydney has many hidden treasures...</p>
            <a href="/blog/sydney-hidden-gems" class="btn">Read More</a>
          </div>
          <div class="card">
            <h3>The Great Barrier Reef Guide</h3>
            <p>Everything you need to know about visiting Australia's natural wonder...</p>
            <a href="/blog/great-barrier-reef-guide" class="btn">Read More</a>
          </div>
        </section>
        
        <section>
          <h2>Featured Directory Listings</h2>
          <div class="card">
            <h3>The Rocks Historic Hotel</h3>
            <p>5-star accommodation in Sydney's historic district...</p>
            <a href="/directory/rocks-hotel" class="btn">View Details</a>
          </div>
          <div class="card">
            <h3>Uluru Sunset Tours</h3>
            <p>Experience the magic of Uluru at sunset...</p>
            <a href="/directory/uluru-sunset-tours" class="btn">View Details</a>
          </div>
        </section>
      `;
      break;
      
    case '/blog':
      mainContent = `
        <h1>Travel Blog</h1>
        <p>Read our latest travel stories, tips, and guides.</p>
        
        <div class="card">
          <h2>Exploring Sydney's Hidden Gems</h2>
          <p>Published: June 10, 2023</p>
          <p>Beyond the Opera House and Harbour Bridge, Sydney has many hidden treasures...</p>
          <a href="/blog/sydney-hidden-gems" class="btn">Read More</a>
        </div>
        
        <div class="card">
          <h2>The Great Barrier Reef Guide</h2>
          <p>Published: May 25, 2023</p>
          <p>Everything you need to know about visiting Australia's natural wonder...</p>
          <a href="/blog/great-barrier-reef-guide" class="btn">Read More</a>
        </div>
        
        <div class="card">
          <h2>Hiking in the Blue Mountains</h2>
          <p>Published: April 18, 2023</p>
          <p>The best trails and viewpoints in this UNESCO World Heritage site...</p>
          <a href="/blog/blue-mountains-hiking" class="btn">Read More</a>
        </div>
        
        <div class="pagination">
          <a href="/blog?page=1" class="btn">1</a>
          <a href="/blog?page=2" class="btn">2</a>
          <a href="/blog?page=3" class="btn">3</a>
        </div>
      `;
      break;
      
    case '/directory':
      mainContent = `
        <h1>Travel Directory</h1>
        <p>Find the best hotels, restaurants, and attractions in Australia.</p>
        
        <div class="categories">
          <a href="/directory/categories/hotels" class="btn">Hotels</a>
          <a href="/directory/categories/restaurants" class="btn">Restaurants</a>
          <a href="/directory/categories/attractions" class="btn">Attractions</a>
          <a href="/directory/categories/tours" class="btn">Tours</a>
        </div>
        
        <h2>Featured Listings</h2>
        
        <div class="card">
          <h3>The Rocks Historic Hotel</h3>
          <p>5-star accommodation in Sydney's historic district</p>
          <p>Category: Hotels</p>
          <a href="/directory/rocks-hotel" class="btn">View Details</a>
        </div>
        
        <div class="card">
          <h3>Uluru Sunset Tours</h3>
          <p>Experience the magic of Uluru at sunset</p>
          <p>Category: Tours</p>
          <a href="/directory/uluru-sunset-tours" class="btn">View Details</a>
        </div>
        
        <div class="card">
          <h3>Bondi Seafood Restaurant</h3>
          <p>Fresh seafood with ocean views</p>
          <p>Category: Restaurants</p>
          <a href="/directory/bondi-seafood" class="btn">View Details</a>
        </div>
      `;
      break;
      
    case '/about':
      mainContent = `
        <h1>About Us</h1>
        <p>Learn more about the Travel Blog and our mission.</p>
        
        <section>
          <h2>Our Story</h2>
          <p>The Travel Blog was founded in 2020 with a simple mission: to help travelers discover the best of Australia.</p>
          <p>Our team of experienced travelers and local experts provide authentic insights, practical tips, and honest reviews to help you plan your perfect Australian adventure.</p>
        </section>
        
        <section>
          <h2>Our Team</h2>
          <div class="card">
            <h3>Jane Smith</h3>
            <p>Founder & Editor-in-Chief</p>
            <p>An avid traveler who has visited every state and territory in Australia.</p>
          </div>
          
          <div class="card">
            <h3>John Doe</h3>
            <p>Senior Writer</p>
            <p>Specializes in outdoor adventures and remote destinations.</p>
          </div>
          
          <div class="card">
            <h3>Sarah Johnson</h3>
            <p>Photography Director</p>
            <p>Award-winning photographer capturing Australia's diverse landscapes.</p>
          </div>
        </section>
        
        <section>
          <h2>Contact Us</h2>
          <p>Have questions or feedback? <a href="/contact">Get in touch</a> with our team.</p>
        </section>
      `;
      break;
      
    case '/contact':
      mainContent = `
        <h1>Contact Us</h1>
        <p>We'd love to hear from you! Get in touch with our team.</p>
        
        <form id="contact-form">
          <div>
            <label for="name">Name</label>
            <input type="text" id="name" name="name" required>
          </div>
          
          <div>
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          
          <div>
            <label for="subject">Subject</label>
            <input type="text" id="subject" name="subject" required>
          </div>
          
          <div>
            <label for="message">Message</label>
            <textarea id="message" name="message" rows="5" required></textarea>
          </div>
          
          <button type="submit" class="btn">Send Message</button>
        </form>
        
        <section>
          <h2>Other Ways to Connect</h2>
          <p>Email: info@travelblog.com</p>
          <p>Phone: +61 2 1234 5678</p>
          <p>Address: 123 Travel Street, Sydney, NSW 2000, Australia</p>
          
          <div class="social-links">
            <a href="https://facebook.com/travelblog">Facebook</a>
            <a href="https://twitter.com/travelblog">Twitter</a>
            <a href="https://instagram.com/travelblog">Instagram</a>
          </div>
        </section>
      `;
      break;
      
    default:
      mainContent = `
        <h1>Travel Blog - ${route}</h1>
        <p>Mocked content for ${route}</p>
        <a href="/">Back to Home</a>
      `;
  }
  
  return baseMockHtml + mainContent + footerHtml;
} 