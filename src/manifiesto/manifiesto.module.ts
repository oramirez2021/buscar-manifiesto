import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManifiestoController } from './manifiesto.controller';
import { ManifiestoService } from './manifiesto.service';
import { OracleService } from './oracle.service';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { ClasificadorGuiasService } from './services/clasificador-guias.service';
import { ManifiestoEntity } from './entities/manifiesto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ManifiestoEntity])],
  controllers: [ManifiestoController],
  providers: [ManifiestoService, OracleService, PdfGeneratorService, ClasificadorGuiasService],
  exports: [ManifiestoService, OracleService, PdfGeneratorService, ClasificadorGuiasService],
})
export class ManifiestoModule { }

