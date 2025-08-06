import { BadRequestException, ConflictException, ForbiddenException, ImATeapotException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto, RefreshDto } from './dto/User.dto';
import { hash, verify } from 'argon2';
import { JwtPayload } from './interfaces/jwtPayload.interface';
import { JwtService } from '@nestjs/jwt';
import { AllLogger } from 'src/common/log/logger.log';
import { ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { User } from 'prisma/generated/prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
    private readonly name = AuthService.name;
    private readonly logger = new AllLogger()
    private readonly JWT_SECRET: string;
    private readonly JWT_ACCESS_TOKEN_TTL: string;
    private readonly JWT_REFRESH_TOKEN_TTL: string;
    private readonly extractor: (request: Request) => string | null;
    constructor(private readonly configService: ConfigService, private readonly prismaService: PrismaService, private readonly jwtService: JwtService, @Inject(CACHE_MANAGER) private cacheManager: Cache){
        this.JWT_SECRET = this.configService.getOrThrow("JWT_SECRET")
        this.JWT_ACCESS_TOKEN_TTL = this.configService.getOrThrow("JWT_ACCESS_TOKEN_TTL");
        this.JWT_REFRESH_TOKEN_TTL = this.configService.getOrThrow("JWT_REFRESH_TOKEN_TTL");
        const jwtExtractor = ExtractJwt.fromAuthHeaderAsBearerToken();
        this.extractor = jwtExtractor;
    }

    async registration(dto: UserDto) {
        const {login, password} = dto;
        this.logger.log(`Registration request: ${login}`, this.name);

        const user = await this.prismaService.user.findUnique({
            where:{
                login
            },
            select:{
                id: true
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
        const tokens = this.generateTokens(newUser.login);

        await this.cachingTokens(newUser.id, tokens.accessToken, tokens.refreshToken)
        
        this.logger.log(`Successful registration: ${login}`, this.name);
        return tokens
    };

    async authorization(dto: UserDto){
        const {login, password} = dto;
        this.logger.log(`Authorization request: ${login}`, this.name);

        const extendUser = await this.prismaService.user.findUnique({
            where: {
                login
            },
            select:{
                password: true,
                id: true
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
        const tokens = this.generateTokens(login);

        try{
            await this.cacheManager.del(`${extendUser.id + 'at'}`)
            await this.cacheManager.del(`${extendUser.id + 'rt'}`)
            await this.cachingTokens(extendUser.id, tokens.accessToken, tokens.refreshToken)
        }
        catch(InternalServerErrorException){
            this.logger.warn(`Failed to update tokens: ${login}`, this.name)
        }

        this.logger.log(`Successful authorization: ${login}`, this.name);

        const avatar = await this.getAvatar(extendUser.id);
        return {...tokens, "uri": avatar?.toString()}
    }

    async refresh(dto: RefreshDto, user: User){
        const refreshT = dto.refreshToken;

        this.logger.log(`Refresh request`, this.name);

        const decodeObject = this.jwtService.decode(refreshT);
        
        if(!decodeObject){
            this.logger.warn(`Invalid token`, this.name);
            throw new ForbiddenException('Невалидный токен обновления');
        }
        if(decodeObject.exp <= Date.now()/1000){
            this.logger.warn(`Old token`, this.name);
            throw new ForbiddenException('Устаревший токен обновления');
        };

        let payload: JwtPayload;
        
        try{
            payload = await this.jwtService.verifyAsync(refreshT, {secret: this.JWT_SECRET});
        }
        catch(InternalServerErrorException){
            this.logger.warn(`Invalid token`, this.name);
            throw new ForbiddenException('Неверный ключ токена обновления');
        }

        const exist = await this.getCacheTokens(user.id)

        if(refreshT != exist?.refreshToken){
            this.logger.log(`Wrong refresh token`, this.name);
            throw new ForbiddenException('Скомпрометированный токен обновления')
        }

        const tokens = this.generateTokens(payload.login)
        try{
            await this.cacheManager.del(`${user.id + 'at'}`)
            await this.cacheManager.del(`${user.id + 'rt'}`)
            await this.cachingTokens(user.id, tokens.accessToken, tokens.refreshToken)
        }
        catch(InternalServerErrorException){
            this.logger.warn(`Failed to update tokens: ${payload.login}`, this.name)
        }

        const avatar = await this.getAvatar(user.id)
        this.logger.log(`Successful refresh`, this.name);

        return {...tokens, "uri": avatar?.toString()}
    }

    async validate(login: string, token: string){
        const user = await this.prismaService.user.findUnique({
            where: {
                login
            },
            select:{
                id: true,
                goals: true,
                plans: true,
                avatar: true,
            }
        });

        if(!user){
            throw new NotFoundException();
        };
        const extToken = await this.getCacheTokens(user.id)

        if(extToken?.accessToken != token){
            throw new ForbiddenException('Скомпрометированный токен доступа')
        }
        return user
    }

    async getAvatar(id: string) {
        const avatar = await this.prismaService.avatar.findUnique({
            where:{
                userId: id
            },
            select:{
                avatarPath: true,
            }
        })

        if(!avatar){
            return null
        }
        return avatar.avatarPath
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

    private async cachingTokens(id: string, accessToken: string,  refreshToken: string){
        try{
            await this.cacheManager.set(`${id + 'at'}`, `${accessToken}`, 10800000);
            await this.cacheManager.set(`${id + 'rt'}`, `${refreshToken}`, 691200000);
        }
        catch(InternalServerErrorException){
            this.logger.warn(`Failed to add tokens to cache: ${id}`, this.name);
            throw new ImATeapotException('Не удалось добавить токены в кэш');
        }
        return true
    }

    private async getCacheTokens(id: string){
        const accessToken = await this.cacheManager.get(`${id + 'at'}`);
        const refreshToken = await this.cacheManager.get(`${id + 'rt'}`);
        if(!accessToken){
            this.logger.warn(`Failed to get accessToken from cache: ${id}`, this.name);
            throw new ForbiddenException('Не удалось получить токен доступа из кэша. Токен скомпрометирован');
        }
        if(!refreshToken){
            this.logger.warn(`Failed to get refreshToken from cache: ${id}`, this.name);
            throw new ForbiddenException('Не удалось получить токен обновления из кэша. Токен скомпрометирован');
        }

        return {accessToken, refreshToken}
    }
}
