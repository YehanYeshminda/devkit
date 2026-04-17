export type ToolStatus = "live" | "soon";

export type Tool = {
  name: string;
  description: string;
  href: string;
  status: ToolStatus;
  emoji: string;
  tags?: string[];
};

export type ToolCategory = {
  id: string;
  name: string;
  description: string;
  href: string;
  emoji: string;
  tools: Tool[];
};

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: "converters",
    name: "Converters",
    description: "Convert between file formats and encodings.",
    href: "/converters",
    emoji: "🔄",
    tools: [
      { name: "Base64 ↔ PDF",    description: "Convert any PDF to a Base64 string and back.",       href: "/converters/pdf",           status: "live", emoji: "📄", tags: ["PDF", "Base64"] },
      { name: "Image ↔ Base64",  description: "Convert images to Base64 strings and back.",          href: "/converters/image-base64",  status: "live", emoji: "🖼️",  tags: ["Image", "Base64"] },
      { name: "Base64 ↔ Text",   description: "Encode and decode plain text as Base64 strings.",     href: "/converters/base64-text",   status: "live", emoji: "🔤", tags: ["Base64", "Text"] },
      { name: "JSON ↔ CSV",      description: "Convert between JSON arrays and CSV files.",           href: "/converters/json-csv",      status: "live", emoji: "📊", tags: ["JSON", "CSV"] },
    ],
  },
  {
    id: "pdf-tools",
    name: "PDF Tools",
    description: "Merge, split, rotate, and process PDF files — powered by pdf-lib, entirely in the browser.",
    href: "/pdf-tools",
    emoji: "📑",
    tools: [
      { name: "Merge PDFs",      description: "Combine multiple PDFs into one document.",            href: "/pdf-tools/merge",          status: "live", emoji: "🔗", tags: ["PDF", "Merge"] },
      { name: "Split PDF",       description: "Split a PDF into separate pages or custom ranges.",    href: "/pdf-tools/split",          status: "live", emoji: "✂️",  tags: ["PDF", "Split"] },
      { name: "Rotate PDF",      description: "Rotate all or selected pages by 90°, 180°, 270°.",    href: "/pdf-tools/rotate",         status: "live", emoji: "🔄", tags: ["PDF", "Rotate"] },
      { name: "Delete Pages",    description: "Remove specific pages from a PDF document.",           href: "/pdf-tools/delete-pages",   status: "live", emoji: "🗑️", tags: ["PDF", "Pages"] },
      { name: "Extract Pages",   description: "Pull selected pages out into a new PDF.",              href: "/pdf-tools/extract-pages",  status: "live", emoji: "📤", tags: ["PDF", "Pages"] },
      { name: "Compress PDF",    description: "Reduce PDF file size and strip unused metadata.",      href: "/pdf-tools/compress",       status: "live", emoji: "🗜️", tags: ["PDF", "Compress"] },
    ],
  },
  {
    id: "image-tools",
    name: "Image Tools",
    description: "Resize, convert, and crop images in the browser.",
    href: "/image-tools",
    emoji: "🖼️",
    tools: [
      { name: "Resize",          description: "Resize images to specific dimensions.",               href: "/image-tools/resize",      status: "soon", emoji: "📐", tags: ["Image", "Resize"] },
      { name: "Convert",         description: "Convert between PNG, JPG, WebP, and more.",           href: "/image-tools/convert",     status: "soon", emoji: "🔄", tags: ["Image", "Convert"] },
      { name: "Crop",            description: "Crop images to a specific area.",                     href: "/image-tools/crop",        status: "soon", emoji: "✂️",  tags: ["Image", "Crop"] },
    ],
  },
  {
    id: "dev-tools",
    name: "Developer Tools",
    description: "Essential utilities for everyday development.",
    href: "/dev-tools",
    emoji: "🛠️",
    tools: [
      { name: "DNS Lookup",         description: "Resolve A, AAAA, MX, TXT, and other records via Google Public DNS (HTTPS).", href: "/dev-tools/dns-lookup", status: "live", emoji: "🌐", tags: ["DNS", "Network"] },
      { name: "GitHub Lookup",      description: "Look up public GitHub users or repos via the REST API (no token, rate limits apply).", href: "/dev-tools/github-lookup", status: "live", emoji: "🐙", tags: ["GitHub", "API"] },
      { name: "JWT Decoder",        description: "Decode and inspect JSON Web Tokens.",               href: "/dev-tools/jwt",            status: "live", emoji: "🔑", tags: ["JWT", "Auth"] },
      { name: "JSON Formatter",    description: "Pretty-print and validate JSON data.",               href: "/dev-tools/json-formatter", status: "live", emoji: "{ }", tags: ["JSON", "Format"] },
      { name: "Regex Tester",      description: "Test regular expressions with live match highlighting.", href: "/dev-tools/regex",       status: "live", emoji: ".*", tags: ["Regex", "Pattern"] },
      { name: "Diff Viewer",       description: "Paste two blocks of text and see line-by-line diff.", href: "/dev-tools/diff",         status: "live", emoji: "🔀", tags: ["Diff", "Compare"] },
      { name: "Cron Builder",      description: "Build and decode cron expressions visually.",         href: "/dev-tools/cron",         status: "live", emoji: "⏰", tags: ["Cron", "Schedule"] },
      { name: "HTTP Status Codes", description: "Searchable reference for all HTTP status codes.",     href: "/dev-tools/http-status",  status: "live", emoji: "📡", tags: ["HTTP", "Reference"] },
      { name: "Unix Timestamp",    description: "Convert epoch timestamps to human-readable dates.",   href: "/dev-tools/timestamp",    status: "live", emoji: "🕐", tags: ["Timestamp", "Date"] },
      { name: "Case Converter",    description: "Convert text between camelCase, snake_case, and more.", href: "/dev-tools/case-converter", status: "live", emoji: "Aa", tags: ["Text", "Case"] },
      { name: "Markdown Preview",  description: "Live preview for Markdown with GitHub Flavored support.", href: "/dev-tools/markdown",   status: "live", emoji: "📝", tags: ["Markdown", "Preview"] },
      { name: "Code Minifier",     description: "Minify JavaScript, CSS, and HTML code.",             href: "/dev-tools/minifier",     status: "soon", emoji: "📦", tags: ["JS", "CSS", "Minify"] },
    ],
  },
  {
    id: "security",
    name: "Security",
    description: "Cryptographic tools and security utilities.",
    href: "/security",
    emoji: "🔐",
    tools: [
      { name: "Hash Generator",  description: "Generate SHA-256, SHA-512, and other hashes.",        href: "/security/hash",           status: "live", emoji: "#",  tags: ["Hash", "SHA", "Crypto"] },
      { name: "Password Generator", description: "Generate strong, random passwords.",               href: "/security/password",       status: "live", emoji: "🔒", tags: ["Password", "Security"] },
    ],
  },
  {
    id: "utilities",
    name: "Utilities",
    description: "Handy everyday developer utilities.",
    href: "/utilities",
    emoji: "🔧",
    tools: [
      { name: "UUID Generator",  description: "Generate v4 UUIDs individually or in bulk.",          href: "/utilities/uuid",          status: "live", emoji: "🆔", tags: ["UUID", "ID"] },
      { name: "QR Generator",    description: "Generate QR codes from any text or URL.",             href: "/utilities/qr",            status: "soon", emoji: "⬛", tags: ["QR", "Barcode"] },
    ],
  },
  {
    id: "snippets",
    name: "Code Snippets",
    description: "Copy-paste snippets for CSS, Git commands, and shell scripting.",
    href: "/snippets",
    emoji: "📋",
    tools: [
      { name: "CSS Snippets",  description: "Gradients, glass morphism, animations, and layout patterns.", href: "/snippets/css",  status: "live", emoji: "🎨", tags: ["CSS", "Styling"] },
      { name: "Git Commands",  description: "Searchable cheat sheet with explanations for every command.", href: "/snippets/git",  status: "live", emoji: "🌿", tags: ["Git", "VCS"] },
      { name: "Bash Snippets", description: "One-liners for files, processes, networking, and system info.", href: "/snippets/bash", status: "live", emoji: "⚡", tags: ["Bash", "Shell"] },
    ],
  },
];

export const ALL_TOOLS = TOOL_CATEGORIES.flatMap((c) => c.tools);
