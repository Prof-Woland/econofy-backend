import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { createUserDto } from './dto/createUser.dto';
import { ApiOperation } from '@nestjs/swagger';
import { AuthUser } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: "Регистрация"
  })
  @Post('registration')
  @HttpCode(HttpStatus.CREATED)
  async registration(@Body() dto: createUserDto){
    return await this.authService.registration(dto)
  }

  @ApiOperation({
    summary: "Авторизация"
  })
  @Post('auth')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: AuthUser){
    return await this.authService.authorization(dto);
  }

  @ApiOperation({
    summary: "Обновление токенов"
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(){
    return this.authService.refresh()
  }

  @ApiOperation({
    summary: "Выход из аккаунта"
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(){
    return this.authService.logout()
  }
}
