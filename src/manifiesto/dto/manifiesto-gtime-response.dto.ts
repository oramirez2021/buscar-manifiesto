import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para respuesta de manifiestos GTIME
 * Contiene información básica de manifiestos como número, fecha, estado, transportista, etc.
 */
export class ManifiestoGtimeResponseDto {
  @ApiProperty({ description: 'ID único del manifiesto en la base de datos', example: 84671 })
  id!: number;

  @ApiProperty({ description: 'Número de referencia del manifiesto', example: 'MFTOC-2024-001' })
  nroReferencia!: string;

  @ApiProperty({ description: 'Tipo de referencia del manifiesto', example: 'MFTOC' })
  tipoRef!: string;

  @ApiProperty({ description: 'Número de guía master asociada al manifiesto', example: 'GTIME-MASTER-001' })
  nroGuiaMaster!: string;

  @ApiProperty({ description: 'Número de vuelo para envíos aéreos', example: 'LA501' })
  nroVuelo!: string;

  @ApiProperty({ description: 'Nombre de la compañía courier', example: 'DHL Express' })
  ciaCourier!: string;

  @ApiProperty({ description: 'Nombre de la compañía de transporte', example: 'Latam Cargo' })
  ciaTransporte!: string;

  @ApiProperty({ description: 'Cantidad total de guías asociadas al manifiesto', example: 25 })
  nroGuiasAsociadas!: number;

  @ApiProperty({ description: 'Peso total de todas las guías del manifiesto en kg', example: 125.5 })
  pesoGuias!: number;

  @ApiProperty({ description: 'Valor total declarado de todas las guías en USD', example: 1500.75 })
  valorTotal!: number;

  @ApiProperty({ description: 'Puerto o aeropuerto de embarque', example: 'SCL - Santiago' })
  puertoEmbarque!: string;

  @ApiProperty({ description: 'Puerto o aeropuerto de desembarque', example: 'MIA - Miami' })
  puertoDesembarque!: string;

  @ApiProperty({ description: 'Fecha de aceptación del manifiesto', example: '2024-10-22T10:30:00Z' })
  fechaAceptacion!: Date;

  @ApiProperty({ description: 'Fecha de aceptación en formato legible', example: '22/10/2024' })
  fechaAceptacionFormateada!: string;

  @ApiProperty({ description: 'Fecha en que fue conformado el manifiesto', example: '22/10/2024' })
  fechaConformado!: string;

  @ApiProperty({ description: 'Cantidad de guías marcadas por fiscalización', example: 5 })
  totalGuiasMarcadas!: number;

  @ApiProperty({ description: 'Cantidad de guías con valor declarado mayor a 30 USD', example: 10 })
  totalGuiasMas30!: number;

  @ApiProperty({ description: 'Estado del visado del manifiesto', example: 'PEND', enum: ['PEND', 'SI', 'NCMP'] })
  estaVisado!: string;

  @ApiProperty({ description: 'Número de referencia original del manifiesto', example: 'MFTOC-2024-001' })
  nroRefOriginal!: string;

  @ApiProperty({ description: 'Estado de consolidado del manifiesto', example: 'CONSOLIDADO' })
  consolidado!: string;

  @ApiProperty({ description: 'CRT (Carga de Retorno) referenciado', example: 'CRT-001' })
  crtreferenciado!: string;

  @ApiProperty({ description: 'Observaciones adicionales del manifiesto', example: 'Manifiesto normal' })
  observacion!: string;
}
