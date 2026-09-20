import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";

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
      <body className="antialiased font-sans bg-[#000000] text-foreground min-h-screen selection:bg-[#0ab1ba]/30">
        {children}
      </body>
    </html>
  );
}
