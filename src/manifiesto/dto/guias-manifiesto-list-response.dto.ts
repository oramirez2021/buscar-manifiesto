import { ApiProperty } from '@nestjs/swagger';
import { GuiaManifiestoResponseDto } from './guia-manifiesto-response.dto';

export class GuiasManifiestoListResponseDto {
    @ApiProperty({
        description: 'Lista de guías GTIME asociadas al manifiesto',
        type: [GuiaManifiestoResponseDto]
    })
    guias: GuiaManifiestoResponseDto[];

    @ApiProperty({
        description: 'Número total de registros devueltos',
        example: 25
    })
    rowsCount: number;
}
