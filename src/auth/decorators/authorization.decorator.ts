import { applyDecorators, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../guard/jwt.guard";

export function Authorization(){
    return applyDecorators(UseGuards(JwtGuard))
}