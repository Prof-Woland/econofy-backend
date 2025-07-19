import { PrismaService } from './prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { AllLogger } from './common/log/logger.log';
import { AvatarDto } from './dto/avatar.dto';
import { AuthService } from './auth/auth.service';
import { Request } from 'express';

@Injectable()
export class AppService {
  private readonly name = AppService.name;
  private readonly logger = new AllLogger();
  constructor(private readonly prismaService: PrismaService, private readonly authService: AuthService){};
  
  getHello(){
    this.logger.log("Successful getHello request", this.name)
    return {
      "text":"Hello World!"
    }
  }

  async setAvatar(req: Request, dto: AvatarDto){
    const uri = dto.uri;
    const login = this.authService.getUserLogin(req);
    if(login){
      const avatar = await this.authService.getAvatar(login);
      if(avatar!=null){
        await this.prismaService.avatar.update({
          where:{
            userLogin: login,
          },
          data:{
            avatarPath: uri
          }
        })
      }else{
        await this.prismaService.avatar.create({
          data:{
            userLogin: login,
            avatarPath: uri
          }
        })
      }
    }

    this.logger.log('Successful Avatar Set', this.name)
  }

  async deleteAvatar(req: Request){
    const login = this.authService.getUserLogin(req);
    if(login){
      const avatar = await this.authService.getAvatar(login);
      if(avatar!=null){
        await this.prismaService.avatar.update({
          where:{
            userLogin: login,
          },
          data:{
            avatarPath: ''
          }
        })
      }else{
        await this.prismaService.avatar.create({
          data:{
            userLogin: login,
            avatarPath: ''
          }
        })
      }
    }
  }
}
