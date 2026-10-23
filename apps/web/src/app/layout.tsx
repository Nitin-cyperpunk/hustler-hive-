import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://hustlershive.in"
  ),
  title: {
    default: "Hustlers Hive — Built by students. For students. Run by students.",
    template: "%s | Hustlers Hive",
  },
  description:
    "A student-driven technology community based in Nashik, Maharashtra — organizing tech meetups, hackathons, workshops, and open-source collaborations.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Hustlers Hive",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-brand-bg text-brand-text antialiased">
        {children}
      </body>
    </html>
  );
}
