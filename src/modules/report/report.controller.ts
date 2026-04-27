import { Body, Controller, Post } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('settlements')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('report')
  async createReport(
    @Body('message') message: string,
  ): Promise<{
    service: string;
    action: string;
    message: string;
    databaseNow: string;
    kafkaTopic: string;
  }> {
    return this.reportService.createReport(message);
  }
}
