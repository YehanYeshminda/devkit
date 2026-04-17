import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DNS Lookup — DevKit",
  description:
    "Resolve DNS records (A, AAAA, MX, TXT, CNAME, and more) for any hostname using Google Public DNS over HTTPS.",
};

export default function DnsLookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
