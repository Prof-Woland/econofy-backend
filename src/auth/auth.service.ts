import { ConflictException, ImATeapotException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { createUserDto } from './dto/createUser.dto';
import { hash, verify } from 'argon2';
import { AuthUser, RefreshDto } from './dto/auth.dto';
import { JwtPayload } from './interfaces/jwtPayload.interface';
import { JwtService } from '@nestjs/jwt';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name)
    private readonly JWT_SECRET: string;
    private readonly JWT_ACCESS_TOKEN_TTL: string;
    private readonly JWT_REFRESH_TOKEN_TTL: string;
    constructor(private readonly configService: ConfigService, private readonly prismaService: PrismaService, private readonly jwtService: JwtService){
        this.JWT_SECRET = this.configService.getOrThrow("JWT_SECRET")
        this.JWT_ACCESS_TOKEN_TTL = this.configService.getOrThrow("JWT_ACCESS_TOKEN_TTL");
        this.JWT_REFRESH_TOKEN_TTL = this.configService.getOrThrow("JWT_REFRESH_TOKEN_TTL");
    }

    async registration(dto: createUserDto) {
        const {login, password} = dto;

        const user = await this.prismaService.user.findUnique({
            where:{
                login
            }
        });

        if(user){
            throw new ConflictException("Такой пользователь уже существует")
        };
 
        const newUser = await this.prismaService.user.create({
            data:{
                login,
                password: await hash(password)
            }
        });
        return this.generateTokens(newUser.login)
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

        return this.generateTokens(login)
    }

    async refresh(dto: RefreshDto){
        const refreshT = dto.refreshToken
        if(!refreshT || refreshT == null){
            throw new UnauthorizedException('Невалидный токен обновления')
        }
        const decodeObject = this.jwtService.decode(refreshT);

        if(decodeObject.exp <= Date.now()/1000){
            throw new UnauthorizedException('Устаревший токен обновления')
        }
        try{
            const payload = await this.jwtService.verifyAsync(refreshT, {secret: this.JWT_SECRET});
            return this.generateTokens(payload.login)
        }
        catch(InternalServerErrorException){
            throw new UnauthorizedException('Неверный ключ токена обновления')
        }
    }

    async validate(login: string){
        const user = await this.prismaService.user.findUnique({
            where: {
                login
            }
        });

        if(!user){
            throw new NotFoundException();
        };

        return user
    }


    private generateTokens(login: string){
        const payload: JwtPayload = {login};

        const accessToken = this.jwtService.sign(payload, {expiresIn: this.JWT_ACCESS_TOKEN_TTL, secret: this.JWT_SECRET});
        const refreshToken = this.jwtService.sign(payload, {expiresIn: this.JWT_REFRESH_TOKEN_TTL, secret: this.JWT_SECRET});

        return {
            accessToken,
            refreshToken
        }
    }
}
