import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManifiestoController } from './manifiesto.controller';
import { ManifiestoService } from './manifiesto.service';
import { OracleService } from './oracle.service';
import { ManifiestoEntity } from './entities/manifiesto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ManifiestoEntity])],
  controllers: [ManifiestoController],
  providers: [ManifiestoService, OracleService],
  exports: [ManifiestoService, OracleService], // Exportar los servicios para uso en otros módulos
})
export class ManifiestoModule {}

