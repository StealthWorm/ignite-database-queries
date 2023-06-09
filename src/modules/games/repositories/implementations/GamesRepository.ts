import { getRepository, Repository } from 'typeorm';

import { User } from '../../../users/entities/User';
import { Game } from '../../entities/Game';

import { IGamesRepository } from '../IGamesRepository';

export class GamesRepository implements IGamesRepository {
  private repository: Repository<Game>;

  constructor() {
    this.repository = getRepository(Game);
  }

  async findByTitleContaining(param: string): Promise<Game[]> {
    return this.repository
      .createQueryBuilder("game")
      .where("LOWER(game.title) LIKE LOWER(:title)", { title: `%${param}%` })
      .getMany();
  }

  async countAllGames(): Promise<[{ count: string }]> {
    return this.repository.query(
      `SELECT COUNT(*) 
       FROM games 
      `
    );
  }

  async findUsersByGameId(id: string): Promise<User[]> {
    const queryBuilder = this.repository
      .createQueryBuilder("game")
      .leftJoinAndSelect("game.users", "user")
      .where("game.id = :id", { id })
      .getOne();

    const game = await queryBuilder;

    if (!game) {
      throw new Error("Game not found.");
    }

    return game.users;
  }
}
