import { Injectable } from '@nestjs/common';
import { AllLogger } from './common/log/logger.log';

@Injectable()
export class AppService {
  private readonly name = AppService.name
  private readonly logger = new AllLogger()
  getHello(){
    this.logger.log("Successful getHello request", this.name)
    return {
      "text":"Hello World!"
    }
  }
}
