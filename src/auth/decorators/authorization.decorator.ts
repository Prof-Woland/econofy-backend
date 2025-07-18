import { applyDecorators, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../guard/jwt.guard";
import { AllLogger } from "src/common/log/logger.log";

export function Authorization(){
    return applyDecorators(UseGuards(JwtGuard))
}