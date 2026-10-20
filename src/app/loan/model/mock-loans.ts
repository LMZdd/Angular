import { PaginatedData } from '../../core/model/page/PaginatedData';
import { Loan } from './Loan';

export const LOAN_DATA: PaginatedData<Loan> = {
  content: [
    {
      id: 1,
      game: {
        id: 1,
        title: 'Juego 1',
        age: 6,
        category: { id: 1, name: 'Categoría 1' },
        author: { id: 1, name: 'Autor 1', nationality: 'Nacionalidad 1' },
      },
      client: { id: 1, name: 'Cliente 1' },
      startDate: '2026-10-01',
      endDate: '2026-10-10',
    },
    {
      id: 2,
      game: {
        id: 2,
        title: 'Juego 2',
        age: 8,
        category: { id: 1, name: 'Categoría 1' },
        author: { id: 2, name: 'Autor 2', nationality: 'Nacionalidad 2' },
      },
      client: { id: 2, name: 'Cliente 2' },
      startDate: '2026-10-05',
      endDate: '2026-10-12',
    },
  ],
  pageable: {
    pageSize: 5,
    pageNumber: 0,
    sort: [{ property: 'id', direction: 'ASC' }],
  },
  totalElements: 2,
};
