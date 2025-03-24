import { test, expect } from '@playwright/test';
import { mockPage, waitForElementWithRetry, checkAllLinks, getMockHtmlForRoute } from './helpers';

// Check if we're in mock mode
const USE_MOCKS = process.env.TEST_USE_MOCKS === 'true';

test.describe('About Page', () => {
  
  test('should load the about page successfully', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for about page test');
      await mockPage(page, '/about', getMockHtmlForRoute('/about'));
    } else {
      await page.goto('http://localhost:3000/about');
    }

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check that the title is correct
    const title = await page.title();
    expect(title).toContain('Travel Blog');

    // Basic about page elements that should be present
    const headerPresent = await waitForElementWithRetry(page, 'header');
    expect(headerPresent).toBeTruthy();

    const mainNavLinks = await page.locator('header nav a').count();
    expect(mainNavLinks).toBeGreaterThan(0);
    
    const mainContent = await waitForElementWithRetry(page, 'main');
    expect(mainContent).toBeTruthy();
    
    const h1 = await page.locator('h1').first();
    expect(await h1.isVisible()).toBeTruthy();
    expect(await h1.textContent()).toContain('About');

    const footer = await waitForElementWithRetry(page, 'footer');
    expect(footer).toBeTruthy();
  });

  test('should display our story section', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for about page our story test');
      await mockPage(page, '/about', getMockHtmlForRoute('/about'));
    } else {
      await page.goto('http://localhost:3000/about');
    }

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check for our story section
    const ourStoryHeading = await page.locator('h2:has-text("Our Story")').first();
    expect(await ourStoryHeading.isVisible()).toBeTruthy();

    // Check for content in the our story section
    const storyParagraphs = await page.locator('h2:has-text("Our Story") + p, section:has(h2:has-text("Our Story")) p').all();
    expect(storyParagraphs.length).toBeGreaterThan(0);
  });

  test('should display team members', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for about page team test');
      await mockPage(page, '/about', getMockHtmlForRoute('/about'));
    } else {
      await page.goto('http://localhost:3000/about');
    }

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check for team section
    const teamHeading = await page.locator('h2:has-text("Our Team")').first();
    expect(await teamHeading.isVisible()).toBeTruthy();

    // Check for team members
    const teamMembers = await page.locator('h2:has-text("Our Team") ~ div .card, section:has(h2:has-text("Our Team")) .card').all();
    expect(teamMembers.length).toBeGreaterThan(0);

    // Check team member details
    if (teamMembers.length > 0) {
      const firstTeamMember = teamMembers[0];
      const memberName = await firstTeamMember.locator('h3').first();
      expect(await memberName.isVisible()).toBeTruthy();
    }
  });

  test('should check all links on the about page', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for about page link checker test');
      await mockPage(page, '/about', getMockHtmlForRoute('/about'));
    } else {
      await page.goto('http://localhost:3000/about');
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

test.describe('Contact Page', () => {
  
  test('should load the contact page successfully', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for contact page test');
      await mockPage(page, '/contact', getMockHtmlForRoute('/contact'));
    } else {
      await page.goto('http://localhost:3000/contact');
    }

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check that the title is correct
    const title = await page.title();
    expect(title).toContain('Travel Blog');

    // Basic contact page elements that should be present
    const headerPresent = await waitForElementWithRetry(page, 'header');
    expect(headerPresent).toBeTruthy();

    const mainNavLinks = await page.locator('header nav a').count();
    expect(mainNavLinks).toBeGreaterThan(0);
    
    const mainContent = await waitForElementWithRetry(page, 'main');
    expect(mainContent).toBeTruthy();
    
    const h1 = await page.locator('h1').first();
    expect(await h1.isVisible()).toBeTruthy();
    expect(await h1.textContent()).toContain('Contact');

    const footer = await waitForElementWithRetry(page, 'footer');
    expect(footer).toBeTruthy();
  });

  test('should display contact form', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for contact form test');
      await mockPage(page, '/contact', getMockHtmlForRoute('/contact'));
    } else {
      await page.goto('http://localhost:3000/contact');
    }

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check for contact form
    const contactForm = await page.locator('form, #contact-form').first();
    expect(await contactForm.isVisible()).toBeTruthy();

    // Check for form fields
    const nameField = await page.locator('input#name, input[name="name"]').first();
    expect(await nameField.isVisible()).toBeTruthy();

    const emailField = await page.locator('input#email, input[name="email"]').first();
    expect(await emailField.isVisible()).toBeTruthy();

    const messageField = await page.locator('textarea#message, textarea[name="message"]').first();
    expect(await messageField.isVisible()).toBeTruthy();

    const submitButton = await page.locator('button[type="submit"], input[type="submit"]').first();
    expect(await submitButton.isVisible()).toBeTruthy();
  });

  test('should have contact information', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for contact info test');
      await mockPage(page, '/contact', getMockHtmlForRoute('/contact'));
    } else {
      await page.goto('http://localhost:3000/contact');
    }

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check for contact information
    const contactInfo = await page.locator('p:has-text("Email:"), p:has-text("Phone:"), p:has-text("Address:")').all();
    expect(contactInfo.length).toBeGreaterThan(0);

    // Check for social links
    const socialLinks = await page.locator('.social-links a, a[href*="facebook"], a[href*="twitter"], a[href*="instagram"]').all();
    if (socialLinks.length > 0) {
      console.log(`Found ${socialLinks.length} social links`);
      // We don't fail the test if there are no social links as they might not be implemented
    }
  });

  test('should check all links on the contact page', async ({ page }) => {
    if (USE_MOCKS) {
      console.log('Using mock mode for contact page link checker test');
      await mockPage(page, '/contact', getMockHtmlForRoute('/contact'));
    } else {
      await page.goto('http://localhost:3000/contact');
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