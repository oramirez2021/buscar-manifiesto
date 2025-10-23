import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'manifiestos' })
export class ManifiestoEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  numero!: string;

  @Column({ type: 'date' })
  fecha!: Date;

  @Column({ type: 'varchar', length: 50 })
  estado!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tipoManifiesto?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  origen?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  destino?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transportista?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  placa?: string;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
