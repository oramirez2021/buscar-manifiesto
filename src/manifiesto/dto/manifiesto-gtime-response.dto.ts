import { ApiProperty } from '@nestjs/swagger';

export class ManifiestoGtimeResponseDto {
  @ApiProperty({ description: 'ID del manifiesto' })
  id!: number;

  @ApiProperty({ description: 'Número de referencia del manifiesto' })
  nroReferencia!: string;

  @ApiProperty({ description: 'Tipo de referencia' })
  tipoRef!: string;

  @ApiProperty({ description: 'Número de guía master' })
  nroGuiaMaster!: string;

  @ApiProperty({ description: 'Número de vuelo' })
  nroVuelo!: string;

  @ApiProperty({ description: 'Compañía courier' })
  ciaCourier!: string;

  @ApiProperty({ description: 'Compañía de transporte' })
  ciaTransporte!: string;

  @ApiProperty({ description: 'Número de guías asociadas' })
  nroGuiasAsociadas!: number;

  @ApiProperty({ description: 'Peso total de las guías' })
  pesoGuias!: number;

  @ApiProperty({ description: 'Valor total' })
  valorTotal!: number;

  @ApiProperty({ description: 'Puerto de embarque' })
  puertoEmbarque!: string;

  @ApiProperty({ description: 'Puerto de desembarque' })
  puertoDesembarque!: string;

  @ApiProperty({ description: 'Fecha de aceptación' })
  fechaAceptacion!: Date;

  @ApiProperty({ description: 'Fecha de aceptación formateada' })
  fechaAceptacionFormateada!: string;

  @ApiProperty({ description: 'Fecha conformado' })
  fechaConformado!: string;

  @ApiProperty({ description: 'Total guías marcadas' })
  totalGuiasMarcadas!: number;

  @ApiProperty({ description: 'Total guías mayor a 30 USD' })
  totalGuiasMas30!: number;

  @ApiProperty({ description: 'Estado del visado' })
  estaVisado!: string;

  @ApiProperty({ description: 'Número de referencia original' })
  nroRefOriginal!: string;

  @ApiProperty({ description: 'Estado de consolidado' })
  consolidado!: string;

  @ApiProperty({ description: 'CRT referenciado' })
  crtreferenciado!: string;

  @ApiProperty({ description: 'Observaciones' })
  observacion!: string;
}
