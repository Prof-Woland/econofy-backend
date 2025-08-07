import { ConflictException, ImATeapotException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { MinusPlanDto } from './dto/update-plan.dto';
import { ConfigService } from '@nestjs/config';
import { AllLogger } from 'src/common/log/logger.log';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { User } from 'prisma/generated/prisma/client';
import { Categories } from './dto/update-plan.dto'; 
import { Cache } from 'cache-manager';
import { PlanToCache } from './interfaces/Plan.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PlanService {
  private readonly logger = new AllLogger();
  private readonly name = PlanService.name;
  constructor(private readonly configService: ConfigService, private readonly prismaService: PrismaService, @Inject(CACHE_MANAGER) private cacheManager: Cache){}
  
  async create(dto: CreatePlanDto, user: User) {
    this.logger.log(`Try to create plan: ${user.id}`, this.name);
    const {income_min, percents, title, date} = dto;
    const basicDate = this.setDate(date);
    const endDate = new Date(Date.parse(basicDate));
    const startDate = new Date;
    const period = this.monthsBetweenDates(startDate, endDate).toString()
    const target = income_min - (income_min * percents)/100;
    const url = "https://openrouter.ai/api/v1/chat/completions";
    const headers = {
      "Authorization": `Bearer ${this.configService.getOrThrow('GPT_API_KEY')}`,
      "Content-Type": "application/json"
    };
    const payload = {
      "model": "google/gemini-2.5-flash-lite",
      "max_tokens": 8000,
      "messages": [
        {
          "role": "user",
          "content": `Ты финансовый консультант-аналитик, специализирующийся на создании персональных планов бюджетирования. Твоя задача - создать детализированный помесячный план бюджетирования с учетом всех пользовательских параметров. ПОСЛЕ РАСЧЕТОВ ВСЕГДА ПРОВЕРЯЙ РЕЗУЛЬТАТ!!! НЕ УЧИТЫВАЙ ПРОШЛЫЕ ЗАПРОСЫ. НЕ УПОМИНАЙ МОБИЛЬНЫЕ ПРИЛОЖЕНИЯ. НЕ ИСПОЛЬЗУЙ В ОТВЕТАХ ЭМОДЖИ. В ОТВЕТЕ МНЕ НУЖЕН ТОЛЬКО JSON \"ПАРАМЕТРЫ ДЛЯ API\. ВЫДАЙ ОТВЕТ ТОЛЬКО В ВАЛИДНОМ JSON ФОРМАТЕ. Все ключи должны быть в двойных кавычках! Везде проверяй наличие запятых и скобок! Везде проверяй наличие двоеточий!!! ПОСЛЕ ФОРМИРОВАНИЯ ОТВЕТА ПРОВЕРЬ JSON НА ВАЛИДНОСТЬ!!!! ПОЛЯ В ОбЪЕКТЕ \"ПЛАН БЮДЖЕТА\" ДОЛЖНЫ БЫТЬ НА РУССКОМ!!!"
          Входные данные:
          1.  Доход: 
            - \"income_min\" - \"income_max\" BYN (если значения равны, то доход фиксирован и равен \"income_min\")
            - \"target\" BYN - значение бюджета которое нужно распределить по расходам
          2.  Цель накоплений:
            - \"savings_percent\" % от месячного дохода
            - \"period_months\" - количество месяцев для накопления
          3.  Параметры домохозяйства:
            - \"daily_trips\" поездок на общественном транспорте в день на семью
            - \"apartment_rooms\" комнат в квартире
            - \"family_members\" человек в семье
          4.  Хобби (опционально):
            - \"hobby\" = [сумма] BYN/мес
          5.  Дополнительные траты (опционально):
            - \"credit\" = [сумма] BYN/мес (процент: [%])
            - \"hobby\" = [сумма] BYN/мес
            - \"custom_expenses\" = [описание]:[сумма] BYN/мес (через запятую)

          Задача:
          1. Расчеты:
          - Общий минимальный доход за период: \"income_min * period_months\"
          - Ежемесячные накопления: \"income_min * savings_percent / 100\"
          - Месячный бюджет на расходы: \"target\"

          2. Распределение расходов. Расходы должны быть равны, либо меньше чем \"target\". Кредиты и хобби входят в \"target\". Старайся распределить так, чтобы уместиться в \"target\":
          - Магазинные товары (в том числе и продукты питания): 450-600 BYN * \"family_members\"
          - Транспорт: \"daily_trips * 30\" (должно быть не больше 500 BYN)
          - ЖКХ: 50-60 BYN*\"apartment_rooms\" + 15*\"family_members\"
          - Медицина: 50-80 BYN*\"family_members\" (если не указано)
          - Связь/Интернет: 50-80 + 40*\"family_members\" BYN
          - Хобби: Используй \"hobby\" или 0
          - Кредит: Используй \"credit\" если есть
          - Другие траты: Используй \"custom_expenses\"
          - Непредвиденные: 5% от бюджета расходов
          - Одежда/быт: 3-5% от бюджета
          - Дополнительные категории: если останется незадействованный бюджет, создай дополнительные категории и сформируй подушку безопасности ОБЯЗАТЕЛЬНО!!!!!!!!!!!!! ЗАДАЧА ПОЛНОСТЬЮ РАСПРЕДЕЛИТЬ БЮДЖЕТ!!!!!!!!!!!
          После распределения два раза проверить все вычисления!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

          3. Анализ (Распиши минимум на 5 предложений):
          - Проверь превышение бюджета (если расходы > \"income_min\")
          - Оцени реалистичность цели накоплений
          - Предложи оптимизацию при дефиците
          - Если остались незадействованные средства, можешь добавить какие-либо категории
          - ОБЯЗАТЕЛЬНО! Если после распределения сумма распределенных средств больше чем \"target\" - объясни, что сумма была превышена для того чтобы обеспечить экономическую безопасность (например, созданием подушки безопасности), а также напиши, сколько получится накопить с таким распределением расходов за указанный срок. Если полученное количество расходов больше \"target\", но меньше чем \"income_min\", написать что оставшиеся средства идут на накопление и посчитать сколько получится накопить
          
          4. Рекомендации:
          - Конкретные советы по категориям
          - Важность резервного фонда
          - Корректировка при изменении дохода
          - Советы по учету для семьи

          🔧 ПАРАМЕТРЫ ДЛЯ API
          {
          \"user_input\": {
            \"income_range\": [X, X],
            \"savings_percent\": X,
            \"period_months\": X,
            \"daily_trips\": X,
            \"apartment_rooms\": X,
            \"family_members\": X,
            \"credit\": X,
            \"hobby\": X,
            \"custom_expenses\": {\"описание\": сумма}
          },
          \"calculations\": {
            \"total_savings_target\": X,
            \"monthly_savings\": X,
            \"monthly_budget\": X,
            \"expences\": X,
          },
          \"recommendations\": X, //вписать полностью рекомендации из раздела \"Рекомендации\" и представить их в виде массива строк,
          \"analysis\": X, //вписать максимально полностью весь текст из раздела \"Анализ\",

          \"budget_plan\": {
            {
              \"name\": \"Магазинные товары\",
              \"population\": X //траты на продукты,
              \"color\":\"#FF4040\",
            },
            {
              \"name\": "Общественный транспорт",
              \"population\": X //траты на общественный транспорт,
              \"color\":\"#FFE800\",
            },
            {
              \"name\": \"ЖКУ\",
              \"population\": X //траты на жкх,
              \"color\":\"#476DD5\",
            },
            {
              \"name\": \"Здоровье\",
              \"population\": X //траты на медицину,
              \"color\":\"#2DD700\",
            }, 
            {
              \"name\": "Хобби\",
              \"population\": X //траты на хобби,
              \"color\":\"#FFBF00\",
            }, 
            {
              \"name\": \"Кредиты\",
              \"population\": X //траты на кредиты,
              \"color\":\"#9F3ED5\",
            }, 
            {
              //вписать новые категории, если созданы
              { 
                \"name\": \"Дополнительная категория\",
                \"population\": X //траты на эту категорию
                \"color\":\"#D30068\",
              }
            },
          }
          }

          ====================================
          🔧 Входные данные
          {
          \"user_input\": {
            \"income_range\": [${dto.income_min}, ${dto.income_max}],
            \"target\":${target},
            \"savings_percent\": ${dto.percents},
            \"period_months\": ${period},
            \"daily_trips\": ${dto.trips} (10, если не указано),
            \"apartment_rooms\": ${dto.rooms} (1, если не указано),
            \"family_members\": ${dto.members} (1, если не указано),
            \"credit\": ${dto.credit},
            \"hobby\": ${dto.hobby},
            \"custom_expences\": ${dto.expences}
          }`}
      ]
    };

    let expire: string
    if(period[-1] == '1'){
      expire = period + ' месяц';
    }
    else if(period[-1] == '2' || period[-1] == '3' || period[-1] == '4'){
      expire = period + ' месяца';
    }
    else{
      expire = period + ' месяцeв';
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const message = data.choices[0].message.content;
    const text = JSON.parse(message.slice(7, -3));
    const id = uuidv4();

    const cachePayload: PlanToCache = {
      id,
      userId: user.id,
      title,
      date,
      limitMoney: target,
      remainder: target,
      analysis: text["analysis"],
      recommendations: text["recommendations"],
      budgetPlan: text["budget_plan"],
      term: expire,
    };
    try{
      await this.cacheManager.set(`${id + 'plan'}`, `${JSON.stringify(cachePayload)}`, 24*60*60*1000);
    }
    catch(InternalServerErrorException){
      this.logger.warn(`Failed to add plan to cache: ${id}`, this.name);
      throw new ImATeapotException('Не удалось добавить план в кэш');
    };
    this.logger.log(`Successful! ${user.id}`, this.name);
    return {
      id,
      analysis: text["analysis"],
      recommendations: text["recommendations"],
      budgetPlan: text["budget_plan"]
    };
  }

  async createEnd(id: string, user: User){
    this.logger.log(`Try to create plan finally: ${user.id}`, this.name);
    const plan: string | undefined = await this.cacheManager.get(`${id + 'plan'}`);

    if(!plan){
      this.logger.warn(`Failed to get plan from cache: ${id}`, this.name);
      throw new ImATeapotException('Не удалось получить план из кеша');
    }

    const parsedPlan = JSON.parse(plan);

    const newPlan = await this.prismaService.plan.create({
      data:{
        id: parsedPlan["id"],
        userId: parsedPlan["userId"],
        title: parsedPlan["title"],
        date: parsedPlan["date"],
        limitMoney: parsedPlan["limitMoney"],
        remainder: parsedPlan["remainder"],
        analysis: parsedPlan["analysis"],
        recommendations: parsedPlan["recommendations"],
        budgetPlan: parsedPlan["budgetPlan"],
        term: parsedPlan["term"]
      }
    });
    if(!newPlan){
      this.logger.warn(`Failed to create plan to database: ${id}`, this.name);
      throw new ImATeapotException('Не удалось сохранить план в БД');
    };
    this.logger.log(`Successful! ${user.id}`, this.name);

    return {
      id: parsedPlan["id"], 
      title: parsedPlan["title"], 
      date: parsedPlan["date"], 
      term: parsedPlan["term"], 
      limitMoney: parsedPlan["limitMoney"], 
      spentMoney: 0, 
      remainder: parsedPlan["remainder"],
    }
  }

  async findAll(user: User) {
    this.logger.log(`Try to get ${user.id}'s plans`, this.name);
    const plans = await this.prismaService.plan.findMany({
      where:{
        userId: user.id
      },
      select:{
        id: true,
        title: true,
        date: true,
        spentMoney: true,
        limitMoney: true,
        remainder: true,
        term: true,
      }
    });
    if(!plans){
      this.logger.warn('Plans not found', this.name);
      throw new NotFoundException(`Цели пользователя ${user.id} не найдены`);
    }
    this.logger.log(`Successful! ${user.id}`, this.name);
    return plans;
  }

  async findOne(id: string, user: User) {
    this.logger.log(`Try to get plan's description: ${user.id}`, this.name)
    let expenseArray: object[] = []
    const plan = await this.prismaService.plan.findUnique({
      where:{
        id,
        userId: user.id,
      },
      select:{
        title: true,
        analysis: true,
        recommendations: true,
        budgetPlan: true,
      }
    })

    if(!plan){
      this.logger.warn('This plan not found', this.name);
      throw new NotFoundException('План с таким ID у этого пользователя не найден')
    };
    const categoryValues = Object.values(Categories);
    for(const element in categoryValues){
      const expense = await this.prismaService.expenses.aggregate({
        _sum:{
          expense: true
        },
        _count:{
          _all: true,
        },
        where:{
          category: categoryValues[element],
          planId: id
        },
      })
      let expenses: number;
      if(expense._sum.expense){
        expenses = +expense._sum.expense;
      }
      else{
        expenses = 0;
      }
      expenseArray.push({title: categoryValues[element], spendingCount: expense._count._all, spendingMoney: expenses})
    }

    this.logger.log(`Successful! ${user.id}`, this.name)
    return {
      id,
      title: plan.title,
      analysis: plan.analysis,
      recommendations: plan.recommendations,
      budgetPlan: plan.budgetPlan,
      expenses: expenseArray,
    };
  }

  async update(id: string, dto: MinusPlanDto, user: User) {
    const { expenses } = dto
    this.logger.log(`Try to update plan: ${user.id}`, this.name)
    const extendPlan = await this.prismaService.plan.findUnique({
      where:{
        id,
        userId: user.id
      }
    })
    if(!extendPlan){
      this.logger.warn(`Plan was not found: ${user.id}`, this.name);
      throw new NotFoundException('План с таким ID не найден у этого пользователя')
    }
    const newSpent = extendPlan.spentMoney + expenses;
    const newRemainder = extendPlan.remainder - expenses;
    if(extendPlan.remainder < 0){
      this.logger.warn('Money value is negative', this.name)
      throw new ConflictException('Получено отрицательное значение')
    }

    const newPlan = await this.prismaService.plan.update({
      where:{
        id,
        userId: user.id,
      },
      data:{
        spentMoney: newSpent,
        remainder: newRemainder,
      }
    })

    await this.prismaService.expenses.create({
      data:{
        planId: id,
        category: dto.category,
        expense: dto.expenses
      }
    })
    this.logger.log(`Successful! ${user.id}`, this.name);
    return newPlan;
  }

  async remove(id: string, user: User) {
    const extend = await this.prismaService.plan.findUnique({
      where:{
        id,
        userId: user.id,
      }
    })

    if(!extend){
      this.logger.warn(`This plan not found: ${user.id}`, this.name);
      throw new NotFoundException('План с таким ID не найден')
    }

    await this.prismaService.plan.deleteMany({
      where:{
        id,
        userId:user.id
      }
    })
    this.logger.log(`Successful! ${user.id}`, this.name)
    return this.findAll(user);
  }

  private monthsBetweenDates(startDate: Date, endDate: Date): number {
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();

    let monthDiff = (endYear - startYear) * 12 + (endMonth - startMonth);

    if (endDate.getDate() < startDate.getDate()) {
        monthDiff--;
    }

    return monthDiff;
  }

  private setDate(date: string){
    const [day, month, year] = date.split('.');
    return year + '-' + month + '-' + day;
  }
}
