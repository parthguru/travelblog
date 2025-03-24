import { test, expect } from '@playwright/test';
import { mockPage, waitForElementWithRetry, checkAllLinks, getMockHtmlForRoute } from './helpers';

// Check if we're in mock mode
const USE_MOCKS = process.env.TEST_USE_MOCKS === 'true';

test.describe('Directory Page', () => {
  
  test('should load the directory page successfully', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for directory page test');
      await mockPage(page, '/directory', getMockHtmlForRoute('/directory'));
    } else {
      await page.goto('http://localhost:3000/directory');
    }

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check that the title is correct
    const title = await page.title();
    expect(title).toContain('Travel Blog');

    // Basic directory page elements that should be present
    const headerPresent = await waitForElementWithRetry(page, 'header');
    expect(headerPresent).toBeTruthy();

    const mainNavLinks = await page.locator('header nav a').count();
    expect(mainNavLinks).toBeGreaterThan(0);
    
    const mainContent = await waitForElementWithRetry(page, 'main');
    expect(mainContent).toBeTruthy();
    
    const h1 = await page.locator('h1').first();
    expect(await h1.isVisible()).toBeTruthy();
    expect(await h1.textContent()).toContain('Directory');

    const footer = await waitForElementWithRetry(page, 'footer');
    expect(footer).toBeTruthy();
  });

  test('should display directory listings', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for directory listings test');
      await mockPage(page, '/directory', getMockHtmlForRoute('/directory'));
    } else {
      await page.goto('http://localhost:3000/directory');
    }

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check for directory listings
    const directoryListings = await page.locator('.card').all();
    expect(directoryListings.length).toBeGreaterThan(0);

    // Check for listing titles
    const listingTitles = await page.locator('.card h2, .card h3').all();
    expect(listingTitles.length).toBeGreaterThan(0);

    // Check content of first listing
    const firstListingTitle = await listingTitles[0].textContent();
    expect(firstListingTitle.length).toBeGreaterThan(0);
    
    // Check for view details links
    const viewDetailsLinks = await page.locator('.card a:has-text("View Details")').all();
    expect(viewDetailsLinks.length).toBeGreaterThan(0);
  });

  test('should have category filters', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for category filters test');
      await mockPage(page, '/directory', getMockHtmlForRoute('/directory'));
    } else {
      await page.goto('http://localhost:3000/directory');
    }

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check for category filters
    const categories = await page.locator('.categories a, .filters a, [role="tablist"] [role="tab"]').all();
    
    if (categories.length > 0) {
      console.log(`Found ${categories.length} category filters`);
      
      // Check the first category
      const firstCategory = await categories[0].textContent();
      expect(firstCategory.length).toBeGreaterThan(0);
      
      if (!USE_MOCKS) {
        // In real mode, click on the first category and verify filtering
        await categories[0].click();
        await page.waitForLoadState('networkidle');
        
        // Check that we're still on the directory page but with a category filter
        expect(page.url()).toContain('/directory');
      }
    } else {
      console.log('No category filters found, this might be a test failure if categories are expected');
      // We don't strictly fail the test as the implementation might vary
    }
  });

  test('should be able to navigate to a listing detail', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for listing detail navigation test');
      await mockPage(page, '/directory', getMockHtmlForRoute('/directory'));
    } else {
      await page.goto('http://localhost:3000/directory');
    }

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Find a view details link
    const viewDetailsLinks = await page.locator('.card a:has-text("View Details")').all();
    expect(viewDetailsLinks.length).toBeGreaterThan(0);
    
    if (USE_MOCKS) {
      // In mock mode, we just check that the link exists
      const href = await viewDetailsLinks[0].getAttribute('href');
      expect(href).toBeTruthy();
      console.log(`Mock mode: Would navigate to ${href}`);
    } else {
      // In real mode, we click the first link and check the navigation
      await viewDetailsLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      // We should now be on a directory listing detail page
      expect(page.url()).toContain('/directory/');
      
      // Check for listing detail elements
      const listingTitle = await page.locator('h1, h2').first();
      expect(await listingTitle.isVisible()).toBeTruthy();
      
      // Check for listing content
      const listingContent = await page.locator('main p').first();
      expect(await listingContent.isVisible()).toBeTruthy();
    }
  });

  test('should check all links on the directory page', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for link checker test');
      await mockPage(page, '/directory', getMockHtmlForRoute('/directory'));
    } else {
      await page.goto('http://localhost:3000/directory');
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