import { Column, Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'DOCDOCUMENTOBASE', schema: 'DOCUMENTOS' })
export class ManifiestoEntity {
  @PrimaryColumn({ name: 'ID', type: 'number' })
  id!: number;

  @Column({ name: 'NUMEROEXTERNO', type: 'varchar', length: 200 })
  numero!: string;

  @Column({ name: 'EMISOR', type: 'varchar', length: 200, nullable: true })
  emisor?: string;

  @Column({ name: 'FECHACREACION', type: 'date', nullable: true })
  fechaCreacion?: Date;
}
