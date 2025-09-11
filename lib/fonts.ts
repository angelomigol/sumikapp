import {
  Outfit as OutfitFont,
  Teachers as TeachersFont,
} from "next/font/google";

/**
 * @sans
 * @description Define here the sans font.
 * By default, it uses the Outfit font from Google Fonts.
 */
const outfit = OutfitFont({
  subsets: ["latin"],
  variable: "--font-sans",
  fallback: ["system-ui", "Helvetica Neue", "Helvetica", "Arial"],
  preload: true,
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const teachers = TeachersFont({
  subsets: ["latin"],
  variable: "--font-teachers",
  fallback: ["system-ui", "Helvetica Neue", "Helvetica", "Arial"],
  preload: true,
  weight: ["400", "500", "600", "700", "800"],
});

/**
 * @heading
 * @description Define here the heading font.
 */
const heading = outfit;

// we export these fonts into the root layout
export { heading, outfit, teachers };
