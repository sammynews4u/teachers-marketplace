import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "../context/LanguageContext"; 
import PixelScripts from '../components/PixelScripts';
import { Suspense } from "react"; // <--- NEW IMPORT

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TeachersB - Find the Best Tutors", 
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
        <LanguageProvider>
           {/* Wrap PixelScripts in Suspense to fix the build error */}
           <Suspense fallback={null}>
             <PixelScripts />
           </Suspense>
           
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}