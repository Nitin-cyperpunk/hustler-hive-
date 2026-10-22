import { Metadata } from "next";
import { DemoContent } from "./demo-content";

export const metadata: Metadata = {
  title: "Design System Demo — Hustlers Hive",
  robots: "noindex",
};

export default function DemoPage() {
  return <DemoContent />;
}
