import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { getAppConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const appConfig = getAppConfig();

  const config = new DocumentBuilder()
    .setTitle('ServiceDesk Pro API')
    .setDescription('ServiceDesk Pro API documentation with Swagger')
    .setVersion('1.0')
    .addBearerAuth() // Para JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Global configuración del prefijo de la ruta
  app.setGlobalPrefix('api/v1');

  // CORS configuración del prefijo de la ruta
  app.enableCors({
    origin: appConfig.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Proxy de confianza para direcciones IP correctas
  app.set('trust proxy', 1);

  const port = appConfig.port;
  await app.listen(port);

  console.log(`🚀 ServiceDesk Pro API is running on: http://localhost:${port}/api/v1`);
  console.log(`📊 Environment: ${appConfig.nodeEnv}`);
}

bootstrap().catch((error) => {
  console.error('❌ Error starting the application:', error);
  process.exit(1);
});
