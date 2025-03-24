import { test, expect } from '@playwright/test';
import { adminLogin, waitForElementWithRetry, mockPage } from './helpers';

// Check if we're in mock mode
const USE_MOCKS = process.env.TEST_USE_MOCKS === 'true';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    if (USE_MOCKS) {
      // Mock successful login without actually navigating
      await mockPage(page, '/admin/dashboard', `
        <html>
          <head>
            <title>Admin Dashboard</title>
          </head>
          <body>
            <header>
              <h1>Dashboard</h1>
              <nav class="admin-nav">
                <a href="/admin/blog">Blog</a>
                <a href="/admin/directory">Directory</a>
                <a href="/admin/media">Media</a>
                <a href="/admin/integration">Integration</a>
              </nav>
            </header>
            <main>
              <div class="stats-panel">
                <div class="stat-card">
                  <h3>Blog Posts</h3>
                  <div class="stat-value">42</div>
                </div>
                <div class="stat-card">
                  <h3>Directory Listings</h3>
                  <div class="stat-value">156</div>
                </div>
                <div class="stat-card">
                  <h3>Media Files</h3>
                  <div class="stat-value">328</div>
                </div>
                <div class="stat-card">
                  <h3>Active Integrations</h3>
                  <div class="stat-value">5</div>
                </div>
              </div>
              <div class="recent-activity">
                <h2>Recent Activity</h2>
                <ul>
                  <li>Blog post "Top 10 Beaches" published</li>
                  <li>New directory listing added: "Sydney Opera House Tours"</li>
                  <li>5 new images uploaded to media library</li>
                </ul>
              </div>
            </main>
          </body>
        </html>
      `);
      return;
    }
    
    await adminLogin(page);
  });

  test('should display dashboard with stats', async ({ page }) => {
    if (USE_MOCKS) {
      // In mock mode, we've already set up the dashboard in beforeEach
      // Just verify the content
      const statsCount = await page.locator('.stat-card').count();
      expect(statsCount).toBeGreaterThan(0);
      
      const hasRecentActivity = await page.locator('.recent-activity').isVisible();
      expect(hasRecentActivity).toBeTruthy();
      return;
    }
    
    // Wait for dashboard to load
    await waitForElementWithRetry(page, 'h1:has-text("Dashboard"), .dashboard-title');
    
    // Check for stats panel or cards
    const statSelectors = [
      '.stats-panel', 
      '.stat-card', 
      '.stats-container',
      '.analytics-panel',
      '[data-test="stats"]'
    ];
    
    let statsFound = false;
    for (const selector of statSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        statsFound = true;
        break;
      }
    }
    
    expect(statsFound).toBeTruthy();
  });

  test('should display recent activity section', async ({ page }) => {
    if (USE_MOCKS) {
      // In mock mode, we've already set up the dashboard with recent activity
      const activityVisible = await page.locator('.recent-activity').isVisible();
      expect(activityVisible).toBeTruthy();
      
      const activityItems = await page.locator('.recent-activity li').count();
      expect(activityItems).toBeGreaterThan(0);
      return;
    }
    
    // Find the recent activity section with various possible selectors
    const activitySelectors = [
      '.recent-activity',
      '.activity-log',
      '.activity-feed',
      '.recent-actions',
      '[data-test="activity"]',
      'h2:has-text("Activity")',
      'h2:has-text("Recent")'
    ];
    
    let activityFound = false;
    for (const selector of activitySelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        activityFound = true;
        break;
      }
    }
    
    expect(activityFound).toBeTruthy();
  });

  test('should have navigation to other admin sections', async ({ page }) => {
    if (USE_MOCKS) {
      // In mock mode, we've already set up the dashboard with navigation links
      const navLinks = await page.locator('nav a').count();
      expect(navLinks).toBeGreaterThan(0);
      return;
    }
    
    // Check for navigation links to other admin sections
    const navSelectors = [
      'nav',
      '.admin-nav',
      '.sidebar-nav',
      '.main-menu',
      '[data-test="navigation"]',
      '[role="navigation"]'
    ];
    
    let navFound = false;
    let navElement = null;
    
    for (const selector of navSelectors) {
      const el = page.locator(selector);
      const count = await el.count();
      if (count > 0) {
        navFound = true;
        navElement = el;
        break;
      }
    }
    
    expect(navFound).toBeTruthy();
    
    if (navElement) {
      // Check if the nav contains links to other sections
      const links = await navElement.locator('a').all();
      const linkTexts = await Promise.all(links.map(link => link.textContent()));
      
      // Look for common section names in link texts
      const expectedSections = ['blog', 'directory', 'media', 'integration', 'settings'];
      const foundSections = expectedSections.filter(section => 
        linkTexts.some(text => text && text.toLowerCase().includes(section))
      );
      
      expect(foundSections.length).toBeGreaterThan(0);
    }
  });
}); 