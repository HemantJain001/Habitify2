import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import Providers from "@/components/Providers";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AttackMode",
  description: "A focused productivity system for tasks, habits, and growth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const omniSecret = process.env.NEXT_PUBLIC_OMNIDIMENSION_SECRET_KEY;

  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${syne.variable} antialiased`}>
        <Providers>
          <AuthProvider>{children}</AuthProvider>
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
