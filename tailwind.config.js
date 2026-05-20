/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface": "#f5faff",
        "outline-variant": "#bdc8d1",
        "on-secondary": "#ffffff",
        "on-error": "#ffffff",
        "inverse-on-surface": "#edf1f6",
        "surface-container-lowest": "#ffffff",
        "tertiary-container": "#db8918",
        "on-surface-variant": "#3e484f",
        "on-tertiary-fixed-variant": "#683d00",
        "primary": "#00658a",
        "on-tertiary-container": "#4d2c00",
        "primary-container": "#00a7e1",
        "primary-fixed-dim": "#7cd0ff",
        "on-primary-fixed": "#001e2c",
        "inverse-surface": "#2c3135",
        "surface-container-low": "#eff4f9",
        "inverse-primary": "#7cd0ff",
        "on-secondary-container": "#6d6234",
        "surface-variant": "#dee3e8",
        "secondary-fixed-dim": "#d5c68e",
        "on-secondary-fixed": "#211b00",
        "on-error-container": "#93000a",
        "surface-container": "#eaeef3",
        "secondary": "#695e30",
        "surface-bright": "#f5faff",
        "on-secondary-fixed-variant": "#50471b",
        "on-surface": "#171c20",
        "background": "#f5faff",
        "on-tertiary-fixed": "#2c1700",
        "on-primary-container": "#00384e",
        "on-background": "#171c20",
        "primary-fixed": "#c4e7ff",
        "surface-container-highest": "#dee3e8",
        "tertiary-fixed-dim": "#ffb86a",
        "secondary-container": "#efe0a6",
        "tertiary-fixed": "#ffdcbc",
        "tertiary": "#885200",
        "on-primary": "#ffffff",
        "surface-dim": "#d6dadf",
        "on-primary-fixed-variant": "#004c69",
        "error-container": "#ffdad6",
        "error": "#ba1a1a",
        "surface-tint": "#00658a",
        "outline": "#6e7880",
        "secondary-fixed": "#f2e2a8",
        "on-tertiary": "#ffffff",
        "surface-container-high": "#e4e9ee"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "margin": "32px",
        "base": "8px",
        "gutter": "24px",
        "container-max-width": "1280px"
      },
      fontFamily: {
        "code-md": ["JetBrains Mono"],
        "label-sm": ["JetBrains Mono"],
        "headline-lg": ["Inter"],
        "display-lg": ["Inter"],
        "headline-lg-mobile": ["Inter"],
        "body-md": ["Inter"]
      },
      fontSize: {
        "code-md": ["14px", { "lineHeight": "20px", "fontWeight": "500" }],
        "label-sm": ["12px", { "lineHeight": "16px", "fontWeight": "600" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "headline-lg-mobile": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
