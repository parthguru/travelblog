import { test, expect } from '@playwright/test';
import { mockPage, waitForElementWithRetry, checkAllLinks, getMockHtmlForRoute } from './helpers';

// Check if we're in mock mode
const USE_MOCKS = process.env.TEST_USE_MOCKS === 'true';

test.describe('Homepage', () => {
  
  test('should load the homepage successfully', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for homepage test');
      await mockPage(page, '/', getMockHtmlForRoute('/'));
    } else {
      await page.goto('http://localhost:3000/');
    }

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check that the title is correct
    const title = await page.title();
    expect(title).toContain('Travel Blog');

    // Basic homepage elements that should be present
    const headerPresent = await waitForElementWithRetry(page, 'header');
    expect(headerPresent).toBeTruthy();

    const mainNavLinks = await page.locator('header nav a').count();
    expect(mainNavLinks).toBeGreaterThan(0);
    
    const mainContent = await waitForElementWithRetry(page, 'main');
    expect(mainContent).toBeTruthy();
    
    const h1 = await page.locator('h1').first();
    expect(await h1.isVisible()).toBeTruthy();
    expect(await h1.textContent()).toContain('Travel Blog');

    const footer = await waitForElementWithRetry(page, 'footer');
    expect(footer).toBeTruthy();
  });

  test('should have working navigation links', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for navigation links test');
      await mockPage(page, '/', getMockHtmlForRoute('/'));
    } else {
      await page.goto('http://localhost:3000/');
    }

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check that main navigation links exist
    const navLinks = [
      { name: 'Home', href: '/' },
      { name: 'Blog', href: '/blog' },
      { name: 'Directory', href: '/directory' },
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' }
    ];

    for (const link of navLinks) {
      const linkElement = page.locator(`header nav a[href="${link.href}"]`);
      expect(await linkElement.isVisible()).toBeTruthy();
      
      if (!USE_MOCKS) {
        // Only click and verify in real mode
        await linkElement.click();
        await page.waitForLoadState('networkidle');
        
        // Verify URL changed as expected
        expect(page.url()).toContain(link.href);
        
        // Go back to homepage
        await page.goto('http://localhost:3000/');
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should display featured blog posts', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for featured posts test');
      await mockPage(page, '/', getMockHtmlForRoute('/'));
    } else {
      await page.goto('http://localhost:3000/');
    }

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check for featured blog posts section
    const featuredPostsSection = await page.locator('h2:has-text("Featured Blog Posts")').first();
    expect(await featuredPostsSection.isVisible()).toBeTruthy();

    // Check that there are blog post cards
    const blogPostCards = await page.locator('.card h3').all();
    expect(blogPostCards.length).toBeGreaterThan(0);

    // Check that read more links are present
    const readMoreLinks = await page.locator('.card a:has-text("Read More")').all();
    expect(readMoreLinks.length).toBeGreaterThan(0);
  });

  test('should display featured directory listings', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for featured listings test');
      await mockPage(page, '/', getMockHtmlForRoute('/'));
    } else {
      await page.goto('http://localhost:3000/');
    }

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check for featured directory listings section
    const featuredListingsSection = await page.locator('h2:has-text("Featured Directory Listings")').first();
    expect(await featuredListingsSection.isVisible()).toBeTruthy();

    // Check that there are directory listing cards
    const directoryCards = await page.locator('h2:has-text("Featured Directory Listings") + div .card, section:has(h2:has-text("Featured Directory Listings")) .card').all();
    expect(directoryCards.length).toBeGreaterThan(0);

    // Check that view details links are present
    const viewDetailsLinks = await page.locator('.card a:has-text("View Details")').all();
    expect(viewDetailsLinks.length).toBeGreaterThan(0);
  });

  test('should check all links on the homepage', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for link checker test');
      await mockPage(page, '/', getMockHtmlForRoute('/'));
    } else {
      await page.goto('http://localhost:3000/');
    }

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check all links
    const linkResults = await checkAllLinks(page);
    
    console.log(`Link check results: Total: ${linkResults.total}, Successful: ${linkResults.successful}, Failed: ${linkResults.failed}, Skipped: ${linkResults.skipped}`);
    
    if (linkResults.failedLinks.length > 0) {
      console.log('Failed links:', linkResults.failedLinks);
    }
    
    // In mock mode, all links are skipped, so we just check the total matches the skipped count
    if (USE_MOCKS) {
      expect(linkResults.skipped).toBe(linkResults.total);
    } else {
      // In real mode, we expect no failed links
      expect(linkResults.failed).toBe(0);
    }
  });
}); 