import type React from "react";

// ── React components ──────────────────────────────────────────────────────
import { meta as animatedGradientButtonMeta } from "@/components/library/animated-gradient-button/meta";
import { code as animatedGradientButtonCode } from "@/components/library/animated-gradient-button/code";
import { Preview as AnimatedGradientButtonPreview } from "@/components/library/animated-gradient-button/preview";

import { meta as gradientTextMeta } from "@/components/library/gradient-text/meta";
import { code as gradientTextCode } from "@/components/library/gradient-text/code";
import { Preview as GradientTextPreview } from "@/components/library/gradient-text/preview";

import { meta as waveButtonMeta } from "@/components/library/wave-button/meta";
import { code as waveButtonCode } from "@/components/library/wave-button/code";
import { Preview as WaveButtonPreview } from "@/components/library/wave-button/preview";

// ── Angular / PrimeNG components ──────────────────────────────────────────
import { meta as ngStickyNavbarMeta } from "@/components/library/ng-sticky-navbar/meta";
import { code as ngStickyNavbarCode } from "@/components/library/ng-sticky-navbar/code";
import { Preview as NgStickyNavbarPreview } from "@/components/library/ng-sticky-navbar/preview";

import { meta as ngFixedNavbarMeta } from "@/components/library/ng-fixed-navbar/meta";
import { code as ngFixedNavbarCode } from "@/components/library/ng-fixed-navbar/code";
import { Preview as NgFixedNavbarPreview } from "@/components/library/ng-fixed-navbar/preview";

import { meta as ngSideNavbarMeta } from "@/components/library/ng-side-navbar/meta";
import { code as ngSideNavbarCode } from "@/components/library/ng-side-navbar/code";
import { Preview as NgSideNavbarPreview } from "@/components/library/ng-side-navbar/preview";

import { meta as statsCardMeta } from "@/components/library/stats-card/meta";
import { code as statsCardCode } from "@/components/library/stats-card/code";
import { Preview as StatsCardPreview } from "@/components/library/stats-card/preview";

import { meta as copyInputMeta } from "@/components/library/copy-input/meta";
import { code as copyInputCode } from "@/components/library/copy-input/code";
import { Preview as CopyInputPreview } from "@/components/library/copy-input/preview";

import { meta as ngDataTableMeta } from "@/components/library/ng-data-table/meta";
import { code as ngDataTableCode } from "@/components/library/ng-data-table/code";
import { Preview as NgDataTablePreview } from "@/components/library/ng-data-table/preview";

import { meta as ngConfirmDialogMeta } from "@/components/library/ng-confirm-dialog/meta";
import { code as ngConfirmDialogCode } from "@/components/library/ng-confirm-dialog/code";
import { Preview as NgConfirmDialogPreview } from "@/components/library/ng-confirm-dialog/preview";

// ─────────────────────────────────────────────────────────────────────────

export type ComponentTag =
  | "button"
  | "form"
  | "navigation"
  | "navbar"
  | "sidebar"
  | "layout"
  | "data-display"
  | "feedback"
  | "cta"
  | "animation"
  | "text"
  | "typography"
  | "interaction"
  | "sticky"
  | "fixed"
  | "toolbar"
  | "menubar"
  | "panelmenu"
  | "card"
  | "dashboard"
  | "metrics"
  | "clipboard"
  | "input"
  | "table"
  | "pagination"
  | "sorting"
  | "dialog"
  | "modal"
  | "confirmDialog"
  | (string & {});

export type Framework = "react" | "angular" | (string & {});

export type LibraryComponent = {
  slug: string;
  name: string;
  description: string;
  tags: readonly ComponentTag[];
  framework: Framework;
  code: string;
  Preview: React.ComponentType;
  usage: {
    install?: string[];
    notes?: string[];
  };
};

export const components: readonly LibraryComponent[] = [
  // ── React ──────────────────────────────────────────────────────────────
  {
    ...animatedGradientButtonMeta,
    code: animatedGradientButtonCode,
    Preview: AnimatedGradientButtonPreview,
    usage: {
      install: ["Tailwind CSS"],
      notes: [
        "Uses a spinning conic-gradient — no JS required for the animation.",
        "Adjust `bg-neutral-950` on the inner span to match your background colour.",
      ],
    },
  },
  {
    ...gradientTextMeta,
    code: gradientTextCode,
    Preview: GradientTextPreview,
    usage: {
      install: ["Tailwind CSS"],
      notes: [
        "Add the `gradient-shift` keyframe + animation to your `tailwind.config.ts` (see code comment).",
        "Pass any Tailwind `from-*/via-*/to-*` classes via the `gradient` prop to change colours.",
        "Set `animate={false}` for a static gradient.",
      ],
    },
  },
  {
    ...waveButtonMeta,
    code: waveButtonCode,
    Preview: WaveButtonPreview,
    usage: {
      install: ["Tailwind CSS"],
      notes: [
        "Add the `ripple` keyframe + animation to your `tailwind.config.ts` (see code comment).",
        "The ripple originates from the exact click position — no external library needed.",
        "Use `variant='outline'` for a ghost-style variant.",
      ],
    },
  },

  // ── React (continued) ──────────────────────────────────────────────────
  {
    ...statsCardMeta,
    code: statsCardCode,
    Preview: StatsCardPreview,
    usage: {
      install: ["Tailwind CSS", "lucide-react"],
      notes: [
        "Pass a `change` prop (number) to show a trend indicator — positive is green, negative is red.",
        "The `icon` prop accepts any React node, e.g. `<DollarSign className='size-4' />`.",
        "Lay out multiple cards in a CSS grid: `grid grid-cols-1 sm:grid-cols-3 gap-4`.",
      ],
    },
  },
  {
    ...copyInputMeta,
    code: copyInputCode,
    Preview: CopyInputPreview,
    usage: {
      install: ["Tailwind CSS", "lucide-react"],
      notes: [
        "Requires a browser clipboard API — works in all modern browsers over HTTPS.",
        "The button text flips to 'Copied' for 1.5 s and then resets automatically.",
        "Pass a `label` prop to render a visible label above the input field.",
        "Wrap in a form with a hidden submit to prevent unintended form submissions.",
      ],
    },
  },

  // ── Angular / PrimeNG ──────────────────────────────────────────────────
  {
    ...ngStickyNavbarMeta,
    code: ngStickyNavbarCode,
    Preview: NgStickyNavbarPreview,
    usage: {
      install: ["PrimeNG (already installed)", "PrimeIcons"],
      notes: [
        "Uses `p-menubar` with `position: sticky; top: 0` — no scroll listener needed.",
        "Add `provideAnimationsAsync()` to `app.config.ts` if animations are not yet enabled.",
        "Nest sub-items inside a `items` array on any `MenuItem` to get a dropdown.",
        "Swap `routerLink` for `url` or a `command` callback if not using the Angular router.",
      ],
    },
  },
  {
    ...ngFixedNavbarMeta,
    code: ngFixedNavbarCode,
    Preview: NgFixedNavbarPreview,
    usage: {
      install: ["PrimeNG (already installed)", "PrimeIcons"],
      notes: [
        "Wraps `p-toolbar` with `position: fixed; top: 0` CSS so it stays visible on scroll.",
        "The component adds `padding-top: 4rem` to the page body via the `:host-context` selector.",
        "Use `<app-fixed-navbar>` as a shell wrapper and put `<router-outlet />` inside it.",
        "Replace the avatar initials and notification count with real data from a service.",
      ],
    },
  },
  {
    ...ngSideNavbarMeta,
    code: ngSideNavbarCode,
    Preview: NgSideNavbarPreview,
    usage: {
      install: ["PrimeNG (already installed)", "PrimeIcons"],
      notes: [
        "Uses Angular `signal()` for the collapsed/expanded toggle state — requires Angular 16+.",
        "When collapsed, icons are shown using a flat `flatItems` array mapped from the menu tree.",
        "Add `pTooltip` to any icon button so users know what each icon does when collapsed.",
        "`p-panelmenu` renders sections as accordion panels — set `expanded: true` on an item to open it by default.",
        "Drop the sidebar and main content into a `flex-row` shell layout for a full dashboard frame.",
      ],
    },
  },
  {
    ...ngDataTableMeta,
    code: ngDataTableCode,
    Preview: NgDataTablePreview,
    usage: {
      install: ["PrimeNG (already installed)", "PrimeIcons"],
      notes: [
        "Import `TableModule`, `TagModule`, `ButtonModule` from PrimeNG.",
        "Add `FormsModule` or `ReactiveFormsModule` for the `[(ngModel)]` global filter input.",
        "Replace the hardcoded `users` array with an HTTP service call in `ngOnInit`.",
        "Wire the search input with `[globalFilter]` on `<p-table>` and set `[globalFilterFields]`.",
        "`getSeverity()` maps row status values to PrimeNG Tag severities — extend it for your own statuses.",
      ],
    },
  },
  {
    ...ngConfirmDialogMeta,
    code: ngConfirmDialogCode,
    Preview: NgConfirmDialogPreview,
    usage: {
      install: ["PrimeNG (already installed)", "PrimeIcons"],
      notes: [
        "Provide `ConfirmationService` and `MessageService` — either at root or per-component.",
        "Call `this.confirmationService.confirm({ ... })` from any method to open the dialog.",
        "Use `accept` / `reject` callbacks inside the config object to handle each outcome.",
        "Drop `<p-toast />` into `app.component.html` once if you want global toast coverage.",
        "Swap the headless template for the default `<p-confirmDialog />` if you prefer the built-in PrimeNG styling.",
      ],
    },
  },
] as const;

export function getAllComponentSlugs() {
  return components.map((c) => c.slug);
}

export function getComponentBySlug(slug: string) {
  return components.find((c) => c.slug === slug) ?? null;
}

/** Framework filter tabs — add more here as needed */
export const FRAMEWORKS: { id: Framework | "all"; label: string }[] = [
  { id: "all",     label: "All"     },
  { id: "react",   label: "React"   },
  { id: "angular", label: "Angular" },
];
