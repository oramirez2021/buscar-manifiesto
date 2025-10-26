import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para identificador de documento
 */
export class OidDto {
    @ApiProperty({ description: 'ID del documento', example: 12345 })
    Id: number;
}

/**
 * DTO para respuesta de guías GTIME asociadas a un manifiesto
 * Contiene información detallada de cada guía individual como emisor, consignatario, productos, peso, valor, etc.
 */
export class GuiaManifiestoResponseDto {
    @ApiProperty({ description: 'Identificador del documento', type: OidDto })
    Oid: OidDto;

    @ApiProperty({ description: 'Número de documento', example: 'GTIME-IVAD-08092025025' })
    NumeroDoc: string;

    @ApiProperty({ description: 'Nombre del emisor', example: 'DHL Express' })
    NombreEmisor: string;

    @ApiProperty({ description: 'Total de bultos', example: 5 })
    TotalBultos: number;

    @ApiProperty({ description: 'Total peso en kg', example: 12.5 })
    TotalPeso: number;

    @ApiProperty({ description: 'Valor declarado en USD', example: 150.00 })
    TotalValor: number;

    @ApiProperty({ description: 'Consignante', example: 'Empresa Exportadora S.A.' })
    Consignante: string;

    @ApiProperty({ description: 'Consignatario', example: 'Juan Pérez' })
    Consignatario: string;

    @ApiProperty({ description: 'RUT consignatario', example: '12345678-9' })
    rutconsignatario: string;

    @ApiProperty({ description: 'Productos', example: 'Ropa, Electrónicos' })
    Productos: string;

    @ApiProperty({ description: 'Marcas del documento - representa id envio', example: 'Marca1, Marca2' })
    marcas: string;

    @ApiProperty({ description: 'Vistos buenos', example: 'SI/NO' })
    VistosBuenos: string;

    @ApiProperty({ description: 'Es tránsito', example: 'SI/NO' })
    Transito: string;

    @ApiProperty({ description: 'Fecha de creación (fechaactiva del query)', example: '2024-01-15 10:30:00' })
    FechaCreacion: string;

    @ApiProperty({ description: 'Estado actual', example: 'ACTIVO' })
    EstadoActual: string;

    @ApiProperty({ description: 'Detalle', example: 'Más Info.' })
    Detalle: string;

    @ApiProperty({ description: 'HTML para ver PDF' })
    verPDF: string;

    @ApiProperty({ description: 'Número de documento (duplicado)', example: 'GTIME-IVAD-08092025025' })
    Numero: string;

    @ApiProperty({ description: 'Tipo de documento', example: 'GUIA TIME' })
    TipoDoc: string;

    @ApiProperty({ description: 'Código tipo documento', example: 'GTIME' })
    CodigoTipoDoc: string;

    @ApiProperty({ description: 'Cantidad de denuncias (cant_denuncias del query)', example: 0 })
    cantidadDenuncias: number;

    @ApiProperty({ description: 'Transbordos', example: 'Transbordo aéreo' })
    Transbordos: string;

    @ApiProperty({ description: 'Motivo de selección', example: 'Alto valor' })
    MotivoSeleccion: string;

    @ApiProperty({ description: 'Tipo RUT consignatario', example: 'rutEmbajada' })
    tipoRutConsignatario: string;

    @ApiProperty({ description: 'Observación IVA-COB', example: 'Observación de IVA' })
    ivacob: string;

    @ApiProperty({ description: 'Clasificación fiscal con colores HTML + propuesta', example: '<span class="color-box verde" title="LIBRE"></span>LIBRE' })
    propuesta: string;

    @ApiPropertyOptional({ description: 'Datos PDF en formato JSON', example: {} })
    pdfData?: any;
}
