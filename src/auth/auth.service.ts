import { BadRequestException, ConflictException, ForbiddenException, ImATeapotException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto, RefreshDto } from './dto/User.dto';
import { hash, verify } from 'argon2';
import { JwtPayload } from './interfaces/jwtPayload.interface';
import { JwtService } from '@nestjs/jwt';
import { AllLogger } from 'src/common/log/logger.log';
import { ExtractJwt } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class AuthService {
    private readonly name = AuthService.name;
    private readonly logger = new AllLogger()
    private readonly JWT_SECRET: string;
    private readonly JWT_ACCESS_TOKEN_TTL: string;
    private readonly JWT_REFRESH_TOKEN_TTL: string;
    private readonly extractor: (request: Request) => string | null;
    constructor(private readonly configService: ConfigService, private readonly prismaService: PrismaService, private readonly jwtService: JwtService){
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
        await this.prismaService.auth.create({
            data:{
                userLogin: login,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            }
        })
        
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
        const tokens = this.generateTokens(login)

        const exist = await this.prismaService.auth.findUnique({
            where:{
                userLogin: login
            }
        })

        if(exist){
            await this.prismaService.auth.update({
            where:{
                userLogin: login
            },
            data:{
                ...tokens
            }
            })
        }
        else{
            await this.prismaService.auth.create({
            data:{
                userLogin: login,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            }
            })
        }
        this.logger.log(`Successful authorization: ${login}`, this.name);

        const avatar = await this.getAvatar(login);
        return {...tokens, "uri": avatar?.toString()}
    }

    async refresh(dto: RefreshDto){
        const refreshT = dto.refreshToken;

        this.logger.log(`Refresh request`, this.name);

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

        const exist = await this.prismaService.auth.findUnique({
            where:{
                userLogin: payload.login
            },
            select:{
                refreshToken: true
            }
        })

        if(refreshT != exist?.refreshToken){
            this.logger.log(`Wrong refresh token`, this.name);
            throw new ForbiddenException('Скомпрометированный токен обновления')
        }

        const tokens = this.generateTokens(payload.login)
        await this.prismaService.auth.update({
            where:{
                userLogin: payload.login
            },
            data:{
                ...tokens
            }
            })

        const avatar = await this.getAvatar(payload.login)
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
        const extToken = await this.prismaService.auth.findUnique({
            where: {
                userLogin: login
            },
        });

        if(extToken?.accessToken != token){
            throw new ForbiddenException('Скомпрометированный токен доступа')
        }
        return user
    }

    async getAvatar(login: string) {
        const avatar = await this.prismaService.avatar.findUnique({
            where:{
                userLogin: login
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

    public getUserLogin(req: Request){
        const token = this.extractor(req);
        if(token){
            const payload: JwtPayload = this.jwtService.decode(token);
            return payload.login
        }
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
