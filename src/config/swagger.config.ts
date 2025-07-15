import { DocumentBuilder } from "@nestjs/swagger";

export function getSwaggerConfig(){
    return new DocumentBuilder()
    .setTitle('Econofy Backend API')
    .setDescription('API, предназначенное для работы мобильного приложения Econofy')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
}