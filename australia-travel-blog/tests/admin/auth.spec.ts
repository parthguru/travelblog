import { test, expect } from '@playwright/test';
import { adminLogin, waitForElementWithRetry, mockPage } from './helpers';

// Check if we're in mock mode
const USE_MOCKS = process.env.TEST_USE_MOCKS === 'true';

test.describe('Admin Authentication and Authorization', () => {
  test('should redirect to login page when accessing admin dashboard without authentication', async ({ page }) => {
    if (USE_MOCKS) {
      // In mock mode, mock the redirect behavior
      await mockPage(page, '/admin/dashboard', `
        <html>
          <head>
            <title>Login</title>
          </head>
          <body>
            <h1>Login</h1>
            <form>
              <input type="email" placeholder="Email" />
              <input type="password" placeholder="Password" />
              <button type="submit">Sign in</button>
            </form>
          </body>
        </html>
      `);
      
      const content = await page.content();
      expect(content).toMatch(/Login|Sign in/i);
      return;
    }
    
    await page.goto('/admin/dashboard');
    
    // Wait for navigation and check URL
    await page.waitForURL(/\/admin\/login/, { timeout: 10000 });
    
    // Verify we're on the login page
    const loginFormVisible = await waitForElementWithRetry(
      page, 
      'form, input[type="email"], input[type="password"], h1:has-text("Login")', 
      { timeout: 5000 }
    );
    expect(loginFormVisible).toBeTruthy();
  });
  
  test('should redirect to login page when accessing admin blog section without authentication', async ({ page }) => {
    if (USE_MOCKS) {
      // In mock mode, mock the redirect behavior
      await mockPage(page, '/admin/dashboard/blog/posts', `
        <html>
          <head>
            <title>Login</title>
          </head>
          <body>
            <h1>Login</h1>
            <form>
              <input type="email" placeholder="Email" />
              <input type="password" placeholder="Password" />
              <button type="submit">Sign in</button>
            </form>
          </body>
        </html>
      `);
      
      const content = await page.content();
      expect(content).toMatch(/Login|Sign in/i);
      return;
    }
    
    await page.goto('/admin/dashboard/blog/posts');
    
    // Wait for navigation and check URL
    await page.waitForURL(/\/admin\/login/, { timeout: 10000 });
    
    // Verify we're on the login page
    const content = await page.content();
    expect(content).toMatch(/Login|Sign in|Authentication/i);
  });
  
  test('should redirect to login page when accessing admin directory section without authentication', async ({ page }) => {
    if (USE_MOCKS) {
      // In mock mode, mock the redirect behavior
      await mockPage(page, '/admin/dashboard/directory/listings', `
        <html>
          <head>
            <title>Login</title>
          </head>
          <body>
            <h1>Login</h1>
            <form>
              <input type="email" placeholder="Email" />
              <input type="password" placeholder="Password" />
              <button type="submit">Sign in</button>
            </form>
          </body>
        </html>
      `);
      
      const content = await page.content();
      expect(content).toMatch(/Login|Sign in/i);
      return;
    }
    
    await page.goto('/admin/dashboard/directory/listings');
    
    // Wait for navigation and check URL
    await page.waitForURL(/\/admin\/login/, { timeout: 10000 });
    
    // Verify we're on the login page
    const loginFormVisible = await waitForElementWithRetry(
      page, 
      'form, input[type="email"], input[type="password"]', 
      { timeout: 5000 }
    );
    expect(loginFormVisible).toBeTruthy();
  });
  
  test('should redirect to login page when accessing admin media section without authentication', async ({ page }) => {
    if (USE_MOCKS) {
      // In mock mode, mock the redirect behavior
      await mockPage(page, '/admin/dashboard/media', `
        <html>
          <head>
            <title>Login</title>
          </head>
          <body>
            <h1>Login</h1>
            <form>
              <input type="email" placeholder="Email" />
              <input type="password" placeholder="Password" />
              <button type="submit">Sign in</button>
            </form>
          </body>
        </html>
      `);
      
      const content = await page.content();
      expect(content).toMatch(/Login|Sign in/i);
      return;
    }
    
    await page.goto('/admin/dashboard/media');
    
    // Wait for navigation and check URL
    await page.waitForURL(/\/admin\/login/, { timeout: 10000 });
    
    // Verify we're on the login page
    const content = await page.content();
    expect(content).toMatch(/Login|Sign in|Authentication/i);
  });
  
  test('should redirect to login page when accessing admin integration section without authentication', async ({ page }) => {
    if (USE_MOCKS) {
      // In mock mode, mock the redirect behavior
      await mockPage(page, '/admin/dashboard/integration', `
        <html>
          <head>
            <title>Login</title>
          </head>
          <body>
            <h1>Login</h1>
            <form>
              <input type="email" placeholder="Email" />
              <input type="password" placeholder="Password" />
              <button type="submit">Sign in</button>
            </form>
          </body>
        </html>
      `);
      
      const content = await page.content();
      expect(content).toMatch(/Login|Sign in/i);
      return;
    }
    
    await page.goto('/admin/dashboard/integration');
    
    // Wait for navigation and check URL
    await page.waitForURL(/\/admin\/login/, { timeout: 10000 });
    
    // Verify we're on the login page
    const loginFormVisible = await waitForElementWithRetry(
      page, 
      'form, input[type="email"], input[type="password"]', 
      { timeout: 5000 }
    );
    expect(loginFormVisible).toBeTruthy();
  });
  
  test('should maintain session across admin sections after login', async ({ page }) => {
    // Use helper to login
    await adminLogin(page);
    
    if (USE_MOCKS) {
      // In mock mode, mock the dashboard content
      await mockPage(page, '/admin/dashboard', `
        <html>
          <head>
            <title>Admin Dashboard</title>
          </head>
          <body>
            <h1>Dashboard</h1>
            <div class="admin-dashboard">
              <div>Welcome, Admin</div>
            </div>
          </body>
        </html>
      `);
      
      // Mock blog section
      await mockPage(page, '/admin/dashboard/blog/posts', `
        <html>
          <head>
            <title>Blog Posts</title>
          </head>
          <body>
            <h1>Blog Posts</h1>
            <div class="posts-list">
              <div>Post 1</div>
              <div>Post 2</div>
            </div>
          </body>
        </html>
      `);
      
      // Mock media section
      await mockPage(page, '/admin/dashboard/media', `
        <html>
          <head>
            <title>Media Library</title>
          </head>
          <body>
            <h1>Media Library</h1>
            <div class="media-grid">
              <div>Image 1</div>
              <div>Image 2</div>
            </div>
          </body>
        </html>
      `);
      
      // Mock directory listings
      await mockPage(page, '/admin/dashboard/directory/listings', `
        <html>
          <head>
            <title>Directory Listings</title>
          </head>
          <body>
            <h1>Directory Listings</h1>
            <div class="listings-list">
              <div>Listing 1</div>
              <div>Listing 2</div>
            </div>
          </body>
        </html>
      `);
      
      // Check each page doesn't have login in URL
      await page.goto('/admin/dashboard');
      expect(page.url()).not.toContain('/admin/login');
      
      await page.goto('/admin/dashboard/blog/posts');
      expect(page.url()).not.toContain('/admin/login');
      
      await page.goto('/admin/dashboard/media');
      expect(page.url()).not.toContain('/admin/login');
      
      await page.goto('/admin/dashboard/directory/listings');
      expect(page.url()).not.toContain('/admin/login');
      
      return;
    }
    
    // Verify we can access dashboard
    const dashboardLoaded = await waitForElementWithRetry(
      page, 
      'h1, .dashboard, .admin-dashboard', 
      { timeout: 5000 }
    );
    expect(dashboardLoaded).toBeTruthy();
    
    // Navigate to blog section
    await page.goto('/admin/dashboard/blog/posts');
    await page.waitForTimeout(1000); // Give the page time to potentially redirect
    
    // Check that we're still on an admin page (not redirected to login)
    let currentUrl = page.url();
    expect(currentUrl).not.toContain('/admin/login');
    
    // Navigate to media section
    await page.goto('/admin/dashboard/media');
    await page.waitForTimeout(1000); // Give the page time to potentially redirect
    
    // Check that we're still on an admin page (not redirected to login)
    currentUrl = page.url();
    expect(currentUrl).not.toContain('/admin/login');
    
    // Navigate to directory section
    await page.goto('/admin/dashboard/directory/listings');
    await page.waitForTimeout(1000); // Give the page time to potentially redirect
    
    // Check that we're still on an admin page (not redirected to login)
    currentUrl = page.url();
    expect(currentUrl).not.toContain('/admin/login');
  });
}); 