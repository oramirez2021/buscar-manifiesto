import { IsString, IsDateString, IsOptional, IsNumber, Min, Max, Matches } from 'class-validator';
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
  @Matches(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/, {
    message: 'EdFechaInicio debe tener formato DD/MM/YYYY o DD-MM-YYYY'
  })
  EdFechaInicio?: string;

  @ApiPropertyOptional({ description: 'Fecha hasta para filtrar', example: '22/10/2025' })
  @IsOptional()
  @IsString()
  @Matches(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/, {
    message: 'EdFechaTermino debe tener formato DD/MM/YYYY o DD-MM-YYYY'
  })
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

  @ApiPropertyOptional({ description: 'Número de página', example: 1 })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'pagina debe ser un número' })
  @Min(1, { message: 'pagina debe ser al menos 1' })
  pagina?: number;

  @ApiPropertyOptional({ description: 'Registros por página', example: 10 })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'porPagina debe ser un número' })
  @Min(1, { message: 'porPagina debe ser al menos 1' })
  @Max(100, { message: 'porPagina no puede exceder 100' })
  porPagina?: number;
}
