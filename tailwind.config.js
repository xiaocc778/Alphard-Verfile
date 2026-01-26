/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: "1rem",
                sm: "1.25rem",
                lg: "1.5rem",
                xl: "2rem",
            },
            screens: {
                "2xl": "1440px",
            },
        },
        extend: {
            colors: {
                // Toyota AU-inspired light palette
                background: "#FFFFFF",
                surface: "#F7F7F7",
                brand: {
                    DEFAULT: "#EB0A1E", // Toyota Red
                    600: "#EB0A1E",
                    700: "#C90818",
                },
                text: {
                    heading: "#1A1A1A",
                    body: "#4A4A4A",
                    muted: "#6B6B6B",
                },
            },
            fontFamily: {
                sans: [
                    "Inter",
                    "Roboto",
                    "ui-sans-serif",
                    "system-ui",
                    "-apple-system",
                    "Segoe UI",
                    "Helvetica",
                    "Arial",
                    "sans-serif",
                ],
            },
            maxWidth: {
                site: "1440px",
            },
        },
    },
    plugins: [],
}