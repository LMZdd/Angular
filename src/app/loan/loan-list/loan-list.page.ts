import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { LoanEditComponent } from '../loan-edit/loan-edit.component';
import { LoanService } from '../loan.service';
import { Loan } from '../model/Loan';
import { Game } from '../../game/model/Game';
import { GameService } from '../../game/game.service';
import { Client } from '../../client/model/Client';
import { ClientService } from '../../client/client.service';
import { Pageable } from '../../core/model/page/Pageable';
import { DialogConfirmationComponent } from '../../core/dialog-confirmation/dialog-confirmation.component';
import { formatDate } from '../../core/helpers/date.helper';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './loan-list.page.html',
  styleUrl: './loan-list.page.scss',
})
export class LoanListPage implements OnInit {
  pageNumber: number = 0;
  pageSize: number = 5;
  totalElements: number = 0;

  dataSource = new MatTableDataSource<Loan>();
  displayedColumns: string[] = ['id', 'game', 'client', 'startDate', 'endDate', 'action'];

  protected readonly games = signal<Game[]>([]);
  protected readonly clients = signal<Client[]>([]);
  protected readonly filterGame = signal<Game | null>(null);
  protected readonly filterClient = signal<Client | null>(null);
  protected readonly filterDate = signal<Date | null>(null);

  protected readonly loanService = inject(LoanService);
  protected readonly gameService = inject(GameService);
  protected readonly clientService = inject(ClientService);
  protected readonly dialog = inject(MatDialog);
  ngOnInit(): void {
    this.gameService.getGames().subscribe((games) => this.games.set(games));
    this.clientService.getClients().subscribe((clients) => this.clients.set(clients));

    this.loadPage();
  }

  loadPage(event?: PageEvent) {
    const pageable: Pageable = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      sort: [
        {
          property: 'id',
          direction: 'ASC',
        },
      ],
    };

    if (event != null) {
      pageable.pageSize = event.pageSize;
      pageable.pageNumber = event.pageIndex;
    }

    const gameId = this.filterGame()?.id;
    const clientId = this.filterClient()?.id;
    const date = formatDate(this.filterDate()) ?? undefined;

    this.loanService.getLoans(pageable, gameId, clientId, date).subscribe((data) => {
      this.dataSource.data = data.content;
      this.pageNumber = data.pageable.pageNumber;
      this.pageSize = data.pageable.pageSize;
      this.totalElements = data.totalElements;
    });
  }

  onCleanFilter(): void {
    this.filterGame.set(null);
    this.filterClient.set(null);
    this.filterDate.set(null);
    this.onSearch();
  }

  onSearch(): void {
    this.pageNumber = 0;
    this.loadPage();
  }
  createLoan() {
    const dialogRef = this.dialog.open(LoanEditComponent, {
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.loadPage();
    });
  }

  editLoan(loan: Loan) {
    const dialogRef = this.dialog.open(LoanEditComponent, {
      data: { loan },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.loadPage();
    });
  }

  deleteLoan(loan: Loan) {
    const dialogRef = this.dialog.open(DialogConfirmationComponent, {
      data: {
        title: 'Eliminar préstamo',
        description:
          'Atención si borra el préstamo se perderán sus datos.<br> ¿Desea eliminar el préstamo?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loanService.deleteLoan(loan.id).subscribe(() => {
          this.loadPage();
        });
      }
    });
  }
}
