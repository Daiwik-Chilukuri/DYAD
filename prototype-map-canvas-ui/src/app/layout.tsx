import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MetroPulse AI Command Center",
  description: "Google Maps on Steroids for Urban Transit Planners",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased font-sans bg-background text-foreground overflow-hidden selection:bg-primary/30">
        {children}
      </body>
    </html>
  );
}
