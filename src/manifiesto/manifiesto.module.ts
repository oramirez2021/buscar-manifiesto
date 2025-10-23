import { Module } from '@nestjs/common';
import { ManifiestoController } from './manifiesto.controller';
import { ManifiestoService } from './manifiesto.service';
import { OracleService } from './oracle.service';

@Module({
  controllers: [ManifiestoController],
  providers: [ManifiestoService, OracleService],
  exports: [ManifiestoService, OracleService], // Exportar los servicios para uso en otros módulos
})
export class ManifiestoModule {}

