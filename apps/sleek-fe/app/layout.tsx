import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "../firebase/AuthProvider";

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
  return (
    <AuthProvider>
      <html lang="en">
        <head>
          <title>SleekRoad</title>
          <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        </head>
        <body>{children}</body>
      </html>
    </AuthProvider>
  );
}
