import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { HttpBridgeService } from './http-bridge.service';
import { KafkaService } from './kafka.service';

@Global()
@Module({
  providers: [DatabaseService, KafkaService, HttpBridgeService],
  exports: [DatabaseService, KafkaService, HttpBridgeService],
})
export class InfraModule {}
