import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../../context/authContext"; // 1. Import
import GlobalChat from "../../components/globalChat";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CuraLink",
  description: "Connecting Patients and Researchers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {" "}
          {/* 2. Wrap children */}
          {children}
        </AuthProvider>
        <GlobalChat />
      </body>
    </html>
  );
}
