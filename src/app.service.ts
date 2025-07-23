import { PrismaService } from './prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AllLogger } from './common/log/logger.log';
import { AvatarDto } from './dto/avatar.dto';
import { AuthService } from './auth/auth.service';
import { User } from 'prisma/generated/prisma/client';

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

  async setAvatar(user: User, dto: AvatarDto){
    const uri = dto.uri;
    const id = user.id;
    this.logger.log(`Try to set avatar: ${id}`, this.name)
    if(id){
      const user = await this.prismaService.user.findUnique({
        where:{
          id
        }
      })
      if(!user){
        this.logger.log(`User not found: ${id}`, this.name)
        throw new NotFoundException('Пользователь с таким ID не найден!')
      }
      const avatar = await this.authService.getAvatar(id);
      if(avatar!=null){
        await this.prismaService.avatar.update({
          where:{
            userId: id,
          },
          data:{
            avatarPath: uri
          }
        })
      }else{
        await this.prismaService.avatar.create({
          data:{
            userId: id,
            avatarPath: uri
          }
        })
      }
    }

    this.logger.log(`Successful set avatar: ${id}`, this.name);
    return true
  }

  async deleteAvatar(user: User){
    const id = user.id;
    this.logger.log(`Try to delete avatar: ${id}`, this.name)
    if(id){
      const avatar = await this.authService.getAvatar(id);
      if(avatar!=null){
        await this.prismaService.avatar.update({
          where:{
            userId: id,
          },
          data:{
            avatarPath: ''
          }
        })
      }else{
        await this.prismaService.avatar.create({
          data:{
            userId: id,
            avatarPath: ''
          }
        })
      }
    }
    this.logger.log(`Successful delete avatar: ${id}}`, this.name);
    return true
    // await this.prismaService.avatar.deleteMany()
    // return await this.prismaService.avatar.findMany()
  }
}
