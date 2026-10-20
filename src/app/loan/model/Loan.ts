import { Game } from '../../game/model/Game';
import { Client } from '../../client/model/Client';

export interface Loan {
  id: number;
  startDate: string;
  endDate: string;
  game: Game;
  client: Client;
}
