This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Testing

This project includes comprehensive testing for both the frontend and admin functionality.

### Frontend Tests

Frontend tests verify that the public-facing pages of the website load correctly and function as expected.

To run frontend tests:

```bash
# Run in real mode (app must be running)
./run-frontend-tests.sh

# Run in mock mode (no app required)
./run-frontend-tests.sh -m

# Run specific test file
./run-frontend-tests.sh tests/frontend/home.spec.ts
```

See [Frontend Tests README](tests/frontend/README.md) for more details.

### Admin Tests

Admin tests verify that the admin functionality (authentication, blog management, directory management, etc.) works correctly.

To run admin tests:

```bash
# Run all admin tests (app must be running)
./run-tests.sh

# Run in mock mode (no app required)
./run-tests-mock.sh

# Run specific test file
./run-tests.sh tests/admin/login.spec.ts
```

See [Admin Tests README](tests/README.md) for more details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
