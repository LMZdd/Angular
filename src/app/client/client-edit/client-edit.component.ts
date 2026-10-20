import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClientService } from '../client.service';
import { Client } from '../model/Client';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-client-edit',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './client-edit.component.html',
  styleUrl: './client-edit.component.scss',
})
export class ClientEditComponent implements OnInit {
  protected readonly dialogRef = inject(MatDialogRef<ClientEditComponent>);
  protected readonly data = inject(MAT_DIALOG_DATA) as { client: Client };
  protected readonly clientService = inject(ClientService);

  protected readonly id = signal<number | null>(null);
  protected readonly name = signal<string | null>(null);

  protected readonly nameModel = viewChild<NgModel>('nameModel');

  ngOnInit(): void {
    this.loadFormData(this.data.client ?? null);
  }

  loadFormData(initialData: Client | null): void {
    this.id.set(initialData?.id ?? null);
    this.name.set(initialData?.name ?? null);
  }

  onSave() {
    const id = this.id();
    const name = this.name();

    if (!name) {
      return;
    }

    const client = { id, name } as Client;

    this.clientService.saveClient(client).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        if (err.status === 409) {
          const control = this.nameModel()?.control;
          control?.setErrors({ duplicated: true });
          control?.markAsTouched();
        }
      },
    });
  }

  onClose() {
    this.dialogRef.close();
  }
}
