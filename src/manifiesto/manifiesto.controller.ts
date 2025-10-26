import {
  Controller,
  Get,
  Query
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse
} from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { ManifiestoService } from './manifiesto.service';
import { ConsultaGtimeDto } from './dto/consulta-gtime.dto';
import { ConsultaGuiasManifiestoDto } from './dto/consulta-guias-manifiesto.dto';
import { GuiaManifiestoResponseDto } from './dto/guia-manifiesto-response.dto';
import { ManifiestoGtimeResponseDto } from './dto/manifiesto-gtime-response.dto';

@ApiTags('manifiestos')
@ApiBearerAuth()
@Controller('manifiestos')
export class ManifiestoController {
  constructor(private readonly manifiestoService: ManifiestoService) { }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy.' })
  healthCheck() {
    return { message: 'Manifiesto Service is running', status: 'ok' };
  }



  @Public()
  @Get('consulta-gtime')
  @ApiOperation({
    summary: 'Consulta manifiestos GTIME desde Oracle',
    description: 'Endpoint que consulta manifiestos GTIME desde la base de datos Oracle. Si se proporciona un número de manifiesto específico, usa consultaMftocGTIME. Si no, usa consultaMFTOC con filtros de fecha. Devuelve información básica de manifiestos (no guías individuales).'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de manifiestos GTIME encontrados. Cada manifiesto contiene información básica como número, fecha, estado, transportista, etc.',
    type: [ManifiestoGtimeResponseDto]
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de entrada inválidos o malformados.'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor al consultar Oracle.'
  })
  async consultaGtime(@Query() consultaDto: ConsultaGtimeDto) {
    try {
      console.log('🔍 Consulta recibida:', consultaDto);

      // LÓGICA CONDICIONAL: Si hay número de manifiesto, usar consultaMftocGTIME (existente)
      // Si NO hay número de manifiesto, usar consultaMFTOC (nuevo)
      let result;
      if (consultaDto.EdNroManifiesto && consultaDto.EdNroManifiesto.trim() !== '') {
        console.log('📋 Búsqueda por número de manifiesto específico - usando consultaMftocGTIME');
        result = await this.manifiestoService.consultaMftocGTIME(consultaDto);
      } else {
        console.log('📅 Búsqueda por fechas - usando consultaMFTOC');
        result = await this.manifiestoService.consultaMFTOC(consultaDto);
      }

      console.log('✅ Resultado obtenido:', result.length, 'registros');
      return result;
    } catch (error) {
      console.error('❌ Error en consultaGtime:', error);
      throw error;
    }
  }






  @Public()
  @Get('marcas')
  @ApiOperation({
    summary: 'Obtener marcas de un documento GTIME',
    description: 'Endpoint que obtiene las marcas asociadas a un documento GTIME específico usando la función Oracle gtime_getmarcasasstring.'
  })
  @ApiResponse({
    status: 200,
    description: 'Marcas obtenidas exitosamente.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        idgtime: { type: 'number', example: 12345 },
        marcas: { type: 'string', example: 'Marca1, Marca2, Marca3' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetro idgtime inválido o faltante.'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor al consultar Oracle.'
  })
  async getMarcas(@Query('idgtime') idgtime: string) {
    try {
      const idgtimeNumber = parseInt(idgtime);
      if (isNaN(idgtimeNumber)) {
        return { success: false, error: 'idgtime debe ser un número válido' };
      }

      console.log(`🔍 Obteniendo marcas para idgtime: ${idgtimeNumber}`);
      const marcas = await this.manifiestoService.gtimeGetMarcasAsString(idgtimeNumber);
      console.log('✅ Marcas obtenidas exitosamente');

      return {
        success: true,
        idgtime: idgtimeNumber,
        marcas: marcas
      };
    } catch (error) {
      console.error('❌ Error en getMarcas:', error);
      return { success: false, error: error.message };
    }
  }

  @Public()
  @Get('guias-por-manifiesto')
  @ApiOperation({
    summary: 'Consulta guías asociadas a un manifiesto específico',
    description: 'Replica la funcionalidad de MDetalleDocumento.jsp para obtener guías GTIME asociadas a un manifiesto. Devuelve información detallada de cada guía individual (no información del manifiesto).'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de guías GTIME asociadas al manifiesto. Cada guía contiene detalles como número de documento, emisor, consignatario, productos, peso, valor declarado, etc.',
    type: [GuiaManifiestoResponseDto]
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de entrada inválidos'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor al consultar Oracle'
  })
  async consultaGuiasPorManifiesto(@Query() consultaDto: ConsultaGuiasManifiestoDto) {
    try {
      console.log('🔍 Consulta guías por manifiesto:', consultaDto);
      const result = await this.manifiestoService.consultaGuiasPorManifiesto(consultaDto);
      console.log('✅ Guías encontradas:', result.length, 'registros');
      return result;
    } catch (error) {
      console.error('❌ Error en consultaGuiasPorManifiesto:', error);
      throw error;
    }
  }
}

