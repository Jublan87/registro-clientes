import { Injectable, Inject } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Cliente } from '../../domain/entities/cliente.entity';

@Injectable()
export class ClienteRepository {
  private readonly repo: Repository<Cliente>;
  constructor(@Inject('DATA_SOURCE') private readonly dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(Cliente);
  }

  saveBatch(clients: Cliente[]): Promise<Cliente[]> {
    return this.repo.save(clients);
  }
}
