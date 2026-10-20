import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pageable } from '../core/model/page/Pageable';
import { PaginatedData } from './../core/model/page/PaginatedData';
import { Loan } from './model/Loan';

@Injectable({
  providedIn: 'root',
})
export class LoanService {
  protected readonly http = inject(HttpClient);

  private baseUrl = 'http://localhost:8080/loan';

  getLoans(
    pageable: Pageable,
    gameId?: number,
    clientId?: number,
    date?: string,
  ): Observable<PaginatedData<Loan>> {
    return this.http.post<PaginatedData<Loan>>(this.composeFindUrl(gameId, clientId, date), {
      pageable: pageable,
    });
  }

  saveLoan(loan: Loan): Observable<void> {
    const { id } = loan;
    const url = id ? `${this.baseUrl}/${id}` : this.baseUrl;

    return this.http.put<void>(url, loan);
  }

  deleteLoan(idLoan: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${idLoan}`);
  }

  private composeFindUrl(gameId?: number, clientId?: number, date?: string): string {
    const params = new URLSearchParams();
    if (gameId) {
      params.set('idGame', gameId.toString());
    }
    if (clientId) {
      params.set('idClient', clientId.toString());
    }
    if (date) {
      params.set('date', date);
    }
    const queryString = params.toString();
    return queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
  }
}
