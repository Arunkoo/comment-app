import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

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

  async login(email: string, password: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) throw new UnauthorizedException('Invalid credentials');
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) throw new UnauthorizedException('Invalid credentials');

      const token = await this.jwt.signAsync({
        sub: user.id,
        email: user.email,
      });

      return { access_token: token };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Login failed');
    }
  }
}
