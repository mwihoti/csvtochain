import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { WalletProvider } from "@/lib/contexts/WalletContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SheetToChain - CSV to NFT Tokenization",
  description: "Transform CSV data into verifiable digital assets on Hedera",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="top-right" />
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
