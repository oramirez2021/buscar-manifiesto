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
  @ApiOperation({ summary: 'Consulta manifiestos GTIME desde Oracle' })
  @ApiResponse({
    status: 200,
    description: 'Lista de manifiestos GTIME encontrados.',
    type: [ManifiestoGtimeResponseDto]
  })
  @ApiResponse({ status: 500, description: 'Error en la consulta a Oracle.' })
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
  @ApiOperation({ summary: 'Obtener marcas de un documento GTIME usando gtime_getmarcasasstring' })
  @ApiResponse({
    status: 200,
    description: 'Marcas obtenidas exitosamente.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        idgtime: { type: 'number' },
        marcas: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 500, description: 'Error al obtener las marcas.' })
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
}

