import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";

import { DevkitWorkspaceProvider } from "@/components/site/devkit-workspace-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevKit — Your developer toolkit",
  description:
    "Browse copy-paste UI components, convert files, and access dev tools — all in one place. No installs required; optional sign-in for upcoming features.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <body
          className={[
            inter.className,
            "min-h-dvh bg-background text-foreground",
            "selection:bg-primary/30 selection:text-foreground",
          ].join(" ")}
        >
          <DevkitWorkspaceProvider>{children}</DevkitWorkspaceProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
