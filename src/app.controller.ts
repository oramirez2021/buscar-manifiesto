import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy.' })
  healthCheck() {
    return { 
      message: 'Buscar Manifiesto Service is running', 
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }

  @Get()
  @ApiOperation({ summary: 'Root endpoint' })
  @ApiResponse({ status: 200, description: 'Welcome message.' })
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
