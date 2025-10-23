import { IsString, IsDateString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BuscarManifiestoDto {
  @ApiPropertyOptional({ description: 'Número del manifiesto para buscar' })
  @IsOptional()
  @IsString()
  numero?: string;

  @ApiPropertyOptional({ description: 'Fecha desde para filtrar', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional({ description: 'Fecha hasta para filtrar', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @ApiPropertyOptional({ description: 'Estado del manifiesto' })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({ description: 'Tipo de manifiesto' })
  @IsOptional()
  @IsString()
  tipoManifiesto?: string;

  @ApiPropertyOptional({ description: 'Origen del manifiesto' })
  @IsOptional()
  @IsString()
  origen?: string;

  @ApiPropertyOptional({ description: 'Destino del manifiesto' })
  @IsOptional()
  @IsString()
  destino?: string;

  @ApiPropertyOptional({ description: 'Transportista' })
  @IsOptional()
  @IsString()
  transportista?: string;

  @ApiPropertyOptional({ description: 'Placa del vehículo' })
  @IsOptional()
  @IsString()
  placa?: string;

  @ApiPropertyOptional({ description: 'Número de registros por página', example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Número de registros a omitir', example: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}
