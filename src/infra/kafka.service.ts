import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnApplicationShutdown {
  private readonly producer: Producer;

  constructor(private readonly configService: ConfigService) {
    this.producer = new Kafka({
      clientId: this.configService.get<string>('APP_NAME') ?? 'settlement',
      brokers: this.getBrokers(),
    }).producer();
  }

  private getBrokers(): string[] {
    const brokersRaw = this.configService.get<string>('KAFKA_BROKERS');
    if (!brokersRaw) {
      throw new Error('settlement 서비스의 KAFKA_BROKERS 가(이) 설정되지 않았습니다.');
    }

    return brokersRaw
      .split(',')
      .map((broker) => broker.trim())
      .filter(Boolean);
  }

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
    // eslint-disable-next-line no-console
    console.log(`[settlement] Kafka 연결 성공: ${this.getBrokers().join(', ')}`);
  }

  async onApplicationShutdown(): Promise<void> {
    await this.producer.disconnect();
  }

  async publish(topic: string, message: string): Promise<void> {
    await this.producer.send({
      topic,
      messages: [{ value: message }],
    });
  }
}
