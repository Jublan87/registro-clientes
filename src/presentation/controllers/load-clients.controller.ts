import {
  Controller,
  Post,
  Body,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { ClienteService } from '../../application/services/cliente.service';

class ProcessDto {
  @ApiProperty({
    description: 'Ruta del archivo a procesar',
    example: 'data/CLIENTES_IN_0425_FUSIONADO_PROD_1.dat',
  })
  path: string;
}

@ApiTags('Carga de Clientes')
@Controller()
export class LoadClientsController {
  private readonly logger = new Logger(LoadClientsController.name);

  constructor(private readonly clienteSvc: ClienteService) {}

  @Post('process')
  @ApiOperation({ summary: 'Procesa un archivo de clientes' })
  @ApiBody({ type: ProcessDto })
  @ApiResponse({
    status: 200,
    description: 'Procesamiento exitoso',
    schema: {
      example: {
        status: 'processing completed',
        path: 'data/CLIENTES_IN_0425_FUSIONADO_PROD_1.dat',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error en el procesamiento',
    schema: {
      example: {
        status: 'processing failed',
        path: 'data/CLIENTES_IN_0425_FUSIONADO_PROD_1.dat',
        error: 'Error message',
      },
    },
  })
  async process(
    @Body() dto: ProcessDto,
  ): Promise<{ status: string; path: string; error?: string }> {
    const filePath = dto.path;
    this.logger.log(`Starting processing: ${filePath}`);

    try {
      await this.clienteSvc.loadFromFile(filePath);
      this.logger.log('Processing completed');
      return { status: 'processing completed', path: filePath };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Processing failed: ${message}`);
      throw new HttpException(
        {
          status: 'processing failed',
          path: filePath,
          error: message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
