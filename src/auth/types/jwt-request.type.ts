import { Request } from '@nestjs/common';

export interface JwtRequest extends Request {
  user: {
    sub: string;
  };
}
