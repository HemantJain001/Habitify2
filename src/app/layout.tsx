import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import Providers from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AttackMode - Productivity App",
  description: "A personal productivity app to track tasks, habits, and growth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const omniSecret = process.env.NEXT_PUBLIC_OMNIDIMENSION_SECRET_KEY;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>

        {omniSecret ? (
          <script
            id="omnidimension-web-widget"
            async
            src={`https://backend.omnidim.io/web_widget.js?secret_key=${omniSecret}`}
          />
        ) : null}
      </body>
    </html>
  );
}
