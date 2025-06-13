import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Rooted - Find local Nonprofits",
  icons: {
    icon: [
      { rel: "icon", url: "/favicon.ico" },
      { rel: "shortcut icon", url: "/favicon.ico" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
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
      <body
        className="bg-[var(--background)]"
        data-new-gr-c-s-check-loaded="14.1239.0"
        data-gr-ext-installed=""
      >
        <Navigation />
        <div className="px-10 max-w-[var(--max-page-width)] mx-auto">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
