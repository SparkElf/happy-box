import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';
import {config} from 'dotenv'

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{cors:true});
  await app.listen(process.env.PORT);
}
config()//将env文件中的值加载到环境变量 console.log(process.env.DB_HOST);
bootstrap();
