export const code = `// data-table.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

export type UserStatus = 'active' | 'inactive' | 'pending';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  joined: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, ButtonModule, InputTextModule],
  template: \`
    <div class="card">

      <!-- Table toolbar -->
      <div class="flex justify-content-between align-items-center mb-3">
        <h5 class="m-0">Users</h5>
        <span class="p-input-icon-left">
          <i class="pi pi-search"></i>
          <input
            pInputText
            type="text"
            [(ngModel)]="globalFilter"
            placeholder="Search…"
            class="p-inputtext-sm"
          />
        </span>
      </div>

      <p-table
        [value]="users"
        [paginator]="true"
        [rows]="5"
        [rowsPerPageOptions]="[5, 10, 25]"
        [globalFilterFields]="['name', 'email', 'role', 'status']"
        [filterDelay]="0"
        sortMode="single"
        [rowHover]="true"
        styleClass="p-datatable-sm"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="name">
              Name <p-sortIcon field="name" />
            </th>
            <th pSortableColumn="email">
              Email <p-sortIcon field="email" />
            </th>
            <th pSortableColumn="role">
              Role <p-sortIcon field="role" />
            </th>
            <th pSortableColumn="status">
              Status <p-sortIcon field="status" />
            </th>
            <th pSortableColumn="joined">
              Joined <p-sortIcon field="joined" />
            </th>
            <th>Actions</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-user>
          <tr>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <p-tag
                [value]="user.status"
                [severity]="getSeverity(user.status)"
              />
            </td>
            <td>{{ user.joined }}</td>
            <td>
              <div class="flex gap-2">
                <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info"  size="small" />
                <p-button icon="pi pi-trash"  [rounded]="true" [text]="true" severity="danger" size="small" />
              </div>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center text-color-secondary py-4">
              No users found.
            </td>
          </tr>
        </ng-template>

      </p-table>
    </div>
  \`,
})
export class DataTableComponent implements OnInit {
  users: User[] = [];
  globalFilter = '';

  ngOnInit() {
    this.users = [
      { id: 1, name: 'Alice Johnson', email: 'alice@acme.com',  role: 'Admin',     status: 'active',   joined: '2023-01-12' },
      { id: 2, name: 'Bob Smith',     email: 'bob@acme.com',    role: 'Developer', status: 'active',   joined: '2023-03-08' },
      { id: 3, name: 'Carol White',   email: 'carol@acme.com',  role: 'Designer',  status: 'inactive', joined: '2022-11-20' },
      { id: 4, name: 'Dan Brown',     email: 'dan@acme.com',    role: 'Manager',   status: 'pending',  joined: '2024-02-01' },
      { id: 5, name: 'Eve Davis',     email: 'eve@acme.com',    role: 'Developer', status: 'active',   joined: '2024-05-15' },
      { id: 6, name: 'Frank Lee',     email: 'frank@acme.com',  role: 'Support',   status: 'inactive', joined: '2023-07-22' },
    ];
  }

  getSeverity(status: UserStatus): 'success' | 'danger' | 'warning' {
    const map: Record<UserStatus, 'success' | 'danger' | 'warning'> = {
      active:   'success',
      inactive: 'danger',
      pending:  'warning',
    };
    return map[status];
  }
}

// ─────────────────────────────────────────────
// Notes:
//  • Add FormsModule (or ReactiveFormsModule) for [(ngModel)] on the search input.
//  • Replace the hardcoded users array with an HTTP service call in ngOnInit.
//  • Add [globalFilter]="globalFilter" to <p-table> to wire up the search.
// ─────────────────────────────────────────────
`;
