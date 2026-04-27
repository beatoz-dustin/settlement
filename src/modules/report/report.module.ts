import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  // 리포트 모듈은 결과를 외부로 내보내는 흐름을 흉내낸다.
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
