import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtGuard } from './auth/guard/jwt.guard';
import { Authorization } from './auth/decorators/authorization.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Authorization()
  getHello(): string {
    return this.appService.getHello();
  }
}
