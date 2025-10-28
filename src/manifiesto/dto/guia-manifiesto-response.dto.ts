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

    @ApiProperty({ description: 'ID del documento en docdocumentobase', example: 12345678 })
    idDocumento: number;

    @ApiProperty({ description: 'Número de documento (NumeroDoc en el monolito)', example: 'GTIME-IVAD-08092025025' })
    nroGuia: string;

    @ApiProperty({ description: 'Nombre del emisor', example: 'DHL Express' })
    NombreEmisor: string;

    @ApiProperty({ description: 'Total de bultos', example: 5 })
    TotalBultos: number;

    @ApiProperty({ description: 'Total peso en kg', example: 12.5 })
    TotalPeso: number;

    @ApiProperty({ description: 'Valor declarado en USD', example: 150.00 })
    TotalValor: number;

    @ApiProperty({ description: 'Nombre del consignante (quien envía la mercancía)', example: 'Empresa Exportadora S.A.' })
    Consignante: string;

    @ApiProperty({ description: 'Nombre del consignatario (destinatario de la mercancía)', example: 'Juan Pérez' })
    Consignatario: string;

    @ApiProperty({ description: 'RUT del consignatario en formato chileno', example: '12345678-9' })
    rutconsignatario: string;

    @ApiProperty({ description: 'Descripción de los productos contenidos en la guía', example: 'Ropa, Electrónicos' })
    Productos: string;

    @ApiProperty({ description: 'Marcas del documento - representa IDs de envíos asociados', example: 'Marca1, Marca2' })
    marcas: string;

    @ApiProperty({ description: 'Indica si la guía tiene vistos buenos aprobados', example: 'SI', enum: ['SI', 'NO'] })
    VistosBuenos: string;

    @ApiProperty({ description: 'Indica si la guía es de tránsito', example: 'NO', enum: ['SI', 'NO'] })
    Transito: string;

    @ApiProperty({ description: 'Fecha de creación (fechaactiva del query)', example: '2024-01-15 10:30:00' })
    FechaCreacion: string;

    @ApiProperty({ description: 'Estado actual del documento en el sistema', example: 'ACTIVO' })
    EstadoActual: string;

    @ApiProperty({ description: 'Detalle del documento para mostrar más información', example: 'Más Info.' })
    Detalle: string;

    @ApiProperty({ description: 'HTML generado para visualizar el PDF del documento' })
    verPDF: string;

    @ApiProperty({ description: 'Número de documento (duplicado)', example: 'GTIME-IVAD-08092025025' })
    Numero: string;

    @ApiProperty({ description: 'Tipo de documento', example: 'GUIA TIME' })
    TipoDoc: string;

    @ApiProperty({ description: 'Código tipo documento', example: 'GTIME' })
    CodigoTipoDoc: string;

    @ApiProperty({ description: 'Cantidad de denuncias (cant_denuncias del query)', example: 0 })
    cantidadDenuncias: number;

    @ApiProperty({ description: 'Información sobre transbordos realizados', example: 'Transbordo aéreo' })
    Transbordos: string;

    @ApiProperty({ description: 'Motivo por el cual fue seleccionada para fiscalización', example: 'Alto valor' })
    MotivoSeleccion: string;

    @ApiProperty({ description: 'Tipo de RUT del consignatario (rutBuzon, rutEmbajada, rutEmpresa, etc.)', example: 'rutEmbajada', enum: ['rutBuzon', 'rutEmbajada', 'rutEmpresa', ''] })
    tipoRutConsignatario: string;

    @ApiProperty({ description: 'Observación relacionada con IVA-COB', example: 'Observación de IVA' })
    ivacob: string;

    @ApiProperty({ description: 'Clasificación fiscal con colores HTML y propuesta de decisión', example: '<span class="color-box verde" title="LIBRE"></span>LIBRE' })
    propuesta: string;

    @ApiPropertyOptional({ description: 'Datos PDF en formato JSON', example: {} })
    pdfData?: any;
}
