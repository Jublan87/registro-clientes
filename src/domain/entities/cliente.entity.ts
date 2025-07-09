import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'clientes' })
export class Cliente {
  @PrimaryColumn({ length: 6 })
  id: string;

  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column('int')
  age: number;
}
