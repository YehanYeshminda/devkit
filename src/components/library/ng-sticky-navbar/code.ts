export const code = `// sticky-navbar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-sticky-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MenubarModule, ButtonModule, AvatarModule],
  styles: [\`
    .sticky-nav {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    /* Remove default border-radius so the bar spans full width */
    :host ::ng-deep .p-menubar {
      border-radius: 0;
      border-left: none;
      border-right: none;
      border-top: none;
      padding: 0.5rem 1.5rem;
    }
  \`],
  template: \`
    <nav class="sticky-nav">
      <p-menubar [model]="items">

        <!-- Logo / brand -->
        <ng-template pTemplate="start">
          <div class="flex align-items-center gap-2 mr-4">
            <span class="font-bold text-xl">Acme</span>
          </div>
        </ng-template>

        <!-- Right-side actions -->
        <ng-template pTemplate="end">
          <div class="flex align-items-center gap-2">
            <p-button
              label="Sign in"
              [outlined]="true"
              size="small"
              routerLink="/login"
            />
          </div>
        </ng-template>

      </p-menubar>
    </nav>
  \`,
})
export class StickyNavbarComponent {
  items: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: ['/'],
    },
    {
      label: 'Products',
      icon: 'pi pi-box',
      items: [
        { label: 'Overview',  icon: 'pi pi-list'      },
        { label: 'Pricing',   icon: 'pi pi-tag'       },
        { separator: true                              },
        { label: 'Changelog', icon: 'pi pi-history'   },
      ],
    },
    {
      label: 'Docs',
      icon: 'pi pi-book',
      routerLink: ['/docs'],
    },
    {
      label: 'Contact',
      icon: 'pi pi-envelope',
      routerLink: ['/contact'],
    },
  ];
}

// ─────────────────────────────────────────────
// app.config.ts  (add provideRouter if needed)
// ─────────────────────────────────────────────
// import { provideRouter } from '@angular/router';
// import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
//
// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideRouter(routes),
//     provideAnimationsAsync(),
//   ],
// };
`;
