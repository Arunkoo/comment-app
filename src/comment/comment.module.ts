import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [CommentController],
  providers: [CommentService, PrismaService],
})
export class CommentModule {}
