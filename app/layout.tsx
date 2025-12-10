import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 1. Import the Language Provider we just created
import { LanguageProvider } from "../context/LanguageContext"; 
import PixelScripts from '../components/PixelScripts';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TeachersB - Find the Best Tutors", // I updated the title for you
  description: "The #1 Marketplace for English Teachers and Students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 2. Wrap the children with the Provider */}
        <LanguageProvider>
           <PixelScripts />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}