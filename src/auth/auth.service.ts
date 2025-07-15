import { ConflictException, ImATeapotException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { createUserDto } from './dto/createUser.dto';
import { hash, verify } from 'argon2';
import { AuthUser } from './dto/auth.dto';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
    constructor(private readonly configService: ConfigService, private readonly prismaService: PrismaService){}

    async registration(dto: createUserDto) {
        const {login, password, secondPassword} = dto;

        const user = await this.prismaService.user.findUnique({
            where:{
                login
            }
        });

        if(user){
            throw new ConflictException("Такой пользователь уже существует")
        };
 
        if(password!=secondPassword){
            throw new ImATeapotException('Пароли не совпадают')
        }
        const newUser = this.prismaService.user.create({
            data:{
                login,
                password: await hash(password)
            }
        });

        return newUser
    };

    async authorization(dto: AuthUser){
        const {login, password} = dto;

        const extendUser = await this.prismaService.user.findUnique({
            where: {
                login
            },
            select:{
                password: true
            }
        });

        if (!extendUser){
            throw new NotFoundException('Пользователь с таким логином не найден');
        };

        const isPasswordTrue = await verify(extendUser.password, password);

        if(!isPasswordTrue){
            throw new NotFoundException('Неверный пароль');
        };

        return "Вход выполнен успешно (placeholder)"
    }

    async refresh(){
        throw new UnauthorizedException('Вы не авторизованы (placeholder)')
    }

    async logout(){
        return "Выход выполнен успешно (placeholder)"
    }
}
