import { Body, Controller, Post } from '@nestjs/common';
import { ReconcileService } from './reconcile.service';

@Controller('settlements')
export class ReconcileController {
  constructor(private readonly reconcileService: ReconcileService) {}

  @Post('reconcile')
  async reconcileSettlement(
    @Body('message') message: string,
  ): Promise<{
    service: string;
    action: string;
    message: string;
    databaseNow: string;
    kafkaTopic: string;
  }> {
    return this.reconcileService.reconcileSettlement(message);
  }
}
