import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsultaGtimeDto } from './dto/consulta-gtime.dto';
import { ConsultaGuiasManifiestoDto } from './dto/consulta-guias-manifiesto.dto';
import { OracleService } from './oracle.service';
import { ClasificadorGuiasService } from './services/clasificador-guias.service';
import { ClasificacionResult } from './dto/clasificacion-result.dto';
import { ManifiestoEntity } from './entities/manifiesto.entity';

@Injectable()
export class ManifiestoService {
  constructor(
    @InjectRepository(ManifiestoEntity)
    private readonly manifiestoRepo: Repository<ManifiestoEntity>,
    private readonly oracleService: OracleService,
    private readonly clasificadorGuiasService: ClasificadorGuiasService,
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
      consultaDto.MRevisionMFTOC_pageCode,
      consultaDto.pagina,
      consultaDto.porPagina
    );
  }




  async consultaGuiasPorManifiesto(consultaDto: ConsultaGuiasManifiestoDto) {
    const guias = await this.oracleService.consultaGuiasPorManifiesto(
      consultaDto.numeroManifiesto,
      consultaDto.nroGuia,
      consultaDto.pagina,
      consultaDto.porPagina
    );

    // Aplicar clasificación fiscal a cada guía
    return guias.map(guia => {
      const clasificacion = this.getClasificacionFiscal(guia);
      return {
        ...guia,
        propuesta: clasificacion.propuesta,
        rutconsignatario: clasificacion.rutconsignatario
      };
    });
  }

  private getClasificacionFiscal(guia: any): { propuesta: string, rutconsignatario: string } {
    const clasificacion = ClasificadorGuiasService.clasificarGuia(
      { tipoRutConsignatario: guia.tipoRutConsignatario },
      guia.sumaValores || 0,
      guia.sobreTopePorRut || 0,
      guia.rutconsignatario || ''
    );

    const color = clasificacion.amarillo + clasificacion.naranjo + clasificacion.rojo + clasificacion.verde;

    // Lógica del link para rutconsignatario (línea 596-601 del DAO)
    let rutconsignatario = guia.rutconsignatario || '';
    if (clasificacion.verde === '') {
      // Si NO es verde, crear link clickeable
      rutconsignatario = `<a href="#" onclick="javascript:getDetalle('${guia.Id}','1','GTIME','${guia.rutconsignatario}');return false;">${guia.rutconsignatario}</a>`;
    }

    return {
      propuesta: color + clasificacion.propuesta,
      rutconsignatario: rutconsignatario
    };
  }
}
