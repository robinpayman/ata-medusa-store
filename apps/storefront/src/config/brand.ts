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

  // Brand Colors - Professional athletic brand
  colors: {
    // Primary Colors
    primary: {
      50: "#f9fafb",   // Lightest
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",  // Main brand gray
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",  // Darkest
    },

    // Accent Colors - Professional athletic feel
    accent: {
      orange: "#ef6f3c",    // Energetic orange
      red: "#e63946",       // Safety red for important actions
      green: "#2ecc71",     // Success
      blue: "#1e40af",      // Trust/Professional
    },

    // Semantic Colors
    success: "#2ecc71",
    error: "#e63946",
    warning: "#f59e0b",
    info: "#1e40af",

    // Neutral
    white: "#ffffff",
    black: "#000000",
  },

  // Typography
  typography: {
    fontFamily: {
      display: "'Streetvertising', sans-serif",  // Brand font for headings
      body: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
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
