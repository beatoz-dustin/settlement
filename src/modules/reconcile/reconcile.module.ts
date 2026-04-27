import { Module } from '@nestjs/common';
import { ReconcileController } from './reconcile.controller';
import { ReconcileService } from './reconcile.service';

@Module({
  // 대사 모듈은 시스템 간 결과를 맞춰보는 역할을 분리한다.
  controllers: [ReconcileController],
  providers: [ReconcileService],
})
export class ReconcileModule {}
