import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

import "bootstrap/dist/css/bootstrap.min.css";

export const metadata: Metadata = {
  title: "NPM visualier",
  description: "Explore the secrets of package-lock",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
