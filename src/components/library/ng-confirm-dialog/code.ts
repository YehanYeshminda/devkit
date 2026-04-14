export const code = `// confirm-delete.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-confirm-delete',
  standalone: true,
  imports: [CommonModule, ConfirmDialogModule, ButtonModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  template: \`
    <!-- Toast sits at the root so it can overlay the dialog -->
    <p-toast />

    <!-- The dialog is registered globally; call confirmationService to open it -->
    <p-confirmDialog>
      <ng-template pTemplate="headless" let-message>
        <div class="flex flex-column align-items-center p-5 surface-overlay border-round gap-3">
          <div class="border-circle bg-red-100 inline-flex justify-content-center align-items-center h-6rem w-6rem">
            <i class="pi pi-exclamation-triangle text-5xl text-red-500"></i>
          </div>
          <span class="font-bold text-2xl block mb-2 mt-2">{{ message.header }}</span>
          <p class="mb-0">{{ message.message }}</p>
          <div class="flex align-items-center gap-2">
            <p-button
              label="Delete"
              severity="danger"
              (onClick)="message.accept()"
            />
            <p-button
              label="Cancel"
              [outlined]="true"
              (onClick)="message.reject()"
            />
          </div>
        </div>
      </ng-template>
    </p-confirmDialog>

    <!-- Trigger button -->
    <p-button
      label="Delete account"
      severity="danger"
      icon="pi pi-trash"
      (onClick)="confirmDelete()"
    />
  \`,
})
export class ConfirmDeleteComponent {
  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  confirmDelete() {
    this.confirmationService.confirm({
      header: 'Are you sure?',
      message: 'This will permanently delete your account and all associated data.',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Account deleted successfully.',
          life: 3000,
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Action cancelled.',
          life: 2000,
        });
      },
    });
  }
}

// ─────────────────────────────────────────────
// Notes:
//  • Add ConfirmationService & MessageService to your root providers
//    (or keep them as component-level providers as shown above).
//  • <p-toast /> can be placed in app.component.html if you want it global.
//  • Swap the headless template for the default <p-confirmDialog /> if you
//    prefer the built-in PrimeNG styling.
// ─────────────────────────────────────────────
`;
