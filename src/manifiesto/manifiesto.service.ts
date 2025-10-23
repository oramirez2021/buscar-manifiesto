import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateManifiestoDto } from './dto/create-manifiesto.dto';
import { UpdateManifiestoDto } from './dto/update-manifiesto.dto';
import { BuscarManifiestoDto } from './dto/buscar-manifiesto.dto';
import { ConsultaGtimeDto } from './dto/consulta-gtime.dto';
import { OracleService } from './oracle.service';

@Injectable()
export class ManifiestoService {
  constructor(
    private readonly oracleService: OracleService,
  ) {}

  // Métodos simplificados para el servicio básico
  async getEstados(): Promise<string[]> {
    return ['PEND', 'SI', 'NCMP', 'TODOS'];
  }

  async getEstadisticas() {
    return {
      total: 0,
      porEstado: [],
      porTipo: []
    };
  }

  async consultaMftocGTIME(consultaDto: ConsultaGtimeDto) {
    return await this.oracleService.consultaMftocGTIME(
      consultaDto.EdIdPersona,
      consultaDto.EdFechaInicio,
      consultaDto.EdFechaTermino,
      consultaDto.EdVisado,
      consultaDto.EdTipoViaTransporte,
      consultaDto.EdNroManifiesto,
      consultaDto.guiaCourier
    );
  }

  async testBasicQuery(numeroExterno?: string) {
    return await this.oracleService.testBasicQuery(numeroExterno);
  }
}
