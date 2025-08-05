import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { MinusPlanDto } from './dto/update-plan.dto';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { User } from 'prisma/generated/prisma/client';
import { ApiOperation } from '@nestjs/swagger';

@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  @Authorization()
  @ApiOperation({
    summary: 'Создание нового плана (в кэш)'
  })
  async create(@Body() createPlanDto: CreatePlanDto, @Authorized() user: User) {
    return await this.planService.create(createPlanDto, user);
  }

  @Post('end/:id')
  @Authorization()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Окончательное создание нового плана'
  })
  async createEnd(@Param('id') id: string, @Authorized() user: User) {
    return await this.planService.createEnd(id, user);
  }

  @Get()
  @Authorization()
  @ApiOperation({
    summary: 'Получение всех планов пользователя по его ID'
  })
  async findAll(@Authorized() user: User) {
    return await this.planService.findAll(user);
  }

  @Get(':id')
  @Authorization()
    @ApiOperation({
    summary: 'Получение подробной информации о плане по его ID'
  })
  async findOne(@Param('id') id: string, @Authorized() user: User) {
    return await this.planService.findOne(id, user);
  }

  @Patch(':id')
  @Authorization()
  @ApiOperation({
    summary: 'Добавление расхода в план'
  })
  async update(@Param('id') id: string, @Body() minusPlanDto: MinusPlanDto, @Authorized() user: User) {
    return await this.planService.update(id, minusPlanDto, user);
  }

  @Delete(':id')
  @Authorization()
  @ApiOperation({
    summary: 'Удаление плана'
  })
  async remove(@Param('id') id: string, @Authorized() user: User) {
    return await this.planService.remove(id, user);
  }
}
