import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LoanService } from '../loan.service';
import { Loan } from '../model/Loan';
import { Game } from '../../game/model/Game';
import { GameService } from '../../game/game.service';
import { Client } from '../../client/model/Client';
import { ClientService } from '../../client/client.service';
import { validateFields } from '../../core/helpers/validation.helper';
import { daysBetween, formatDate, parseDate } from '../../core/helpers/date.helper';

const MAX_LOAN_DAYS = 14;

@Component({
  selector: 'app-loan-edit',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatSnackBarModule,
  ],
  templateUrl: './loan-edit.component.html',
  styleUrl: './loan-edit.component.scss',
})
export class LoanEditComponent implements OnInit {
  protected readonly id = signal<number | null>(null);
  protected readonly clientId = signal<number | null>(null);
  protected readonly gameId = signal<number | null>(null);
  protected readonly startDate = signal<Date | null>(null);
  protected readonly endDate = signal<Date | null>(null);
  protected readonly clients = signal<Client[]>([]);
  protected readonly games = signal<Game[]>([]);

  protected readonly dialogRef = inject(MatDialogRef<LoanEditComponent>);
  protected readonly data = inject(MAT_DIALOG_DATA);
  protected readonly loanService = inject(LoanService);
  protected readonly gameService = inject(GameService);
  protected readonly clientService = inject(ClientService);
  protected readonly snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadFormData(this.data.loan ?? null);
  }

  loadFormData(initialData: Loan | null): void {
    this.id.set(initialData?.id ?? null);
    this.startDate.set(parseDate(initialData?.startDate));
    this.endDate.set(parseDate(initialData?.endDate));

    this.clientService.getClients().subscribe((clients) => {
      this.clients.set(clients);
      this.clientId.set(initialData?.client?.id ?? null);
    });

    this.gameService.getGames().subscribe((games) => {
      this.games.set(games);
      this.gameId.set(initialData?.game?.id ?? null);
    });
  }

  onSave() {
    const id = this.id();
    const clientId = this.clientId();
    const gameId = this.gameId();
    const startDate = this.startDate();
    const endDate = this.endDate();

    const requiredFields = ['clientId', 'gameId', 'startDate', 'endDate'] as const;
    const data = { clientId, gameId, startDate, endDate };

    if (!validateFields(data, requiredFields)) {
      return;
    }

    if (!startDate || !endDate) {
      return;
    }

    if (endDate < startDate) {
      this.showError('La fecha de fin no puede ser anterior a la fecha de inicio');
      return;
    }

    if (daysBetween(startDate, endDate) > MAX_LOAN_DAYS) {
      this.showError('El periodo de préstamo no puede ser superior a ${MAX_LOAN_DAYS} días');
      return;
    }
    const loan = {
      id,
      client: this.clients().find((c) => c.id === clientId) ?? null,
      game: this.games().find((g) => g.id === gameId) ?? null,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    } as Loan;

    this.loanService.saveLoan(loan).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => this.showError(err?.error?.message ?? 'No se ha podido guardar el préstamo'),
    });
  }

  onClose() {
    this.dialogRef.close();
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 5000 });
  }
}
