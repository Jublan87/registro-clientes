import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { HealthController } from './presentation/controllers/health.controller';
import { LoadClientsController } from './presentation/controllers/load-clients.controller';
import { StatusController } from './presentation/controllers/status.controller';
import { ClienteService } from './application/services/cliente.service';
import { ClienteRepository } from './infrastructure/repositories/cliente.repository';
import { DatabaseModule } from './infrastructure/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    DatabaseModule,
  ],
  controllers: [HealthController, LoadClientsController, StatusController],
  providers: [ClienteService, ClienteRepository],
})
export class AppModule {}
