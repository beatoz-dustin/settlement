import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../infra/database.service';
import { HttpBridgeService } from '../../infra/http-bridge.service';
import { KafkaService } from '../../infra/kafka.service';

type LabResponse = {
  service: string;
  action: string;
  message: string;
  databaseNow: string;
  kafkaTopic: string;
};

@Injectable()
export class ReconcileService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly httpBridgeService: HttpBridgeService,
    private readonly kafkaService: KafkaService,
  ) {}

  // 대사는 외부 기준과 내부 기준이 맞는지 확인하는 작업이다.
  // 금융 도메인에서 아주 중요한 검증 포인트라 별도 모듈로 뺐다.
  async reconcileSettlement(message: string): Promise<LabResponse> {
    return this.trace(
      'settlement.reconciled',
      '외부 기준과 내부 정산 결과를 맞춰보는 검증 작업',
      message,
      'settlement.events',
    );
  }

  private async trace(
    action: string,
    why: string,
    inputMessage: string,
    topic: string,
  ): Promise<LabResponse> {
    const databaseNow = await this.databaseService.ping();
    const message = `settlement 서비스가 "${action}" 작업을 처리했다. 이유: ${why}. 요청 메시지: ${inputMessage}. DB 시각: ${databaseNow}. Kafka 토픽: ${topic}.`;

    // eslint-disable-next-line no-console
    console.log(`[settlement] ${message}`);

    await this.kafkaService.publish(
      topic,
      JSON.stringify({
        service: 'settlement',
        action,
        why,
        inputMessage,
        databaseNow,
      }),
    );

    await this.httpBridgeService.sendLog(message, action, why, inputMessage);

    return {
      service: 'settlement',
      action,
      message,
      databaseNow,
      kafkaTopic: topic,
    };
  }
}
