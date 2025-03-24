"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <ToastContainer position="top-right" autoClose={5000} />
        {children}
      </SessionProvider>
    </ThemeProvider>
  );
}

export default Providers;
