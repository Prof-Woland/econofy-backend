import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AvatarDto{
    @ApiProperty({
        title: "Ссылка на аватар",
        description: "Строковое значение",
        example: "/downloads/avatar.png"
    })
    @IsString({message: 'Значение должно быть строкой'})
    @IsNotEmpty({message: 'Значение не должно быть пустым'})
    uri: string
}