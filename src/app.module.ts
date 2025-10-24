import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validationSchema } from './config/validation.schema';
import { ManifiestoModule } from './manifiesto/manifiesto.module';
import { ManifiestoEntity } from './manifiesto/entities/manifiesto.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      validationOptions: { allowUnknown: true, abortEarly: true },
    }),
    TypeOrmModule.forRoot({
      type: 'oracle',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 1521,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      serviceName: process.env.DB_NAME,
      entities: [ManifiestoEntity],
      synchronize: false,
      logging: true,
    }),
    ManifiestoModule,
  ],
})
export class AppModule {}