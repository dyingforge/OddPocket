import type { Metadata } from "next";
import "../styles/globals.css";
import { Providers } from "./providers";
import { PopupProvider } from "@/context/PopupProvider";
import { Popup } from "@/components/Popup";
import PopupWrapper from "./PopupWrapper";

export const metadata: Metadata = {
  title: "Red Packet - WealthGod DApp",
  description: "Send and claim blessings on Arbitrum",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DynaPuff:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <PopupProvider>
          <Providers>
            {children}
            <PopupWrapper />
          </Providers>
        </PopupProvider>
      </body>
    </html>
  );
}

