import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GitHub Lookup — DevKit",
  description:
    "Look up public GitHub users or repositories via the GitHub REST API — no token required (anonymous rate limits apply).",
};

export default function GitHubLookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
