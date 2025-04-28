import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoviesModule } from './movies/movies.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/sample_mflix', {
      connectionFactory: (connection) => {
        connection.on('connected', () => {
          console.log('MongoDB connected to database:', connection.db.databaseName);
        });
        connection.on('error', (err: any) => {
          console.error('MongoDB connection error:', err.message);
        });
        return connection;
      }
    }),
    MoviesModule,
    UserModule,
    UserModule
  ],
  controllers: [AppController],  
  providers: [AppService],
})
export class AppModule {}