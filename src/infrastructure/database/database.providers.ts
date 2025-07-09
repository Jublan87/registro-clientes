/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cliente } from '../../domain/entities/cliente.entity';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => {
      const ds = new DataSource({
        type: 'mssql',
        host: config.get('DB_HOST'),
        port: +(config.get<number>('DB_PORT') ?? 1433),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [Cliente],
        synchronize: false,
        options: {
          enableArithAbort: true,
          trustServerCertificate: true, // Permite certificados autofirmados
          encrypt: false, // Desactiva encriptación para desarrollo
        },
      });
      return ds.initialize();
    },
  },
];
