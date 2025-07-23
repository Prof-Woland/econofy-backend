import { Body, ConflictException, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Patch, Post } from '@nestjs/common';
import { GoalService } from './goal.service';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { User } from 'prisma/generated/prisma/client';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { ApiConflictResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { DeleteDto, ExampeDto, GoalDto, UpdateGoalDto } from './dto/goal.dto';

@Controller('goal')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Get('all')
  @ApiOperation({
    summary: 'Получение всех целей пользователя'
  })
  @ApiOkResponse({
    type:[ExampeDto]
  })
  @ApiNotFoundResponse({
    description: 'Not Found Exception'
  })
  @Authorization()
  @HttpCode(HttpStatus.OK)
  async getAll(@Authorized() user: User){
    return await this.goalService.getAll(user);
  }

  @Post('create')
  @ApiOperation({
    summary: 'Создание новой цели'
  })
  @ApiConflictResponse({
    description: 'Conflict Exception'
  })
  @Authorization()
  @HttpCode(HttpStatus.CREATED)
  async create(@Authorized() user: User, @Body() dto: GoalDto) {
    return await this.goalService.create(user, dto)
  }

  @Patch('update')
  @ApiOperation({
    summary: 'Добавление накопленных денег'
  })
  @ApiOkResponse({
    type: 'true'
  })
  @ApiNotFoundResponse({
    description: 'Not Found Exception'
  })
  @HttpCode(HttpStatus.OK)
  @Authorization()
  async update(@Authorized() user: User, @Body() dto: UpdateGoalDto){
    return await this.goalService.update(user, dto)
  }

  @Delete('delete')
  @ApiOperation({
    summary: 'Удаление цели'
  })
  @ApiOkResponse({
    type: 'true'
  })
  @ApiNotFoundResponse({
    description: 'Not Found Exception'
  })
  @HttpCode(HttpStatus.OK)
  @Authorization()
  async delete(@Authorized() user: User, @Body() dto: DeleteDto){
    return await this.goalService.delete(user, dto)
  }
}
