import { ApiProperty } from '@nestjs/swagger';
import { ManifiestoGtimeResponseDto } from './manifiesto-gtime-response.dto';

export class ManifiestoGtimeListResponseDto {
    @ApiProperty({
        description: 'Lista de manifiestos GTIME',
        type: [ManifiestoGtimeResponseDto]
    })
    manifiestos: ManifiestoGtimeResponseDto[];

    @ApiProperty({
        description: 'Número total de registros devueltos',
        example: 25
    })
    rowsCount: number;
}
