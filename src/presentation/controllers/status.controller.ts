import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ClienteService,
  ProcessingStatus,
} from '../../application/services/cliente.service';

@ApiTags('Status')
@Controller()
export class StatusController {
  constructor(private readonly clienteSvc: ClienteService) {}

  @Get('status')
  @ApiOperation({
    summary: 'Devuelve el estado actual del procesamiento de clientes',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actual',
    schema: {
      example: {
        isProcessing: true,
        filePath: 'data/CLIENTES_IN_0425_FUSIONADO_PROD_1.dat',
        linesProcessed: 15000,
        totalLines: 4000000,
        memoryMB: 120,
        lastLog: 'Líneas procesadas: 15000 (0.38%) | Memoria usada: 120 MB',
      },
    },
  })
  getStatus(): ProcessingStatus {
    return this.clienteSvc.getStatus();
  }
}
