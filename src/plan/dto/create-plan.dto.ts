import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsJSON, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreatePlanDto {
    @ApiProperty({
        title: "Название плана",
        example: "Мой план"
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        title: "Минимальный доход",
        description: "Числовое значение",
        example: "2800"
    })
    @IsNumber()
    @IsNotEmpty()
    income_min: number;

    @ApiProperty({
        title: "Максимальный доход",
        description: "Числовое значение",
        example: "2900"
    })
    @IsNumber()
    @IsNotEmpty()
    income_max: number;

    @ApiProperty({
        title: "Процент который нужно накопить",
        description: "Числовое значение",
        example: "12"
    })
    @IsNumber()
    @IsNotEmpty()
    percents: number;

    @ApiProperty({
        title: "Дата накопления",
        description: "Строковое значение",
        example: "31.12.2025"
    })
    @IsString()
    @IsNotEmpty()
    date: string;

    @ApiProperty({
        title: "Количество поездок в день",
        description: "Числовое значение",
        example: "12"
    })
    @IsNumber()
    trips: number;

    @ApiProperty({
        title: "Количество комнат в квартире",
        description: "Числовое значение",
        example: "3"
    })
    @IsNumber()
    rooms: number;

    @ApiProperty({
        title: "Количество членов семьи",
        description: "Числовое значение",
        example: "3"
    })
    @IsNumber()
    members: number;

    @ApiProperty({
        title: "Информация о кредите/кредитах",
        description: "Строка. Может быть пустой",
        example: "Кредит 250BYN/мес (5%)"
    })
    @IsString()
    credit: string;

    @ApiProperty({
        title: "Информация о хобби",
        description: "Строка. Может быть пустой",
        example: "120BYN/мес"
    })
    @IsString()
    hobby: string;

    @ApiProperty({
        title: "Непредвиденные траты",
        description: "Строка. Может быть пустой",
        example: "Ремонт машины 150"
    })
    @IsString()
    expences: string;
}
