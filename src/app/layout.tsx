import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevKit — Your developer toolkit",
  description:
    "Browse copy-paste UI components, convert files, and access dev tools — all in one place. No installs, no accounts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={[
          inter.className,
          "min-h-dvh bg-background text-foreground",
          "selection:bg-primary/30 selection:text-foreground",
        ].join(" ")}
      >
        {children}
      </body>
    </html>
  );
}
