import { Body, Controller, Post } from '@nestjs/common';
import { BatchService } from './batch.service';

@Controller('settlements')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post('aggregate')
  async aggregateSettlement(
    @Body('message') message: string,
  ): Promise<{
    service: string;
    action: string;
    message: string;
    databaseNow: string;
    kafkaTopic: string;
  }> {
    return this.batchService.aggregateSettlement(message);
  }
}
