import { Body, Controller, Post } from '@nestjs/common';
import { AuditProbeService } from './audit-probe.service';

@Controller('zero-trust')
export class AuditProbeController {
  constructor(private readonly auditProbeService: AuditProbeService) {}

  @Post('audit-probe')
  async probeAudit(
    @Body('message') message: string,
  ): Promise<{
    service: string;
    action: string;
    message: string;
    databaseNow: string;
    kafkaTopic: string;
    probeTarget: string;
    probeOutcome: 'allowed' | 'blocked';
    errorMessage?: string;
  }> {
    return this.auditProbeService.probeAudit(message);
  }
}
