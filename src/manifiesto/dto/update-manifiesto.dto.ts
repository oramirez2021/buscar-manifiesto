import { PartialType } from '@nestjs/swagger';
import { CreateManifiestoDto } from './create-manifiesto.dto';

export class UpdateManifiestoDto extends PartialType(CreateManifiestoDto) {}
