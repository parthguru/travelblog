# Travel Blog Frontend Tests

This directory contains frontend tests for the Travel Blog website. The tests are designed to verify that the frontend of the website is working correctly, including checking that pages load correctly and that links function as expected.

## Test Structure

The tests are organized by page or feature:

- `home.spec.ts`: Tests for the homepage
- `blog.spec.ts`: Tests for the blog page
- `directory.spec.ts`: Tests for the directory page
- `about-contact.spec.ts`: Tests for the about and contact pages
- `helpers.ts`: Helper functions used across all tests

## Running Tests

The tests can be run in two modes:

### Real Mode

In real mode, the tests will interact with the actual running application. This is useful for verifying that the application is working correctly in a real environment.

To run tests in real mode, first start the application:

```bash
npm run dev
```

Then, in a separate terminal, run the tests:

```bash
# Run all frontend tests
./run-frontend-tests.sh

# Run a specific test file
./run-frontend-tests.sh tests/frontend/home.spec.ts
```

### Mock Mode

In mock mode, the tests will use mock data and will not require the application to be running. This is useful for rapid development and CI/CD environments.

To run tests in mock mode:

```bash
# Run all frontend tests in mock mode
./run-frontend-tests.sh -m

# Run a specific test file in mock mode
./run-frontend-tests.sh -m tests/frontend/home.spec.ts
```

## How Mock Mode Works

Mock mode works by:

1. Setting the `TEST_USE_MOCKS` environment variable to `true`
2. Using the `mockPage` function to create a mock page for each test
3. Using pre-defined HTML templates for each page in the `getMockHtmlForRoute` function
4. Simulating navigation without actually loading real pages

The mock HTML templates include:
- Basic page structure (header, main content, footer)
- Navigation links
- Page-specific content (blog posts, directory listings, etc.)
- Forms and interactive elements

## Adding New Tests

To add new tests for a page or feature:

1. Create a new test file with a descriptive name, e.g., `feature-name.spec.ts`
2. Import the required functions from `helpers.ts`:
   ```typescript
   import { mockPage, waitForElementWithRetry, checkAllLinks, getMockHtmlForRoute } from './helpers';
   ```
3. Set up the mock mode check:
   ```typescript
   const USE_MOCKS = process.env.TEST_USE_MOCKS === 'true';
   ```
4. Create test cases that work in both real and mock mode:
   ```typescript
   test('should load the page successfully', async ({ page }) => {
     if (USE_MOCKS) {
       console.log('Using mock mode for test');
       await mockPage(page, '/route', getMockHtmlForRoute('/route'));
     } else {
       await page.goto('http://localhost:3000/route');
     }
     
     // Test assertions here
   });
   ```
5. Add mock HTML for the new route in the `getMockHtmlForRoute` function in `helpers.ts`

## Best Practices

When writing frontend tests:

1. Always check basic page elements (header, main content, footer)
2. Verify that navigation links exist and work
3. Check for page-specific content and functionality
4. Use resilient selectors that work with various page structures
5. Add proper error handling and logging
6. Make tests work in both real and mock modes
7. Use descriptive test names and comments

## Troubleshooting

If tests are failing:

- Check if the application is running (for real mode)
- Verify that selectors match the actual HTML structure
- Check console output for error messages
- Run tests with the `--debug` flag for more detailed output
- Try running in mock mode to isolate issues 