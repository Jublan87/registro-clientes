import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get('health')
  @ApiOperation({ summary: 'Verifica el estado de salud del servicio' })
  @ApiResponse({
    status: 200,
    description: 'El servicio está funcionando',
    schema: {
      example: { status: 'ok' },
    },
  })
  health(): { status: string } {
    return { status: 'ok' };
  }
}
