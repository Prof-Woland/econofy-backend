import { Body, Controller, Delete, Get, Headers, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Authorization } from './auth/decorators/authorization.decorator';
import { AvatarDto } from './dto/avatar.dto';
import { Authorized } from './auth/decorators/authorized.decorator';
import { User } from 'prisma/generated/prisma/client';
import { Request } from 'express';
import { ApiAcceptedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  @Authorization()
  getHello(){
    return this.appService.getHello();
  }

  @ApiOperation({
    summary: "Получение аватара пользователя"
  })
  @ApiOkResponse({type: 'true'})
  @Post('setAvatar')
  @Authorization()
  @HttpCode(HttpStatus.OK)
  async setAvatar(@Authorized() user: User, @Body() dto: AvatarDto){
    return await this.appService.setAvatar(user, dto);
  }

  @ApiOperation({
    summary: "Удаление аватара пользователя"
  })
  @ApiOkResponse({type: 'true'})
  @Post('delAvatar')
  @Authorization()
  @HttpCode(HttpStatus.OK)
  async delAvatar(@Authorized() user: User){
    return await this.appService.deleteAvatar(user);
  }
}
