import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "@/app/providers";
import { NavBar } from "@/components/layout/NavBar";
import { MeshBackground } from "@/components/ui/MeshBackground";

export const metadata: Metadata = {
  title: "TypeDuel | Real-Time Typing Battles",
  description: "A competitive 1v1 typing battle platform with server-authoritative matches."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <MeshBackground />
          <div className="pointer-events-none fixed inset-0 -z-10 arena-grid opacity-20" />
          <div className="scanline pointer-events-none fixed inset-0 -z-10" />
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
