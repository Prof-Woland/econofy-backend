import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEnum, IsJSON, IsNotEmpty, IsNumber } from "class-validator";
import { IPlanExpenses } from "../interfaces/Plan.interface";

export enum Categories{
      STORE_AND_HOUSEHOLD = "Продукты, быт. товары",
      COSMETICS = "Косметика",
      TRANSPORT = "Общ. транспорт",
      HOUSING_AND_COMMUNAL_SERVICES = "ЖКУ",
      HEALTH = "Здоровье",
      INTERNET = "Связь/Интернет",
      HOBBY = "Хобби",
      LOANS = "Кредиты",
      CLOTH = "Одежда, быт",
      UNFORESSEN_EXPENSES = "Непредвиденные расходы",
      AIRBAG = "Подушка безопасности",
      ADDITIONAL_EXPENSES = "Дополнительные расходы"
    }

export class MinusPlanDto{
    @ApiProperty({
        title: "Категория расхода",
        example: "COSMETICS (из enum Categories)"
    })
    @IsEnum(Categories)
    @IsNotEmpty()
    category: Categories;

    @ApiProperty({
        title: "Значение расхода",
        example: "500"
    })
    @IsNumber()
    @IsNotEmpty()
    expenses: number;
}

export class ExpensesDto{
    @ApiProperty({
        title: "Категория расхода",
        example: "Косметика"
    })
    @IsNotEmpty()
    category: string
}