import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnApplicationShutdown {
  private readonly pool: Pool;
  private readonly databaseName = 'settlement_db';

  constructor(private readonly configService: ConfigService) {
    const databaseUrl = this.resolveDatabaseUrl();

    this.pool = new Pool({
      connectionString: databaseUrl,
    });
  }

  private resolveDatabaseUrl(): string {
    const explicitDatabaseUrl = this.configService.get<string>('DATABASE_URL');
    if (explicitDatabaseUrl) {
      return explicitDatabaseUrl;
    }

    const databaseHost = this.configService.get<string>('DATABASE_HOST');
    const databaseUser = this.configService.get<string>('DATABASE_USER');
    const databasePassword = this.configService.get<string>('DATABASE_PASSWORD');

    if (!databaseHost || !databaseUser || !databasePassword) {
      throw new Error(
        'settlement 서비스의 DATABASE_HOST / DATABASE_USER / DATABASE_PASSWORD 가(이) 설정되지 않았습니다.',
      );
    }

    const encodedUser = encodeURIComponent(databaseUser);
    const encodedPassword = encodeURIComponent(databasePassword);

    return `postgresql://${encodedUser}:${encodedPassword}@${databaseHost}/${this.databaseName}`;
  }

  async onModuleInit(): Promise<void> {
    const result = await this.pool.query<{ now: string }>('SELECT NOW()::text AS now');
    // eslint-disable-next-line no-console
    console.log(`[settlement] PostgreSQL 연결 성공: ${result.rows[0]?.now ?? 'unknown'}`);
  }

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }

  async ping(): Promise<string> {
    const result = await this.pool.query<{ now: string }>('SELECT NOW()::text AS now');
    return result.rows[0]?.now ?? 'unknown';
  }
}
