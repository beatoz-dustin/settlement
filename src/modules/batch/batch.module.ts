import { Module } from '@nestjs/common';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';

@Module({
  // 배치 모듈은 정산 집계 같은 묵직한 작업을 독립된 단위로 보여준다.
  controllers: [BatchController],
  providers: [BatchService],
})
export class BatchModule {}
