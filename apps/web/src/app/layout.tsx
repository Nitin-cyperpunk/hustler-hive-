import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://hustlerhive.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Hustlers Hive | Student Tech Community in Nashik",
    template: "%s | Hustlers Hive",
  },
  description:
    "Hustlers Hive is a student-driven technology community in Nashik, Maharashtra, bringing students together to learn, build projects, collaborate on open source, and attend tech events.",
  keywords: [
    "Hustlers Hive",
    "student tech community Nashik",
    "Nashik tech events",
    "student hackathons Nashik",
    "open source community Nashik",
    "technology workshops for students",
  ],
  icons: {
    icon: "/logo/Hustlers Hive (3).png",
    apple: "/logo/Hustlers Hive (3).png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Hustlers Hive",
    title: "Hustlers Hive | Ideas Meet Impact",
    description:
      "Discover Hustlers Hive, a student-driven technology community in Nashik, Maharashtra. Learn together, build projects, explore open source, and connect with fellow student technologists.",
    url: SITE_URL,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Hustlers Hive — student-driven technology community in Nashik",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hustlers Hive | Ideas Meet Impact",
    description:
      "Discover Hustlers Hive, a student-driven technology community in Nashik, Maharashtra. Learn together, build projects, explore open source, and connect with fellow student technologists.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Hustlers Hive — student-driven technology community in Nashik",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
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
        <Analytics />
      </body>
    </html>
  );
}
