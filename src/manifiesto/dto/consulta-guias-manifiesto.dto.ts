import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ConsultaGuiasManifiestoDto {
    @ApiProperty({
        description: 'Número del manifiesto',
        example: 12345,
        minimum: 1
    })
    @Transform(({ value }) => parseInt(value))
    @IsNumber({}, { message: 'El número del manifiesto debe ser un número' })
    @Min(1, { message: 'El número del manifiesto debe ser mayor a 0' })
    numeroManifiesto: number;

    @ApiPropertyOptional({
        description: 'Número de guía específica para filtrar',
        example: 'GTIME-IVAD-08092025025',
        maxLength: 50
    })
    @IsOptional()
    @IsString({ message: 'El número de guía debe ser una cadena de texto' })
    @Max(50, { message: 'El número de guía no puede exceder 50 caracteres' })
    nroGuia?: string;

}
