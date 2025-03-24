import { Page, expect } from '@playwright/test';

// Check if we're in mock mode
const USE_MOCKS = process.env.TEST_USE_MOCKS === 'true';

/**
 * Helper function to log in to the admin panel
 */
export async function adminLogin(page: Page, email = 'admin@example.com', password = 'password123') {
  if (USE_MOCKS) {
    console.log('Using mock login mode - creating session directly');
    
    // Create data URL with HTML that sets localStorage
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Setting up mock session</title>
        </head>
        <body>
          <h1>Setting up mock session...</h1>
          <script>
            try {
              // Set mock login data
              localStorage.setItem('admin_session', JSON.stringify({
                token: 'mock-token',
                user: {
                  id: 1,
                  email: '${email}',
                  role: 'admin'
                },
                expires: new Date(Date.now() + 86400000).toISOString()
              }));
              console.log('Successfully set mock login data in localStorage');
              document.body.innerHTML += '<p>Login successful!</p>';
            } catch (error) {
              console.error('Failed to set localStorage:', error);
              document.body.innerHTML += '<p>Failed to set up mock session: ' + error.message + '</p>';
            }
          </script>
        </body>
      </html>
    `;
    
    // Navigate to data URL with the HTML
    await page.goto(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    
    // Wait a moment to make sure localStorage is set
    await page.waitForTimeout(300);
    
    return;
  }
  
  // Regular login process
  await page.goto('http://localhost:3000/admin/login');
  
  // Try multiple selectors for email field
  const emailSelectors = [
    'input[type="email"]', 
    'input#email', 
    'input[name="email"]', 
    'input.email-input'
  ];
  
  let emailInput = null;
  for (const selector of emailSelectors) {
    const input = page.locator(selector).first();
    if (await input.count() > 0) {
      emailInput = input;
      console.log(`Found email input with selector: ${selector}`);
      break;
    }
  }
  
  if (!emailInput) {
    console.error('Could not find email input!');
    throw new Error('Email input not found');
  }
  
  // Try multiple selectors for password field
  const passwordSelectors = [
    'input[type="password"]', 
    'input#password', 
    'input[name="password"]', 
    'input.password-input'
  ];
  
  let passwordInput = null;
  for (const selector of passwordSelectors) {
    const input = page.locator(selector).first();
    if (await input.count() > 0) {
      passwordInput = input;
      console.log(`Found password input with selector: ${selector}`);
      break;
    }
  }
  
  if (!passwordInput) {
    console.error('Could not find password input!');
    throw new Error('Password input not found');
  }
  
  // Fill in credentials
  await emailInput.fill(email);
  await passwordInput.fill(password);
  
  // Try multiple selectors for submit button
  const submitSelectors = [
    'button[type="submit"]', 
    'input[type="submit"]', 
    'button:has-text("Login")', 
    'button:has-text("Sign in")',
    'button.login-button',
    'form button'
  ];
  
  let submitButton = null;
  for (const selector of submitSelectors) {
    const button = page.locator(selector).first();
    if (await button.count() > 0) {
      submitButton = button;
      console.log(`Found submit button with selector: ${selector}`);
      break;
    }
  }
  
  if (submitButton) {
    await submitButton.click();
  } else {
    console.log('Submit button not found, trying to press Enter');
    await page.keyboard.press('Enter');
  }
  
  // Wait for navigation after login
  try {
    await page.waitForURL(/\/admin/, { timeout: 5000 });
  } catch (error) {
    console.error('Navigation after login failed:', error);
    throw new Error('Login failed');
  }
}

/**
 * Mock a page with given content for testing without a live server
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
  
  // Set up route handler for potential form submissions
  if (route === '/admin/login') {
    // Special case for login route - handle form submissions
    await page.route('**/admin/login', async route => {
      if (route.request().method() === 'POST') {
        // Mock a successful login by redirecting to dashboard
        await route.fulfill({
          status: 302,
          headers: {
            'Location': '/admin/dashboard'
          }
        });
      } else {
        // For GET requests, serve the mocked content
        await route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: content
        });
      }
    });
  }
  
  // Set up generic route handler for all admin routes (for general navigation)
  await page.route('**/admin/**', async route => {
    // For all routes, respond with at least a basic HTML structure
    const path = route.request().url().split('/admin/')[1];
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Admin - ${path}</title>
            <base href="http://localhost:3000">
          </head>
          <body>
            <h1>Admin - ${path}</h1>
            <div class="content">Mocked content for ${path}</div>
          </body>
        </html>
      `
    });
  });
}

/**
 * Wait for an element with retry logic
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
 * Navigate to a specific admin section with verification
 */
export async function navigateToAdminSection(page: Page, path: string, titlePattern: RegExp) {
  if (USE_MOCKS) {
    console.log(`Mock mode: Pretending to navigate to ${path}`);
    // Create a mock page with expected content
    await mockPage(
      page, 
      `/admin/dashboard/${path}`, 
      `<html><body><h1>${titlePattern.source.replace(/[\\\[\]]/g, '')}</h1></body></html>`
    );
    return true;
  }
  
  await page.goto(`/admin/${path}`);
  
  // Try to verify we're on the right page
  try {
    // Wait for heading or content with title pattern
    await page.waitForSelector(`h1:has-text("${titlePattern.source.replace(/[\\^$.*+?()[\]{}|]/g, '')}"), 
                               .content:has-text("${titlePattern.source.replace(/[\\^$.*+?()[\]{}|]/g, '')}")`, 
                               { timeout: 5000 });
    return true;
  } catch (e) {
    // Check URL as fallback
    const url = page.url();
    if (url.includes(`/admin/${path}`)) {
      return true;
    }
    
    // Check page content as last resort
    const content = await page.content();
    return content.includes(titlePattern.source.replace(/[\\^$.*+?()[\]{}|]/g, ''));
  }
  
  return false;
} 