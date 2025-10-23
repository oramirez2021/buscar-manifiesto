import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/validation.schema';
import { ManifiestoModule } from './manifiesto/manifiesto.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      validationOptions: { allowUnknown: true, abortEarly: true },
    }),
    ManifiestoModule,
  ],
})
export class AppModule {}