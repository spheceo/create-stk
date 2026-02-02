import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Empty",
  description: "This is an empty project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
