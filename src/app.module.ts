import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { InfraModule } from './infra/infra.module';
import { BatchModule } from './modules/batch/batch.module';
import { ReconcileModule } from './modules/reconcile/reconcile.module';
import { ReportModule } from './modules/report/report.module';

@Module({
  // settlement는 배치, 대사, 리포트처럼 역할이 다른 작업을 분리한다.
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    InfraModule,
    BatchModule,
    ReconcileModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
