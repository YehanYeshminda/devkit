export const code = `// side-navbar.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-side-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PanelMenuModule,
    ButtonModule,
    AvatarModule,
    TooltipModule,
    DividerModule,
  ],
  styles: [\`
    .layout {
      display: flex;
      height: 100vh;
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      height: 100%;
      border-right: 1px solid var(--surface-border);
      background: var(--surface-card);
      transition: width 0.2s ease;
      overflow: hidden;
    }

    .sidebar.open   { width: 260px; }
    .sidebar.closed { width: 64px;  }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid var(--surface-border);
    }

    .sidebar.closed .sidebar-header {
      justify-content: center;
    }

    .brand { font-size: 1.1rem; font-weight: 700; }

    .sidebar-footer {
      margin-top: auto;
      padding: 1rem;
      border-top: 1px solid var(--surface-border);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    :host ::ng-deep .p-panelmenu .p-panelmenu-header-content,
    :host ::ng-deep .p-panelmenu .p-menuitem-link {
      border-radius: 8px;
    }

    :host ::ng-deep .p-panelmenu {
      padding: 0.5rem;
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }
  \`],
  template: \`
    <div class="layout">

      <!-- ── Sidebar ── -->
      <aside class="sidebar" [class.open]="isOpen()" [class.closed]="!isOpen()">

        <!-- Header -->
        <div class="sidebar-header">
          @if (isOpen()) {
            <span class="brand">Acme</span>
          }
          <p-button
            [icon]="isOpen() ? 'pi pi-chevron-left' : 'pi pi-bars'"
            [rounded]="true"
            [text]="true"
            severity="secondary"
            (click)="toggleSidebar()"
            pTooltip="Toggle sidebar"
            tooltipPosition="right"
          />
        </div>

        <!-- Navigation -->
        @if (isOpen()) {
          <p-panelMenu [model]="items" styleClass="w-full border-none" />
        } @else {
          <!-- Collapsed: show only icons -->
          <ul class="list-none p-2 m-0">
            @for (item of flatItems; track item.label) {
              <li>
                <a
                  class="flex justify-content-center align-items-center p-2 border-round cursor-pointer hover:surface-hover mb-1"
                  [routerLink]="item.routerLink"
                  [pTooltip]="item.label"
                  tooltipPosition="right"
                >
                  <i [class]="item.icon + ' text-xl text-color-secondary'"></i>
                </a>
              </li>
            }
          </ul>
        }

        <!-- Footer / user -->
        @if (isOpen()) {
          <div class="sidebar-footer">
            <p-avatar label="JD" shape="circle"
              [style]="{'background-color':'#6366f1','color':'#fff'}" />
            <div class="flex flex-column">
              <span class="font-semibold text-sm">Jane Doe</span>
              <span class="text-color-secondary text-xs">Admin</span>
            </div>
            <p-button
              icon="pi pi-sign-out"
              [text]="true"
              severity="secondary"
              class="ml-auto"
              pTooltip="Sign out"
              tooltipPosition="right"
            />
          </div>
        }

      </aside>

      <!-- ── Main content ── -->
      <main class="main-content">
        <router-outlet />
      </main>

    </div>
  \`,
})
export class SideNavbarComponent {
  isOpen = signal(true);

  toggleSidebar() {
    this.isOpen.update((v) => !v);
  }

  items: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      routerLink: ['/dashboard'],
      expanded: true,
    },
    {
      label: 'Analytics',
      icon: 'pi pi-chart-bar',
      items: [
        { label: 'Overview',  icon: 'pi pi-chart-line', routerLink: ['/analytics'] },
        { label: 'Reports',   icon: 'pi pi-file',       routerLink: ['/reports']   },
        { label: 'Export',    icon: 'pi pi-download',   routerLink: ['/export']    },
      ],
    },
    {
      label: 'Users',
      icon: 'pi pi-users',
      items: [
        { label: 'All Users', icon: 'pi pi-list',   routerLink: ['/users']        },
        { label: 'Roles',     icon: 'pi pi-shield', routerLink: ['/users/roles']  },
        { label: 'Invite',    icon: 'pi pi-send',   routerLink: ['/users/invite'] },
      ],
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      routerLink: ['/settings'],
    },
  ];

  /** Flattened top-level items used when the sidebar is collapsed */
  flatItems = this.items.map((i) => ({ label: i.label, icon: i.icon, routerLink: i.routerLink ?? i.items?.[0]?.routerLink }));
}

// ─────────────────────────────────────────────
// Usage — add selector to your shell layout:
// ─────────────────────────────────────────────
// <app-side-navbar />
//
// Make sure RouterModule / provideRouter is configured in app.config.ts
`;
