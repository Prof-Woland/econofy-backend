import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEnum, IsNotEmpty, IsNumber } from "class-validator";

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

    @ApiProperty({
        title: "Дата расхода",
        example: "2024-07-26T10:30:00"
    })
    @IsDate()
    @IsNotEmpty()
    date: Date
}
