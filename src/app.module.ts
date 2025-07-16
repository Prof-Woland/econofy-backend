import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { GoalModule } from './goal/goal.module';
import { PlanModule } from './plan/plan.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }), AuthModule, PrismaModule, GoalModule, PlanModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
