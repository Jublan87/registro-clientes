import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as readline from 'readline';
import { Cliente } from '../../domain/entities/cliente.entity';
import { ClienteRepository } from '../../infrastructure/repositories/cliente.repository';

export interface ProcessingStatus {
  isProcessing: boolean;
  filePath?: string;
  linesProcessed: number;
  totalLines?: number;
  memoryMB: number;
  lastLog: string;
}

@Injectable()
export class ClienteService {
  private readonly logger = new Logger(ClienteService.name);
  private status: ProcessingStatus = {
    isProcessing: false,
    linesProcessed: 0,
    memoryMB: 0,
    lastLog: '',
  };
  private readonly batchSize: number;

  constructor(
    private readonly repo: ClienteRepository,
    private readonly configService: ConfigService,
  ) {
    this.batchSize = this.configService.get<number>('BATCH_SIZE')!;
  }

  getStatus(): ProcessingStatus {
    return { ...this.status };
  }

  async loadFromFile(filePath: string): Promise<void> {
    this.initStatus(filePath);
    const totalLines = await this.estimateLines(filePath);
    this.status.totalLines = totalLines;

    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });
    let batch: Cliente[] = [];
    let processed = 0;

    for await (const line of rl) {
      this.status.linesProcessed++;
      if (this.shouldLogProgress()) this.logProgress(totalLines);

      const cliente = this.parseLine(line);
      if (!cliente) continue;

      batch.push(cliente);
      processed++;

      if (batch.length >= this.batchSize) {
        await this.saveBatch(batch);
        batch = [];
      }
    }

    await this.saveBatch(batch);
    this.finish(processed);
  }

  private initStatus(filePath: string) {
    this.status = {
      isProcessing: true,
      filePath,
      linesProcessed: 0,
      memoryMB: 0,
      lastLog: '',
    };
  }

  private async estimateLines(path: string): Promise<number | undefined> {
    try {
      const { size } = await fs.promises.stat(path);
      if (size < 500 * 1024 * 1024) {
        const content = await fs.promises.readFile(path, 'utf-8');
        return content.split('\n').length;
      }
    } catch {
      this.logger.warn('No se pudo estimar total de líneas.');
    }
  }

  private shouldLogProgress(): boolean {
    return this.status.linesProcessed % 10000 === 0;
  }

  private logProgress(total?: number) {
    const mem = Number((process.memoryUsage().rss / 1024 / 1024).toFixed(2));
    this.status.memoryMB = mem;
    const { linesProcessed } = this.status;
    let msg = `Procesadas: ${linesProcessed}`;
    if (total)
      msg += `/${total} (${((linesProcessed / total) * 100).toFixed(1)}%)`;
    msg += ` | Mem: ${mem}MB`;
    this.status.lastLog = msg;
    this.logger.log(msg);
  }

  private parseLine(line: string): Cliente | null {
    const [id, firstName, lastName, email, ageStr] = line.split('|');
    const campos = [
      [id, 'id'],
      [firstName, 'firstName'],
      [lastName, 'lastName'],
      [email, 'email'],
      [ageStr, 'age'],
    ];
    const missing = campos
      .filter(([valor]) => !valor)
      .map(([, campo]) => campo);

    if (missing.length) {
      this.logger.warn(
        `Línea inválida ${this.status.linesProcessed}: faltan ${missing.join(', ')}`,
      );
      return null;
    }

    const age = Number(ageStr);

    if (isNaN(age)) {
      this.logger.warn(
        `Línea inválida ${this.status.linesProcessed}: age='${ageStr}' no es número`,
      );
      return null;
    }

    return { id, firstName, lastName, email, age } as Cliente;
  }

  private async saveBatch(batch: Cliente[]) {
    if (!batch.length) return;
    try {
      await this.repo.saveBatch(batch);
      this.logger.debug(`Guardado batch de ${batch.length}`);
    } catch (err) {
      this.logger.error(`Error al guardar batch: ${(err as Error).message}`);
    }
  }

  private finish(processed: number) {
    this.status.memoryMB = Number(
      (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
    );
    this.status.isProcessing = false;
    this.status.lastLog = `Total procesados: ${processed}`;
    this.logger.log(this.status.lastLog);
  }
}
