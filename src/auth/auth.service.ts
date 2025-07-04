import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await this.prisma.user.create({
        data: { email, password: hashedPassword },
      });

      return { message: 'User registered', userId: user.id };
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError) {
        const target = error.meta?.target;

        if (Array.isArray(target) && target.includes('email')) {
          throw new ConflictException('Email is already registered');
        }
      }

      throw new InternalServerErrorException('Registration failed');
    }
  }
}
