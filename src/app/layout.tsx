import type { Metadata } from "next";
import "./globals.css";
import MainLayout from "@/components/MainLayout";

export const metadata: Metadata = {
  title: "NutriTrack - Stunting Growth Tracker",
  description: "Aplikasi pelacak pertumbuhan dan rekomendasi nutrisi untuk pencegahan stunting pada anak",
  keywords: ["stunting", "pertumbuhan anak", "nutrisi", "kesehatan anak", "growth tracker"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="antialiased">
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
