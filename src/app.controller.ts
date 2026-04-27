import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot(): string {
    return 'settlement app is running';
  }

  @Get('health')
  getHealth(): { service: string; status: string } {
    return { service: 'settlement', status: 'ok' };
  }
}
