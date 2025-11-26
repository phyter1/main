import { Fira_Code, Fira_Mono, Fira_Sans } from "next/font/google";

export const firaMono = Fira_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-fira-mono",
  display: "swap",
});

export const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-fira-sans",
  display: "swap",
});

export const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-fira-code",
  display: "swap",
});
