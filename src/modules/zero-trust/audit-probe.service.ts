import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../infra/database.service';
import { HttpBridgeService } from '../../infra/http-bridge.service';
import { KafkaService } from '../../infra/kafka.service';

type ProbeResponse = {
  service: string;
  action: string;
  message: string;
  databaseNow: string;
  kafkaTopic: string;
  probeTarget: string;
  probeOutcome: 'allowed' | 'blocked';
  errorMessage?: string;
};

@Injectable()
export class AuditProbeService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly httpBridgeService: HttpBridgeService,
    private readonly kafkaService: KafkaService,
  ) {}

  async probeAudit(message: string): Promise<ProbeResponse> {
    const databaseNow = await this.databaseService.ping();
    const inputMessage =
      message ?? 'settlement 서비스가 audit 직접 호출이 허용되는지 검증한다.';
    const action = 'zero-trust.audit.probe';
    const why = 'settlement 서비스는 audit를 직접 찌를 수 없어야 한다는 zero trust 규칙을 검증한다.';
    const topic = 'settlement.events';

    // eslint-disable-next-line no-console
    console.log(
      `[settlement] settlement 서비스가 audit probe를 시도한다. 이유: ${why}. 요청 메시지: ${inputMessage}.`,
    );

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

    let probeOutcome: 'allowed' | 'blocked' = 'allowed';
    let errorMessage: string | undefined;

    try {
      await this.httpBridgeService.sendAudit(
        `settlement가 audit를 직접 호출하려는 probe다. 이유: ${why}. 원문: ${inputMessage}.`,
        action,
        why,
        inputMessage,
      );
    } catch (error) {
      probeOutcome = 'blocked';
      errorMessage = error instanceof Error ? error.message : String(error);

      // eslint-disable-next-line no-console
      console.log(
        `[settlement] audit probe가 차단되었다. 이유: ${errorMessage}`,
      );
    }

    const messageText =
      probeOutcome === 'allowed'
        ? `settlement 서비스가 audit probe를 성공시켰다. 이것은 아직 zero trust 차단이 적용되지 않았다는 뜻이다. 이유: ${why}.`
        : `settlement 서비스의 audit probe가 차단되었다. 이것이 우리가 원하는 zero trust 결과다. 이유: ${why}.`;

    return {
      service: 'settlement',
      action,
      message: messageText,
      databaseNow,
      kafkaTopic: topic,
      probeTarget: 'audit',
      probeOutcome,
      errorMessage,
    };
  }
}
