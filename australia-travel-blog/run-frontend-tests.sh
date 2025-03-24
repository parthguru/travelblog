#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
USE_MOCKS=false
TEST_PATH="tests/frontend"
APP_URL="http://localhost:3000"

# Help function
function show_help {
  echo -e "${BLUE}Travel Blog Frontend Test Runner${NC}"
  echo -e "Usage: $0 [options] [test_file]"
  echo -e ""
  echo -e "Options:"
  echo -e "  -h, --help           Show this help message"
  echo -e "  -m, --mock           Run tests in mock mode (no app required)"
  echo -e "  -u, --url URL        Specify the app URL (default: $APP_URL)"
  echo -e ""
  echo -e "Examples:"
  echo -e "  $0                           # Run all frontend tests with real app"
  echo -e "  $0 -m                        # Run all frontend tests in mock mode"
  echo -e "  $0 tests/frontend/home.spec.ts # Run specific test file"
  echo -e ""
}

# Parse arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
    -h|--help) show_help; exit 0 ;;
    -m|--mock) USE_MOCKS=true ;;
    -u|--url) APP_URL="$2"; shift ;;
    *) 
      if [[ -f "$1" ]]; then
        TEST_PATH="$1"
      else
        echo -e "${RED}Unknown parameter: $1${NC}"
        show_help
        exit 1
      fi
      ;;
  esac
  shift
done

# Title
echo -e "${BLUE}===================================${NC}"
echo -e "${BLUE}  Travel Blog Frontend Test Runner ${NC}"
echo -e "${BLUE}===================================${NC}"

# Show test configuration
echo -e "${YELLOW}Test Configuration:${NC}"
if [ "$USE_MOCKS" = true ]; then
  echo -e "- Mode: ${GREEN}Mock${NC} (No app required)"
else
  echo -e "- Mode: ${GREEN}Real${NC} (App must be running at $APP_URL)"
  
  # Check if app is running (only in real mode)
  echo -e "${YELLOW}Checking if app is running...${NC}"
  if curl -s --head --request GET $APP_URL | grep "200" > /dev/null; then
    echo -e "${GREEN}✓ App is running at $APP_URL${NC}"
  else
    echo -e "${RED}✗ App is not running at $APP_URL${NC}"
    echo -e "${YELLOW}Please start the app or use mock mode with -m flag${NC}"
    echo -e "${YELLOW}To start the app, run:${NC}"
    echo -e "  cd $(dirname "$0") && npm run dev"
    echo -e "${YELLOW}Or run tests in mock mode:${NC}"
    echo -e "  $0 -m"
    exit 1
  fi
fi

echo -e "- Test path: ${GREEN}$TEST_PATH${NC}"

# Run the tests
echo -e "${YELLOW}Running tests...${NC}"

# Set environment variables for the test
if [ "$USE_MOCKS" = true ]; then
  TEST_USE_MOCKS=true npx playwright test $TEST_PATH --workers=5
else
  TEST_USE_MOCKS=false npx playwright test $TEST_PATH --workers=5
fi

# Check exit code
EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
else
  echo -e "${RED}✗ Some tests failed!${NC}"
fi

exit $EXIT_CODE 