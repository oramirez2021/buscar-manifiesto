import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreateManifiestoDto } from './dto/create-manifiesto.dto';
import { UpdateManifiestoDto } from './dto/update-manifiesto.dto';
import { BuscarManifiestoDto } from './dto/buscar-manifiesto.dto';
import { ConsultaGtimeDto } from './dto/consulta-gtime.dto';
import { ConsultaGuiasManifiestoDto } from './dto/consulta-guias-manifiesto.dto';
import { OracleService } from './oracle.service';
import { ManifiestoEntity } from './entities/manifiesto.entity';

@Injectable()
export class ManifiestoService {
  constructor(
    @InjectRepository(ManifiestoEntity)
    private readonly manifiestoRepo: Repository<ManifiestoEntity>,
    private readonly oracleService: OracleService,
  ) { }


  async consultaMftocGTIME(consultaDto: ConsultaGtimeDto) {
    return await this.oracleService.consultaMftocGTIME(
      consultaDto.EdIdPersona,
      consultaDto.EdFechaInicio,
      consultaDto.EdFechaTermino,
      consultaDto.EdVisado,
      consultaDto.EdTipoViaTransporte,
      consultaDto.EdNroManifiesto,
      consultaDto.guiaCourier,
      consultaDto.EdNombrePersona,
      consultaDto.MRevisionMFTOC_pageCode
    );
  }

  async consultaMFTOC(consultaDto: ConsultaGtimeDto) {
    return await this.oracleService.consultaMFTOC(
      consultaDto.EdIdPersona,
      consultaDto.EdFechaInicio,
      consultaDto.EdFechaTermino,
      consultaDto.EdVisado,
      consultaDto.EdTipoViaTransporte,
      consultaDto.EdNroManifiesto,
      consultaDto.guiaCourier,
      consultaDto.EdNombrePersona,
      consultaDto.MRevisionMFTOC_pageCode
    );
  }




  async gtimeGetMarcasAsString(idgtime: number) {
    try {
      console.log(`🔍 Obteniendo marcas para idgtime: ${idgtime}`);
      return await this.oracleService.gtimeGetMarcasAsString(idgtime);
    } catch (error) {
      console.error('Error en gtimeGetMarcasAsString:', error);
      throw error;
    }
  }

  async consultaGuiasPorManifiesto(consultaDto: ConsultaGuiasManifiestoDto) {
    return await this.oracleService.consultaGuiasPorManifiesto(
      consultaDto.numeroManifiesto,
      consultaDto.nroGuia
    );
  }
}
