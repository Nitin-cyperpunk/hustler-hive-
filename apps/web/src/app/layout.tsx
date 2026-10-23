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
  process.env.NEXT_PUBLIC_SITE_URL || "https://hustler-hive-ten.vercel.app";

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
    icon: "/logo/logo-dark.png",
    apple: "/logo/logo-dark.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Hustlers Hive",
    title: "Hustlers Hive | Student Tech Community in Nashik",
    description:
      "A student-driven technology community in Nashik — learn, build, collaborate, and attend tech events.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Hustlers Hive | Student Tech Community in Nashik",
    description:
      "A student-driven technology community in Nashik — learn, build, collaborate, and attend tech events.",
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
