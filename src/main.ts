import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function start() {
  try {
    const PORT = process.env.PORT || 3030;
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());

    await app.listen(3000);
    console.log(`server startted at: ${PORT}`);
  } catch (error) {
    console.log(error);
  }
}
start();
