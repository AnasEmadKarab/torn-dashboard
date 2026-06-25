// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Habibi Dashboard",
  description: "Real-time stats, faction, travel, and Xanax market intelligence for Torn City.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
        <footer className="text-center py-6 text-gray-500 text-lg font-mono border-t border-white/5 mt-10">
          Made By Anas 
        </footer>
      </body>
    </html>
  );
}