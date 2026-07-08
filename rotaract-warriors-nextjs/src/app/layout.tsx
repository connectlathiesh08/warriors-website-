import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Echoes of the Warriors | Rotaract Bangalore Warriors",
  description: "Relive our journey through every project, celebration, and moment of service. Interactive 3D memory globe of Rotaract Bangalore Warriors.",
  keywords: ["Rotaract", "Rotaract Bangalore Warriors", "District 3192", "Service Above Self", "3D Memory Globe", "Three.js"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
