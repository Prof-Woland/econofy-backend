import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, Length } from "class-validator"

export class UserDto{
    @ApiProperty({
        title: "Логин пользователя",
        description: "Строковое значение от 2 до 50 символов длиной",
        example: "myLogin"
    })
    @IsString({message: 'Значение логина должно быть строкой'})
    @IsNotEmpty({message: 'Значение логина не должно быть пустым'})
    @Length(2, 50, {message:'Значение логина должно быть в диапазоне от 2 до 50 символов'})
    login: string

    @ApiProperty({
        title: "Пароль пользователя",
        description: "Строковое значение от 8 до 128 символов длиной",
        example: "ex@mplep@ssw0rd"
    })
    @IsString({message: 'Значение пароля должно быть строкой'})
    @IsNotEmpty({message: 'Значение пароля не должно быть пустым'})
    @Length(8, 128, {message:'Значение пароля должно быть в диапазоне от 8 до 128 символов'})
    password: string
}

export class RefreshDto{
    @ApiProperty({
            title: "Токен обновления",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    })
    @IsString({message: 'Значение должно быть строкой'})
    @IsNotEmpty({message: 'Значение не должно быть пустым'})
    refreshToken: string;
}