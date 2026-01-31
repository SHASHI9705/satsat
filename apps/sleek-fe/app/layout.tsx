"use client"

import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "../firebase/AuthProvider";
import { useEffect } from "react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").then(
        (registration) => {
          console.log("Service Worker registered with scope:", registration.scope);
        },
        (error) => {
          console.error("Service Worker registration failed:", error);
        }
      );
    }
  }, []);

  return (
    <AuthProvider>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
        <head>
          <title>SleekRoad</title>
          <link rel="icon" href="/logo.svg" type="image/svg+xml" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="application-name" content="SleekRoad" />
          <meta name="theme-color" content="#ffffff" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="SleekRoad" />
          <link rel="apple-touch-icon" href="/logo.png" />
        </head>
        <body>{children}</body>
      </html>
    </AuthProvider>
  );
}
