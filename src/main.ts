import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './utils/swagger.utils';
import { LoggingMiddleware } from './common/logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  
  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
