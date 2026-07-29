/**
 * ata treningsutstyr Brand Configuration
 * 
 * Centralized brand settings for consistency across the storefront
 */

export const BRAND = {
  name: "ata treningsutstyr",
  tagline: "Utstyr til din trening!",
  description: "Kvalitet, service og kompetanse siden 2014",
  
  // Brand Assets
  assets: {
    logoBlack: "/assets/branding/ata-logo.png",
    logoWhite: "/assets/branding/ata-logo-white.png",
  },

  // Brand Colors - Professional athletic brand with black, white, and blue CTA
  colors: {
    // Primary Colors - Neutral palette for professional athletic brand
    primary: {
      50: "#f9fafb",   // Lightest
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",  // Medium gray
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",  // Dark gray
    },

    // Core brand colors
    black: "#000000",
    white: "#ffffff",

    // Call-to-action and accent colors
    accent: {
      blue: "#1e40af",      // Primary CTA blue - trust and professional
      lightBlue: "#3b82f6", // Secondary blue for hover states
      darkBlue: "#1e3a8a",  // Dark blue for active states
      orange: "#f97316",    // Alternative CTA (secondary)
    },

    // Semantic Colors
    success: "#22c55e",
    error: "#ef4444",
    warning: "#eab308",
    info: "#1e40af",
  },

  // Typography
  typography: {
    fontFamily: {
      display: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",  // System fonts for headings
      body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",  // System fonts for body
    },

    sizes: {
      h1: "3rem",
      h2: "2.25rem",
      h3: "1.875rem",
      h4: "1.5rem",
      h5: "1.25rem",
      h6: "1rem",
      body: "1rem",
      small: "0.875rem",
      xs: "0.75rem",
    },

    weights: {
      light: 300,
      normal: 400,
      semibold: 600,
      bold: 700,
    },
  },

  // Spacing System
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },

  // Contact Information
  contact: {
    address: "Nye Vakås vei 6, Asker, Norway",
    phone: "+47 32 82 84 00", // Example - update with actual
    email: "post@atatreningsutstyr.no",
    website: "https://www.atatreningsutstyr.no",
  },

  // Company Info
  company: {
    founded: 2014,
    taglineShort: "Trening for alle",
    features: [
      {
        title: "Kvalitet",
        description: "Profesjonelt utstyr som tåler hard bruk",
      },
      {
        title: "Service",
        description: "Dedikert kundeservice og support",
      },
      {
        title: "Kompetanse",
        description: "Ekspertråd fra erfarne trenere",
      },
    ],
  },

  // SEO
  seo: {
    siteName: "ata treningsutstyr",
    locale: "no_NO",
  },
}

export default BRAND
