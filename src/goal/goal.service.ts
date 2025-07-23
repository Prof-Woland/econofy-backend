import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'prisma/generated/prisma/client';
import { AllLogger } from 'src/common/log/logger.log';
import { PrismaService } from 'src/prisma/prisma.service';
import { DeleteDto, GoalDto, UpdateGoalDto } from './dto/goal.dto';

@Injectable()
export class GoalService {
    private readonly logger = new AllLogger();
    private readonly name = GoalService.name;
    constructor(private readonly prismaService: PrismaService){}

    async getAll(user: User){
        this.logger.log(`Try to get ${user.id}'s goals`, this.name)
        const goals = await this.prismaService.goal.findMany({
            where:{
                userId: user.id
            },
            select:{
                id: true,
                title: true,
                date: true,
                savedMoney: true,
                allMoney: true
            }
        })

        if(!goals){
            this.logger.warn('Goals not found', this.name);
            throw new NotFoundException(`Цели пользователя ${user.id} не найдены`)
        }
        this.logger.log(`Successful! ${user.id}`, this.name)
        return goals
    }

    async create(user: User, dto: GoalDto){
        this.logger.log(`Try to create goal: ${user.id}`, this.name)
        const {title, date, allMoney} = dto;
        const exist = await this.prismaService.goal.findFirst({
            where:{
                userId: user.id,
                title
            }
        })
        if(exist){
            this.logger.warn('This goal already exist', this.name)
            throw new ConflictException('Цель с таким названием уже существует')
        }

        const goal = this.prismaService.goal.create({
            data:{
                userId: user.id,
                title, 
                date,
                allMoney
            }
        })

        this.logger.log(`Successful! ${user.id}`, this.name)
        return goal
    }

    async update(user: User, dto: UpdateGoalDto){
        this.logger.log(`Try to update goal: ${user.id}`, this.name)
        const {id, savedMoney} = dto
        const exist = await this.prismaService.goal.findUnique({
            where:{
                id
            }
        })

        if(!exist){
            this.logger.warn('This goal not found', this.name)
            throw new NotFoundException(`Цель с таким названием не найдена! ${user.id}`)
        }

        const newValue = exist.savedMoney + savedMoney

        const update = await this.prismaService.goal.update({
            where:{
                id
            },
            data:{
                savedMoney: newValue
            }
        })

        this.logger.log(`Successful! ${user.id}`, this.name)
        return true
    }

    async delete(user: User, dto: DeleteDto){
        this.logger.log(`Try to delete goal: ${user.id}`, this.name)
        const id = dto.id
        if(!await this.prismaService.goal.findUnique({where:{id}})){
            this.logger.warn('This goal not found', this.name)
            throw new NotFoundException(`Цель с таким названием не найдена! ${user.id}`)
        }
        await this.prismaService.goal.delete({
            where:{
                id
            }
        })

        this.logger.log(`Successful! ${user.id}`, this.name)
        return true
    }
}
