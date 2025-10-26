import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
// import * as helmet from 'helmet';
import * as compression from 'compression';
import * as morgan from 'morgan';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';



const helmet = require('helmet');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.use(helmet());
  app.use(compression());
  app.use(morgan('combined'));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Swagger (v4, compatible con Nest v7)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Buscar Manifiesto Service')
    .setDescription('Microservicio para consulta de manifiestos y guías GTIME desde Oracle')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('api/docs', app, swaggerDoc, {
    swaggerOptions: {
      docExpansion: 'full',
      showRequestHeaders: true,
      showCommonExtensions: true,
    },
  });

  // Health
  app.use('/api/health', (req: any, res: any) => {
    res.json({ status: 'OK', ts: new Date().toISOString() });
  });

  const port = process.env.PORT || 3000;
  await app.listen(port as number);
  logger.log(`Server http://localhost:${port}`);
  logger.log(`Docs   http://localhost:${port}/api/docs`);
}

bootstrap();