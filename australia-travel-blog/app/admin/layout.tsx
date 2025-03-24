'use client';

import { Providers } from '../providers';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Providers>
        {children}
      </Providers>
    </div>
  );
}
