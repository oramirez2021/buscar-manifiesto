import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Endpoint para verificar el estado del servicio y confirmar que está funcionando correctamente.'
  })
  @ApiResponse({
    status: 200,
    description: 'Servicio funcionando correctamente.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Buscar Manifiesto Service is running' },
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' }
      }
    }
  })
  healthCheck() {
    return {
      message: 'Buscar Manifiesto Service is running',
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Root endpoint',
    description: 'Endpoint raíz que proporciona información básica del servicio y sus endpoints disponibles.'
  })
  @ApiResponse({
    status: 200,
    description: 'Información del servicio y endpoints disponibles.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Welcome to Buscar Manifiesto Service' },
        version: { type: 'string', example: '1.0.0' },
        endpoints: {
          type: 'object',
          properties: {
            health: { type: 'string', example: '/health' },
            swagger: { type: 'string', example: '/api' }
          }
        }
      }
    }
  })
  getHello() {
    return {
      message: 'Welcome to Buscar Manifiesto Service',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        swagger: '/api'
      }
    };
  }
}
