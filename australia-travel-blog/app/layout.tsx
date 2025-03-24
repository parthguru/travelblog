import type { Metadata } from "next";
import { Inter, Poppins, Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";

// Body font
const inter = Inter({ subsets: ["latin"] });

// Heading font
const montserrat = Montserrat({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-montserrat",
});

// Display font for hero sections and large headings
const playfair = Playfair_Display({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-playfair",
});

// UI font
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Australia Travel Blog | Explore the Land Down Under",
  description: "Discover breathtaking landscapes, vibrant cities, and authentic local experiences with our comprehensive Australia travel guides and insider tips.",
  keywords: "Australia travel, Australian destinations, travel blog, travel guide, Sydney, Melbourne, Great Ocean Road",
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://australiatravelblog.com",
    title: "Australia Travel Blog | Explore the Land Down Under",
    description: "Discover breathtaking landscapes, vibrant cities, and authentic local experiences with our comprehensive Australia travel guides and insider tips.",
    siteName: "Australia Travel Blog",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the Google Analytics Measurement ID from environment variables
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
  
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${inter.className} ${poppins.variable} ${montserrat.variable} ${playfair.variable} antialiased`}>
        {/* Google Analytics */}
        <GoogleAnalytics GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />
        
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
