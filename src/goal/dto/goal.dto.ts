import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class GoalDto{
    @ApiProperty({
        title: "Название цели",
        description: "Строковое значение от 2 до 50 символов длиной",
        example: "myGoal"
    })
    @IsNotEmpty()
    @IsString()
    @Length(2, 50)
    title: string;

    @ApiProperty({
        title: "Дата выполнения цели",
        description: "Строковое значение от 5 до 10 символов длиной",
        example: "29.07.2008"
    })    
    @IsNotEmpty()
    @IsString()
    @Length(5, 10)
    date: string;

    @ApiProperty({
        title: "Количество необходимых денег",
        description: "Числовое значение",
        example: "500"
    }) 
    @IsNotEmpty()
    @IsNumber()
    allMoney: number;
}

export class UpdateGoalDto{
    @ApiProperty({
        title: "ID цели",
        description: "Строковое значение",
        example: "uuid4"
    })
    @IsNotEmpty()
    @IsString()
    id: string;

    @ApiProperty({
        title: "Количество накопленных денег",
        description: "Числовое значение",
        example: "25"
    }) 
    @IsNumber()
    @IsNotEmpty()
    savedMoney: number;
}

export class DeleteDto{
    @ApiProperty({
        title: "ID цели",
        description: "Строковое значение",
        example: "uuid4"
    })
    @IsNotEmpty()
    @IsString()
    id: string;
}

export class ExampeDto{
    @ApiProperty({
        title: "Название цели",
        description: "Строковое значение от 2 до 50 символов длиной",
        example: "myGoal"
    })
    @IsNotEmpty()
    @IsString()
    @Length(2, 50)
    title: string;

    @ApiProperty({
        title: "Дата выполнения цели",
        description: "Строковое значение от 5 до 10 символов длиной",
        example: "29.07.2008"
    })    
    @IsNotEmpty()
    @IsString()
    @Length(5, 10)
    date: string;

    @ApiProperty({
        title: "Количество накопленных денег",
        description: "Числовое значение",
        example: "25"
    }) 
    @IsNumber()
    @IsNotEmpty()
    savedMoney: number;

    @ApiProperty({
        title: "Количество необходимых денег",
        description: "Числовое значение",
        example: "500"
    }) 
    @IsNotEmpty()
    @IsNumber()
    allMoney: number;
}