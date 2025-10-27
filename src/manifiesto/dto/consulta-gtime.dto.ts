import { IsString, IsDateString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class ConsultaGtimeDto {
  @ApiPropertyOptional({ description: 'ID del emisor', example: 12345 })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  })
  @IsNumber({}, { message: 'EdIdPersona must be a number' })
  @Min(1, { message: 'EdIdPersona must be at least 1' })
  EdIdPersona?: number;

  @ApiPropertyOptional({ description: 'Fecha desde para filtrar', example: '01/10/2025' })
  @IsOptional()
  @IsString()
  EdFechaInicio?: string;

  @ApiPropertyOptional({ description: 'Fecha hasta para filtrar', example: '22/10/2025' })
  @IsOptional()
  @IsString()
  EdFechaTermino?: string;

  @ApiPropertyOptional({
    description: 'Estado del visado',
    example: 'PEND',
    enum: ['PEND', 'SI', 'NCMP', 'TODOS']
  })
  @IsOptional()
  @IsString()
  EdVisado?: string;

  @ApiPropertyOptional({
    description: 'Tipo de courier',
    example: 'TODOS',
    enum: ['CN', 'CT', 'TODOS', 'EXTERNO']
  })
  @IsOptional()
  @IsString()
  EdTipoViaTransporte?: string;

  @ApiPropertyOptional({ description: 'Número del manifiesto', example: 'MAN-2024-001' })
  @IsOptional()
  @IsString()
  EdNroManifiesto?: string;

  @ApiPropertyOptional({ description: 'Número de guía courier', example: 'GTIME-12345' })
  @IsOptional()
  @IsString()
  guiaCourier?: string;

  @ApiPropertyOptional({ description: 'Nombre de la persona', example: 'Juan Pérez' })
  @IsOptional()
  @IsString()
  EdNombrePersona?: string;

  @ApiPropertyOptional({ description: 'Código de página', example: '1949041' })
  @IsOptional()
  @IsString()
  MRevisionMFTOC_pageCode?: string;
}
