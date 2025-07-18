import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './utils/swagger.utils';
import { LoggingMiddleware } from './common/middlewares/logger.middleware';
import { AllExceptionFilter } from './common/filters/allException.filter';
import { AllLogger } from './common/log/logger.log';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionFilter());
  app.useLogger(new AllLogger);

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
