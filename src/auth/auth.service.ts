import { ConflictException, ImATeapotException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { createUserDto } from './dto/createUser.dto';
import { hash, verify } from 'argon2';
import { AuthUser, RefreshDto } from './dto/auth.dto';
import { JwtPayload } from './interfaces/jwtPayload.interface';
import { JwtService } from '@nestjs/jwt';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { AllLogger } from 'src/common/log/logger.log';

@Injectable()
export class AuthService {
    private readonly name = AuthService.name;
    private readonly logger = new AllLogger()
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
        this.logger.log(`Registration request: ${login}`, this.name);

        const user = await this.prismaService.user.findUnique({
            where:{
                login
            }
        });

        if(user){
            this.logger.warn(`Conflict error: ${login}`, this.name);
            throw new ConflictException("Такой пользователь уже существует");
        };
 
        const newUser = await this.prismaService.user.create({
            data:{
                login,
                password: await hash(password)
            }
        });
        this.logger.log(`Successful registration: ${login}`, this.name);
        return this.generateTokens(newUser.login)
    };

    async authorization(dto: AuthUser){
        const {login, password} = dto;
        this.logger.log(`Authorization request: ${login}`, this.name);

        const extendUser = await this.prismaService.user.findUnique({
            where: {
                login
            },
            select:{
                password: true
            }
        });

        if (!extendUser){
            this.logger.warn(`Not found error: ${login}`, this.name);
            throw new NotFoundException('Пользователь с таким логином не найден');
        };

        const isPasswordTrue = await verify(extendUser.password, password);

        if(!isPasswordTrue){
            this.logger.warn(`False password: ${login}`, this.name);
            throw new NotFoundException('Неверный пароль');
        };
        this.logger.log(`Successful authorization: ${login}`, this.name);
        return this.generateTokens(login)
    }

    async refresh(dto: RefreshDto){
        const refreshT = dto.refreshToken;

        this.logger.log(`Refresh request`, this.name);

        if(!refreshT || refreshT == null){
            this.logger.warn(`Invalid token`, this.name);
            throw new UnauthorizedException('Невалидный токен обновления');
        }
        const decodeObject = this.jwtService.decode(refreshT);
        
        if(!decodeObject){
            this.logger.warn(`Invalid token`, this.name);
            throw new UnauthorizedException('Невалидный токен обновления');
        }
        if(decodeObject.exp <= Date.now()/1000){
            this.logger.warn(`Old token`, this.name);
            throw new UnauthorizedException('Устаревший токен обновления');
        };

        let payload: JwtPayload;

        try{
            payload = await this.jwtService.verifyAsync(refreshT, {secret: this.JWT_SECRET});
        }
        catch(InternalServerErrorException){
            this.logger.warn(`Invalid token`, this.name);
            throw new UnauthorizedException('Неверный ключ токена обновления');
        }

        this.logger.log(`Successful refresh`, this.name);
        return this.generateTokens(payload.login)
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
        this.logger.log(`Successful TOKENS generation`, this.name);
        return {
            accessToken,
            refreshToken
        }
    }
}
