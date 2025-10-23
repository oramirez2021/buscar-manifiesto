import { IsString, IsDateString, IsOptional, IsObject, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateManifiestoDto {
  @ApiProperty({ description: 'Número único del manifiesto', example: 'MAN-2024-001' })
  @IsString()
  @MaxLength(50)
  numero!: string;

  @ApiProperty({ description: 'Fecha del manifiesto', example: '2024-01-15' })
  @IsDateString()
  fecha!: string;

  @ApiProperty({ description: 'Estado del manifiesto', example: 'PENDIENTE' })
  @IsString()
  @MaxLength(50)
  estado!: string;

  @ApiPropertyOptional({ description: 'Tipo de manifiesto', example: 'CARGA' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tipoManifiesto?: string;

  @ApiPropertyOptional({ description: 'Origen del manifiesto', example: 'BOGOTÁ' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  origen?: string;

  @ApiPropertyOptional({ description: 'Destino del manifiesto', example: 'MEDELLÍN' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  destino?: string;

  @ApiPropertyOptional({ description: 'Nombre del transportista', example: 'TRANSPORTES ABC' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  transportista?: string;

  @ApiPropertyOptional({ description: 'Placa del vehículo', example: 'ABC-123' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  placa?: string;

  @ApiPropertyOptional({ description: 'Observaciones adicionales' })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({ description: 'Metadatos adicionales' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
