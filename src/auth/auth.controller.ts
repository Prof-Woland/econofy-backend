import { Body, Controller, Headers, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto, RefreshDto } from './dto/User.dto';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Authorized } from './decorators/authorized.decorator';
import { User } from 'prisma/generated/prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: "Регистрация"
  })
  @ApiOkResponse({type: RefreshDto})
  @Post('registration')
  @HttpCode(HttpStatus.CREATED)
  async registration(@Body() dto: UserDto){
    return await this.authService.registration(dto)
  }

  @ApiOperation({
    summary: "Авторизация"
  })
  @ApiOkResponse({type: RefreshDto})
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: UserDto){
    return await this.authService.authorization(dto);
  }

  @ApiOperation({
    summary: "Обновление токенов"
  })
  @ApiOkResponse({type: RefreshDto})
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshDto, @Authorized() user: User){
    return this.authService.refresh(dto, user)
  }
}
