import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DYAD — Transit Pre-Feasibility War Room",
  description:
    "Google Maps on steroids for urban transit planners. Instant spatial catchment, TomTom commute deltas, and an authority-grade feasibility dossier for Bengaluru metro corridors.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
