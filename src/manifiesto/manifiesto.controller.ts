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
  constructor(private readonly manifiestoService: ManifiestoService) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy.' })
  healthCheck() {
    return { message: 'Manifiesto Service is running', status: 'ok' };
  }

  @Get('estados')
  @Roles('admin', 'user', 'viewer')
  @ApiOperation({ summary: 'Obtener lista de estados disponibles' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de estados únicos.',
    schema: {
      type: 'array',
      items: { type: 'string' }
    }
  })
  getEstados() {
    return this.manifiestoService.getEstados();
  }

  @Get('estadisticas')
  @Roles('admin', 'user', 'viewer')
  @ApiOperation({ summary: 'Obtener estadísticas de manifiestos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas de manifiestos por estado y tipo.',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        porEstado: { 
          type: 'array', 
          items: { 
            type: 'object',
            properties: {
              estado: { type: 'string' },
              count: { type: 'number' }
            }
          }
        },
        porTipo: { 
          type: 'array', 
          items: { 
            type: 'object',
            properties: {
              tipo: { type: 'string' },
              count: { type: 'number' }
            }
          }
        }
      }
    }
  })
  getEstadisticas() {
    return this.manifiestoService.getEstadisticas();
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
      const result = await this.manifiestoService.consultaMftocGTIME(consultaDto);
      console.log('✅ Resultado obtenido:', result.length, 'registros');
      return result;
    } catch (error) {
      console.error('❌ Error en consultaGtime:', error);
      throw error;
    }
  }

  @Public()
  @Get('test-oracle')
  @ApiOperation({ summary: 'Test directo de Oracle' })
  async testOracle() {
    try {
      console.log('🔍 Test directo de Oracle iniciado');
      const result = await this.manifiestoService.consultaMftocGTIME({
        EdFechaInicio: '01/01/2024',
        EdFechaTermino: '31/12/2024',
        EdVisado: 'TODOS',
        EdTipoViaTransporte: 'TODOS'
      });
      console.log('✅ Test Oracle exitoso:', result.length, 'registros');
      return { success: true, count: result.length, data: result.slice(0, 2) };
    } catch (error) {
      console.error('❌ Error en testOracle:', error);
      return { success: false, error: error.message };
    }
  }

  @Public()
  @Get('test-simple')
  @ApiOperation({ summary: 'Test simple sin fechas' })
  async testSimple() {
    try {
      console.log('🔍 Test simple iniciado');
      const result = await this.manifiestoService.consultaMftocGTIME({
        EdVisado: 'TODOS',
        EdTipoViaTransporte: 'TODOS'
      });
      console.log('✅ Test simple exitoso:', result.length, 'registros');
      return { success: true, count: result.length, data: result.slice(0, 2) };
    } catch (error) {
      console.error('❌ Error en testSimple:', error);
      return { success: false, error: error.message };
    }
  }

  @Public()
  @Get('test-basic')
  @ApiOperation({ summary: 'Test básico con tabla simple' })
  async testBasic(@Query('numero') numero?: string) {
    try {
      console.log('🔍 Test básico iniciado con número:', numero);
      const result = await this.manifiestoService.testBasicQuery(numero);
      console.log('✅ Test básico exitoso:', result.length, 'registros');
      return { success: true, count: result.length, data: result };
    } catch (error) {
      console.error('❌ Error en testBasic:', error);
      return { success: false, error: error.message };
    }
  }

  @Public()
  @Get('test-basic2')
  @ApiOperation({ summary: 'Test básico con TypeORM' })
  async testBasic2(@Query('numero') numero?: string) {
    try {
      console.log('🔍 Test básico2 (TypeORM) iniciado con número:', numero);
      const result = await this.manifiestoService.testBasicQuery2(numero);
      console.log('✅ Test básico2 exitoso:', result.length, 'registros');
      return { success: true, count: result.length, data: result };
    } catch (error) {
      console.error('❌ Error en testBasic2:', error);
      return { success: false, error: error.message };
    }
  }

  @Public()
  @Get('test-basic3')
  @ApiOperation({ summary: 'Test básico con stored procedure nativo' })
  async testBasic3(@Query('numero') numero?: string) {
    try {
      console.log('🔍 Test básico3 (Stored Procedure) iniciado con número:', numero);
      const result = await this.manifiestoService.testBasicQuery3(numero);
      console.log('✅ Test básico3 exitoso:', result.length, 'registros');
      return { success: true, count: result.length, data: result };
    } catch (error) {
      console.error('❌ Error en testBasic3:', error);
      return { success: false, error: error.message };
    }
  }
}

