import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';

@Injectable()
export class HttpBridgeService {
  private readonly serviceName: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.serviceName = this.configService.get<string>('APP_NAME') ?? 'settlement';
    this.timeoutMs = Number(this.configService.get<string>('HTTP_TIMEOUT_MS') ?? 5000);
  }

  private resolveBaseUrl(envKey: string, fallback: string): string {
    return this.configService.get<string>(envKey) ?? fallback;
  }

  private async request<T>(
    method: 'GET' | 'POST',
    url: string,
    body: unknown,
    purpose: string,
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      method,
      url,
      data: body,
      timeout: this.timeoutMs,
      headers: {
        'Content-Type': 'application/json',
        'X-Lab-Origin': this.serviceName,
      },
    };

    // eslint-disable-next-line no-console
    console.log(`[${this.serviceName}] ${purpose} -> ${url}`);

    const response = await axios.request<T>(config);
    return response.data;
  }

  async postService<T>(
    envKey: string,
    fallbackBaseUrl: string,
    path: string,
    body: unknown,
    purpose: string,
  ): Promise<T> {
    const baseUrl = this.resolveBaseUrl(envKey, fallbackBaseUrl);
    return this.request<T>('POST', `${baseUrl}${path}`, body, purpose);
  }

  async getService<T>(
    envKey: string,
    fallbackBaseUrl: string,
    path: string,
    purpose: string,
  ): Promise<T> {
    const baseUrl = this.resolveBaseUrl(envKey, fallbackBaseUrl);
    return this.request<T>('GET', `${baseUrl}${path}`, undefined, purpose);
  }

  async sendLog(message: string, action: string, why: string, inputMessage: string): Promise<unknown> {
    return this.postService(
      'LOG_SERVICE_URL',
      'http://localhost:3005',
      '/logs/ingest',
      {
        message,
        action,
        why,
        inputMessage,
        originService: this.serviceName,
      },
      `${this.serviceName}가 log 서비스를 호출함: ${action}`,
    );
  }

  async sendAudit(message: string, action: string, why: string, inputMessage: string): Promise<unknown> {
    return this.postService(
      'AUDIT_SERVICE_URL',
      'http://localhost:3006',
      '/audit/record',
      {
        message,
        action,
        why,
        inputMessage,
        originService: this.serviceName,
      },
      `${this.serviceName}가 audit 서비스를 호출함: ${action}`,
    );
  }
}
