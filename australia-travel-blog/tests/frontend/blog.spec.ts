import { test, expect } from '@playwright/test';
import { mockPage, waitForElementWithRetry, checkAllLinks, getMockHtmlForRoute } from './helpers';

// Check if we're in mock mode
const USE_MOCKS = process.env.TEST_USE_MOCKS === 'true';

test.describe('Blog Page', () => {
  
  test('should load the blog page successfully', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for blog page test');
      await mockPage(page, '/blog', getMockHtmlForRoute('/blog'));
    } else {
      await page.goto('http://localhost:3000/blog');
    }

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check that the title is correct
    const title = await page.title();
    expect(title).toContain('Travel Blog');

    // Basic blog page elements that should be present
    const headerPresent = await waitForElementWithRetry(page, 'header');
    expect(headerPresent).toBeTruthy();

    const mainNavLinks = await page.locator('header nav a').count();
    expect(mainNavLinks).toBeGreaterThan(0);
    
    const mainContent = await waitForElementWithRetry(page, 'main');
    expect(mainContent).toBeTruthy();
    
    const h1 = await page.locator('h1').first();
    expect(await h1.isVisible()).toBeTruthy();
    expect(await h1.textContent()).toContain('Blog');

    const footer = await waitForElementWithRetry(page, 'footer');
    expect(footer).toBeTruthy();
  });

  test('should display blog posts', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for blog posts test');
      await mockPage(page, '/blog', getMockHtmlForRoute('/blog'));
    } else {
      await page.goto('http://localhost:3000/blog');
    }

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check for blog posts
    const blogPosts = await page.locator('.card').all();
    expect(blogPosts.length).toBeGreaterThan(0);

    // Check for blog post titles
    const postTitles = await page.locator('.card h2, .card h3').all();
    expect(postTitles.length).toBeGreaterThan(0);

    // Check content of first blog post
    const firstPostTitle = await postTitles[0].textContent();
    expect(firstPostTitle.length).toBeGreaterThan(0);
    
    // Check for read more links
    const readMoreLinks = await page.locator('.card a:has-text("Read More")').all();
    expect(readMoreLinks.length).toBeGreaterThan(0);
  });

  test('should have pagination if multiple pages', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for pagination test');
      await mockPage(page, '/blog', getMockHtmlForRoute('/blog'));
    } else {
      await page.goto('http://localhost:3000/blog');
    }

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check for pagination
    const paginationElement = await page.locator('.pagination').first();
    
    if (await paginationElement.isVisible()) {
      // If pagination exists, check that there are page links
      const pageLinks = await paginationElement.locator('a').all();
      expect(pageLinks.length).toBeGreaterThan(0);
      
      // Check first pagination link
      const firstPageLink = await pageLinks[0].getAttribute('href');
      expect(firstPageLink).toContain('page=');
    } else {
      console.log('No pagination found, either there is only one page or pagination is not implemented');
      // We don't fail the test if pagination is not present, as there might be only one page
    }
  });

  test('should be able to navigate to a blog post', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for blog post navigation test');
      await mockPage(page, '/blog', getMockHtmlForRoute('/blog'));
    } else {
      await page.goto('http://localhost:3000/blog');
    }

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Find a read more link
    const readMoreLinks = await page.locator('.card a:has-text("Read More")').all();
    expect(readMoreLinks.length).toBeGreaterThan(0);
    
    if (USE_MOCKS) {
      // In mock mode, we just check that the link exists
      const href = await readMoreLinks[0].getAttribute('href');
      expect(href).toBeTruthy();
      console.log(`Mock mode: Would navigate to ${href}`);
    } else {
      // In real mode, we click the first link and check the navigation
      await readMoreLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      // We should now be on a blog post page
      expect(page.url()).toContain('/blog/');
      
      // Check for blog post elements
      const postTitle = await page.locator('h1, h2').first();
      expect(await postTitle.isVisible()).toBeTruthy();
      
      // Check for post content
      const postContent = await page.locator('main p').first();
      expect(await postContent.isVisible()).toBeTruthy();
    }
  });

  test('should check all links on the blog page', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for link checker test');
      await mockPage(page, '/blog', getMockHtmlForRoute('/blog'));
    } else {
      await page.goto('http://localhost:3000/blog');
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