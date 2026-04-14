export const code = `// fixed-navbar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-fixed-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ToolbarModule,
    ButtonModule,
    InputTextModule,
    AvatarModule,
    BadgeModule,
    OverlayPanelModule,
  ],
  styles: [\`
    .fixed-nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }

    /* Give page body breathing room */
    :host-context(body) {
      padding-top: 4rem;
    }

    :host ::ng-deep .p-toolbar {
      border-radius: 0;
      border-left: none;
      border-right: none;
      border-top: none;
      padding: 0.5rem 1.5rem;
    }
  \`],
  template: \`
    <header class="fixed-nav">
      <p-toolbar>

        <!-- Left: brand + nav links -->
        <ng-template pTemplate="start">
          <div class="flex align-items-center gap-4">
            <a routerLink="/" class="font-bold text-xl no-underline text-color">
              Acme
            </a>
            <nav class="hidden md:flex gap-3">
              <a routerLink="/"        class="text-color-secondary no-underline hover:text-color">Home</a>
              <a routerLink="/pricing" class="text-color-secondary no-underline hover:text-color">Pricing</a>
              <a routerLink="/docs"    class="text-color-secondary no-underline hover:text-color">Docs</a>
            </nav>
          </div>
        </ng-template>

        <!-- Centre: search -->
        <ng-template pTemplate="center">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input
              pInputText
              type="text"
              placeholder="Search…"
              class="p-inputtext-sm w-64"
            />
          </span>
        </ng-template>

        <!-- Right: notifications + avatar -->
        <ng-template pTemplate="end">
          <div class="flex align-items-center gap-2">
            <p-button
              icon="pi pi-bell"
              [rounded]="true"
              [text]="true"
              severity="secondary"
              pBadge
              value="3"
              (click)="op.toggle($event)"
            />
            <p-overlayPanel #op>
              <div class="p-2 text-sm" style="min-width:220px">
                <p class="font-semibold mb-2">Notifications</p>
                <p class="text-color-secondary m-0">3 unread messages</p>
              </div>
            </p-overlayPanel>

            <p-avatar
              label="JD"
              shape="circle"
              [style]="{ 'background-color': '#6366f1', color: '#fff', cursor: 'pointer' }"
            />
          </div>
        </ng-template>

      </p-toolbar>
    </header>

    <!-- Push content below fixed navbar -->
    <div style="padding-top: 4rem;">
      <ng-content />
    </div>
  \`,
})
export class FixedNavbarComponent {}

// ─────────────────────────────────────────────
// Usage in a parent component or app shell:
// ─────────────────────────────────────────────
// <app-fixed-navbar>
//   <router-outlet />
// </app-fixed-navbar>
`;
