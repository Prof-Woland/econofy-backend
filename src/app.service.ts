import { App } from 'supertest/types';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name)
  getHello(){
    this.logger.log("Successful getHello request")
    return {
      "text":"Hello World!"
    }
  }
}
