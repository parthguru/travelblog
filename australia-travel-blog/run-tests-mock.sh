#!/bin/bash

# Define colors for output messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running tests in MOCK mode...${NC}"
echo -e "${YELLOW}No application will be started - tests use mock responses${NC}"

# Check if specific test files were provided
if [ $# -gt 0 ]; then
  TEST_FILES="$@"
  echo -e "${GREEN}Running specific test files: ${TEST_FILES}${NC}"
  
  # Make sure TypeScript is compiled first
  echo -e "${BLUE}Compiling TypeScript files...${NC}"
  npx tsc --noEmit || {
    echo -e "${RED}TypeScript compilation failed. Fix errors before running tests.${NC}"
    exit 1
  }
  
  # Run the tests with debugging enabled
  echo -e "${GREEN}Starting tests with debugging...${NC}"
  TEST_USE_MOCKS=true npx playwright test ${TEST_FILES} --project=chromium
else
  echo -e "${GREEN}Running all admin tests${NC}"
  
  # Make sure TypeScript is compiled first
  echo -e "${BLUE}Compiling TypeScript files...${NC}"
  npx tsc --noEmit || {
    echo -e "${RED}TypeScript compilation failed. Fix errors before running tests.${NC}"
    exit 1
  }
  
  # Run the tests
  npm run test:admin:mock
fi

# Report test completion
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}Tests completed successfully!${NC}"
else
  echo -e "${RED}Tests failed with exit code ${TEST_EXIT_CODE}${NC}"
  
  # Provide some advice on common issues
  echo -e "${YELLOW}Common issues:${NC}"
  echo -e "1. ${BLUE}TypeScript errors${NC} - Make sure all type definitions are correct"
  echo -e "2. ${BLUE}Timeout errors${NC} - Check if selectors are working correctly"
  echo -e "3. ${BLUE}Mock routes${NC} - Ensure mockPage function is handling routes correctly"
  echo -e "4. ${BLUE}localStorage errors${NC} - These can be ignored in headless mode"
  
  echo -e "${GREEN}Try running a single test file with: ./run-tests-mock.sh tests/admin/login.spec.ts${NC}"
fi

exit $TEST_EXIT_CODE 