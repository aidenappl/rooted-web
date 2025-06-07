import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Rooted - Find local Nonprofits",
  description:
    "Rooted is a platform that connects you with local nonprofits in your area, making it easy to find and support causes that matter to you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[var(--background)]">
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}
