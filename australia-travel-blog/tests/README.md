# Travel Blog Test Suite Documentation

This document outlines the testing approach and structure for the Travel Blog application.

## Test Organization

Tests are organized by feature area:

- `tests/admin/` - Tests for admin panel functionality
  - `auth.spec.ts` - Authentication and authorization tests
  - `login.spec.ts` - Admin login tests
  - `dashboard.spec.ts` - Dashboard functionality tests
  - `blog.spec.ts` - Blog administration tests
  - `directory.spec.ts` - Directory administration tests
  - `media.spec.ts` - Media management tests
  - `integration.spec.ts` - API integration tests
  - `helpers.ts` - Shared test helper functions

## Running Tests

### Using npm Scripts

```bash
# Run all admin tests
npm run test:admin

# Run specific test file
npm run test:admin -- tests/admin/login.spec.ts

# Run tests in mock mode (no app server needed)
npm run test:admin:mock

# Run specific test file in mock mode
npm run test:admin:mock -- tests/admin/login.spec.ts
```

### Using Shell Scripts

We provide convenient shell scripts for running tests:

```bash
# Run all tests (requires app to be running)
./run-tests.sh 

# Run specific test file (requires app to be running)
./run-tests.sh tests/admin/login.spec.ts

# Run all tests in mock mode (no app server needed)
./run-mock-tests.sh

# Run specific test file in mock mode
./run-mock-tests.sh tests/admin/login.spec.ts
```

## Testing Modes

### Normal Mode

In normal mode, tests interact with a running instance of the application. The app must be started before running tests:

```bash
# Start the app in one terminal
npm run dev

# Run tests in another terminal
./run-tests.sh
```

### Mock Mode

Mock mode allows tests to run without an actual app instance. This is useful for:

- CI/CD environments
- Development when the app is not ready or has build errors
- Isolating test failures from application issues

In mock mode:
- Tests use simulated HTML content instead of real pages
- API calls are intercepted and mocked
- Local storage operations are simulated
- Navigation is mocked using data URLs

To run tests in mock mode:

```bash
./run-mock-tests.sh
```

## Test Design Principles

### Resilience

Tests use multiple strategies to find elements:
- Multiple selectors for each element
- Fallback mechanisms if elements are not found
- Content-based checks as a last resort

### Isolation

Each test is designed to work independently:
- Tests manage their own state
- No dependencies between test cases
- Mock mode provides complete isolation from the real app

### Readability

- Helper functions abstract common operations
- Consistent patterns across test files
- Detailed logging for debugging

### Flexibility

- Tests work in both normal and mock modes
- Environment variables control behavior
- Configurable timeouts and retry strategies

## Adding New Tests

1. Create a new `.spec.ts` file in the appropriate directory
2. Import necessary helper functions from `helpers.ts`
3. Follow existing patterns for test structure
4. Ensure tests work in both normal and mock modes

Example:

```typescript
import { test, expect } from '@playwright/test';
import { adminLogin, mockPage } from './helpers';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const USE_MOCKS = process.env.TEST_USE_MOCKS === 'true';

test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    if (USE_MOCKS) {
      // Mock setup
      await mockPage(page, '/route', '<mock html>');
    } else {
      // Normal mode
      await page.goto(`${BASE_URL}/route`);
    }
    
    // Test logic
  });
});
```

## Troubleshooting

### Tests Fail in Normal Mode But Pass in Mock Mode

- Check if the app is running correctly
- Verify that selectors match the actual app HTML
- Increase timeouts for slower environments

### Errors in Mock Mode

- Ensure HTML content in mocks is valid
- Check for proper event handlers in mocked forms
- Verify routes are correctly mocked

### TypeScript Compilation Errors

- Run tests using `npx playwright test` directly to bypass TS errors
- Fix type issues in test files if needed 