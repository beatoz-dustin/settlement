import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3003);

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`settlement service listening on ${port}`);
}

void bootstrap();
