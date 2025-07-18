import { Controller, Get, Logger, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Authorization } from './auth/decorators/authorization.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Authorization()
  getHello(){
    return this.appService.getHello();
  }
}
