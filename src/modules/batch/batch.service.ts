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
export class BatchService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly httpBridgeService: HttpBridgeService,
    private readonly kafkaService: KafkaService,
  ) {}

  // 배치 집계는 settlement의 대표적인 읽기+쓰기 혼합 작업이다.
  // 집계가 왜 별도 권한을 가지는지 보여주기 위해 DB와 Kafka를 함께 사용한다.
  async aggregateSettlement(message: string): Promise<LabResponse> {
    return this.trace(
      'settlement.aggregated',
      '정산 금액을 집계하는 배치성 작업',
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
    await this.httpBridgeService.sendAudit(message, action, why, inputMessage);

    return {
      service: 'settlement',
      action,
      message,
      databaseNow,
      kafkaTopic: topic,
    };
  }
}
