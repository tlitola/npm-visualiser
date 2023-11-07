import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./bootstrap_extended.css";
import type { Metadata } from "next";

import { open_sans } from "./fonts";

export const metadata: Metadata = {
  title: "NPM visualizer",
  description: "Explore the secrets of package-lock",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${open_sans.variable} font-sans`}>{children}</body>
    </html>
  );
}
