import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserNotification(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: 'desc' },
      include: {
        comment: true,
      },
    });

    //mark all unread notification as read...
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return notifications;
  }
}
