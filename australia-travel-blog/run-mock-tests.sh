#!/bin/bash

# Define color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Running Tests in Mock Mode ===${NC}"
echo -e "${YELLOW}No app server or database needed!${NC}"

# Set environment variable for mock mode
export TEST_USE_MOCKS=true
export TEST_BASE_URL="http://localhost:3000"

# Get the target test file from argument or run all tests
TEST_TARGET="${1:-tests/admin}"

# Run the tests using Playwright directly to bypass TypeScript errors
echo -e "${GREEN}Running tests: ${TEST_TARGET}${NC}"
cd $(dirname "$0") && npx playwright test ${TEST_TARGET} "$@"

# Check exit code
EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed in mock mode!${NC}"
else
  echo -e "${RED}✗ Some tests failed in mock mode.${NC}"
  echo -e "${YELLOW}Common issues:${NC}"
  echo -e "1. Make sure you have proper mock setup in the test file"
  echo -e "2. Check that your selectors are matching the mock HTML"
  echo -e "3. Verify that event handlers are working correctly"
fi

exit $EXIT_CODE 