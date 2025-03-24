#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Starting Admin Tests ===${NC}"

# Default to not using mocks
USE_MOCKS=${USE_MOCKS:-false}

# Parse arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --mock) USE_MOCKS=true;;
    *) echo "Unknown parameter: $1"; exit 1;;
  esac
  shift
done

if [ "$USE_MOCKS" = "true" ]; then
  echo -e "${YELLOW}Running tests in mock mode - will not start application${NC}"
  # Run tests with mock environment variable
  echo -e "${GREEN}Running admin tests with mocks...${NC}"
  TEST_USE_MOCKS=true npx playwright test tests/admin/ --project=chromium
  TEST_EXIT_CODE=$?
else
  # Check if the app is already running
  if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}App is already running.${NC}"
    APP_STARTED=false
  else
    echo -e "${YELLOW}Starting Next.js app...${NC}"
    
    # First check if the app has build errors
    npm run build --quiet 2>&1 | grep -i "error" > /dev/null
    if [ $? -eq 0 ]; then
      echo -e "${RED}Build errors detected. Please fix the errors before running tests.${NC}"
      echo -e "${YELLOW}Running tests in mock mode instead...${NC}"
      TEST_USE_MOCKS=true npx playwright test tests/admin/ --project=chromium
      TEST_EXIT_CODE=$?
      exit $TEST_EXIT_CODE
    fi
    
    # Start the app and save the PID
    npm run dev > /dev/null 2>&1 &
    APP_PID=$!
    APP_STARTED=true
    
    # Give the app time to start
    echo -e "${YELLOW}Waiting for app to start...${NC}"
    RETRY_COUNT=0
    MAX_RETRIES=30
    RETRY_INTERVAL=1
    
    while ! curl -s http://localhost:3000 > /dev/null && [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
      sleep $RETRY_INTERVAL
      RETRY_COUNT=$((RETRY_COUNT+1))
      echo -n "."
    done
    
    echo ""
    
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
      echo -e "${RED}App failed to start after ${MAX_RETRIES} retries.${NC}"
      echo -e "${YELLOW}Running tests in mock mode instead...${NC}"
      if [ "$APP_STARTED" = "true" ]; then
        kill $APP_PID
      fi
      TEST_USE_MOCKS=true npx playwright test tests/admin/ --project=chromium
      TEST_EXIT_CODE=$?
    else
      echo -e "${GREEN}App is now running.${NC}"
    fi
  fi
  
  # Run the tests
  if [ "$USE_MOCKS" = "false" ] && [ $RETRY_COUNT -ne $MAX_RETRIES ]; then
    echo -e "${GREEN}Running admin tests...${NC}"
    npx playwright test tests/admin/ --project=chromium
    TEST_EXIT_CODE=$?
  fi
  
  # If we started the app, shut it down
  if [ "$APP_STARTED" = "true" ]; then
    echo -e "${YELLOW}Shutting down Next.js app...${NC}"
    kill $APP_PID
  fi
fi

# Print test results
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
else
  echo -e "${RED}Some tests failed with exit code: ${TEST_EXIT_CODE}${NC}"
fi

echo -e "${YELLOW}=== Admin Tests Completed ===${NC}"

exit $TEST_EXIT_CODE 