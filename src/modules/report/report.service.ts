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
export class ReportService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly httpBridgeService: HttpBridgeService,
    private readonly kafkaService: KafkaService,
  ) {}

  // 리포트 생성은 정산 결과를 외부로 읽기 좋게 만드는 작업이다.
  async createReport(message: string): Promise<LabResponse> {
    return this.trace(
      'settlement.report.created',
      '정산 결과를 사람이 읽기 좋은 보고서로 만드는 작업',
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
