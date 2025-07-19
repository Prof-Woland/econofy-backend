import { Body, Controller, Headers, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto, RefreshDto } from './dto/User.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: "Регистрация"
  })
  @Post('registration')
  @HttpCode(HttpStatus.CREATED)
  async registration(@Body() dto: UserDto){
    return await this.authService.registration(dto)
  }

  @ApiOperation({
    summary: "Авторизация"
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: UserDto){
    return await this.authService.authorization(dto);
  }

  @ApiOperation({
    summary: "Обновление токенов"
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshDto){
    return this.authService.refresh(dto)
  }
}
