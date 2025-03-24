/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "sm": "640px",
        "md": "768px",
        "lg": "1024px",
        "xl": "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Australia-inspired colors
        ocean: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        outback: {
          50: "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#facc15",
          500: "#eab308",
          600: "#ca8a04",
          700: "#a16207",
          800: "#854d0e",
          900: "#713f12",
        },
        eucalyptus: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        heading: ["var(--font-montserrat)"],
        display: ["var(--font-playfair)"],
        ui: ["var(--font-poppins)"],
      },
      fontSize: {
        '4.5xl': '2.5rem',
        '5.5xl': '3.5rem',
      },
      height: {
        '128': '32rem',
        '144': '36rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "fade-out": {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        "slide-in-bottom": {
          from: { transform: "translateY(20px)", opacity: 0 },
          to: { transform: "translateY(0)", opacity: 1 },
        },
        "slide-in-right": {
          from: { transform: "translateX(20px)", opacity: 0 },
          to: { transform: "translateX(0)", opacity: 1 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-out": "fade-out 0.5s ease-out",
        "slide-in-bottom": "slide-in-bottom 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.5s ease-out",
      },
      backgroundImage: {
        'hero-pattern': "linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3), rgba(0,0,0,0))",
        'card-gradient': "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.3), rgba(0,0,0,0))",
      },
    },
  },
  plugins: [
    // Using dynamic import for ESM compatibility
    function({ addBase, addComponents }) {
      addBase({
        '.animate-accordion-down': { animation: 'accordion-down 0.2s ease-out' },
        '.animate-accordion-up': { animation: 'accordion-up 0.2s ease-out' },
        'h1, h2, h3, h4, h5, h6': { fontFamily: 'var(--font-montserrat)' },
        'h1': { fontWeight: '700' },
        'h2': { fontWeight: '600' },
        '.hero-heading': { fontFamily: 'var(--font-playfair)' },
      });
      
      // Add custom components
      addComponents({
        '.hero-section': {
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          paddingTop: '6rem',
          paddingBottom: '6rem',
          '@screen md': {
            paddingTop: '8rem',
            paddingBottom: '8rem',
          },
          '@screen lg': {
            paddingTop: '10rem',
            paddingBottom: '10rem',
          },
        },
        '.card-hover': {
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
        },
      });
    },
  ],
}
