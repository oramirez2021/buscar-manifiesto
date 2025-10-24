import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreateManifiestoDto } from './dto/create-manifiesto.dto';
import { UpdateManifiestoDto } from './dto/update-manifiesto.dto';
import { BuscarManifiestoDto } from './dto/buscar-manifiesto.dto';
import { ConsultaGtimeDto } from './dto/consulta-gtime.dto';
import { OracleService } from './oracle.service';
import { ManifiestoEntity } from './entities/manifiesto.entity';

@Injectable()
export class ManifiestoService {
  constructor(
    @InjectRepository(ManifiestoEntity)
    private readonly manifiestoRepo: Repository<ManifiestoEntity>,
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
      consultaDto.guiaCourier,
      consultaDto.EdNombrePersona,
      consultaDto.MRevisionMFTOC_pageCode
    );
  }

  async testBasicQuery(numeroExterno?: string) {
    return await this.oracleService.testBasicQuery(numeroExterno);
  }

  async testBasicQuery2(numeroExterno?: string) {
    try {
      if (numeroExterno) {
        const manifiestos = await this.manifiestoRepo.find({
          where: {
            numero: Like(`%${numeroExterno}%`)
          },
          take: 10
        });
        return manifiestos;
      } else {
        const manifiestos = await this.manifiestoRepo.find({
          take: 10
        });
        return manifiestos;
      }
    } catch (error) {
      console.error('Error en testBasicQuery2:', error);
      throw error;
    }
  }

  async testBasicQuery3(numeroExterno?: string) {
    try {
      console.log('🔍 Iniciando testBasicQuery3 con stored procedure nativo');
      return await this.oracleService.testBasicQuery3(numeroExterno);
    } catch (error) {
      console.error('Error en testBasicQuery3:', error);
      throw error;
    }
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
}
