import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Res
} from '@nestjs/common';
import { Response } from 'express';
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
import { PdfGeneratorService } from './services/pdf-generator.service';
import { ManifiestoGtimeResponseDto } from './dto/manifiesto-gtime-response.dto';

@ApiTags('manifiestos')
@ApiBearerAuth()
@Controller('manifiestos')
export class ManifiestoController {
  constructor(
    private readonly manifiestoService: ManifiestoService,
    private readonly pdfGeneratorService: PdfGeneratorService
  ) { }

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

  // @Post('test-pdf')
  async testPdf(@Res() res: Response): Promise<void> {
    try {
      const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<Documento tipo="GTIME" version="1.0">
 <valor-declarado>16.64</valor-declarado>
 <moneda-valor>USD</moneda-valor>
 <parcial>N</parcial>
 <numero-referencia>84422</numero-referencia>
 <unidad-peso>KGM</unidad-peso>
 <tipo-operacion>I</tipo-operacion>
 <total-peso>0.2</total-peso>
 <tipo-accion>I</tipo-accion>
 <total-bultos>1</total-bultos>
 <total-item>1</total-item>
 <login>ymendez</login>
 <Fechas>
  <fecha>
   <valor>15-05-2019</valor>
   <nombre>FEM</nombre>
  </fecha>
  <fecha>
   <valor>07-05-2019 16:40</valor>
   <nombre>FZARPE</nombre>
  </fecha>
 </Fechas>
 <Locaciones>
  <locacion>
   <descripcion>SANTIAGO</descripcion>
   <nombre>PD</nombre>
   <codigo>SCL</codigo>
  </locacion>
  <locacion>
   <descripcion>MIAMI</descripcion>
   <nombre>PE</nombre>
   <codigo>MIA</codigo>
  </locacion>
 </Locaciones>
 <Participaciones>
  <participacion>
   <nacion-id>CL</nacion-id>
   <valor-id>16573096-8</valor-id>
   <codigo-pais>CL</codigo-pais>
   <direccion>Zurich 261, Las Condes</direccion>
   <nombres>MENDEZ TRONCOSO, YERKO WILLIAM</nombres>
   <nombre>EMI</nombre>
   <tipo-id>RUT</tipo-id>
  </participacion>
  <participacion>
   <nacion-id>CL</nacion-id>
   <codigo-pais>CL</codigo-pais>
   <valor-id>16573096-8</valor-id>
   <nombres>MENDEZ TRONCOSO, YERKO WILLIAM</nombres>
   <direccion>ERRAZURIZ 755</direccion>
   <comuna>VALPARAISO</comuna>
   <tipo-id>RUT</tipo-id>
   <nombre>TRA</nombre>
  </participacion>
  <participacion>
   <nacion-id>US</nacion-id>
   <codigo-pais>US</codigo-pais>
   <direccion>ERRAZURIZ 755</direccion>
   <nombres>NASSAU LENS FLORIDA</nombres>
   <comuna>VALPARAISO</comuna>
   <nombre>CNTE</nombre>
   <tipo-id>RUT</tipo-id>
  </participacion>
  <participacion>
   <nacion-id>CL</nacion-id>
   <valor-id>16356749-0</valor-id>
   <codigo-pais>CL</codigo-pais>
   <direccion>ERRAZURIZ 755</direccion>
   <nombres>MAURICIO MUÃ?OZ</nombres>
   <comuna>VALPARAISO</comuna>
   <nombre>CONS</nombre>
  </participacion>
 </Participaciones>
 <Referencias>
  <referencia>
   <numero>84571</numero>
   <fecha>15-05-2019</fecha>
   <tipo-referencia>REF</tipo-referencia>
   <valor-id-emisor>16573096-8</valor-id-emisor>
   <nac-id-emisor>CL</nac-id-emisor>
   <tipo-id-emisor>RUT</tipo-id-emisor>
   <emisor>MENDEZ TRONCOSO, YERKO WILLIAM</emisor>
   <tipo-documento>MFTOC</tipo-documento>
  </referencia>
 </Referencias>
 <Items>
  <item>
   <marcas>84365</marcas>
   <numero-item>1</numero-item>
   <peso-bruto>0.2</peso-bruto>
   <cantidad>1</cantidad>
   <unidad-peso>KGM</unidad-peso>
   <tipo-bulto>61</tipo-bulto>
   <ProdItem>
    <proditem>
     <descripcion>PRODUCTOS OPTICOS</descripcion>
     <unidad-medida>UNI</unidad-medida>
     <moneda>USD</moneda>
     <cantidad>1</cantidad>
     <valor-declarado>16.64</valor-declarado>
    </proditem>
   </ProdItem>
  </item>
 </Items>
</Documento>`;

      const pdf = await this.pdfGeneratorService.generatePdf('84422', xml);
      const fileName = 'GTIME_84422.pdf';

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', pdf.length.toString());

      res.end(pdf);
    } catch (error) {
      res.status(500).json({
        message: 'Error generando PDF',
        error: error.message
      });
    }
  }
}

