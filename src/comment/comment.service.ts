import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '@prisma/client';
type CommentNode = {
  id: string;
  text: string;
  userId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};
@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async createComment(dto: CreateCommentDto, user: User) {
    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent) throw new NotFoundException('Parent comment not found');
    }

    return this.prisma.comment.create({
      data: {
        text: dto.text,
        parentId: dto.parentId,
        userId: user.id,
      },
    });
  }

  async getAllNestedComments(): Promise<any[]> {
    try {
      //fetching top level comment..
      const topLevelComments = await this.prisma.comment.findMany({
        where: { parentId: null, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          text: true,
          userId: true,
          parentId: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      });

      //recursively building children tree..
      return await Promise.all(
        topLevelComments.map((comment) => this.buildNestedTree(comment)),
      );
    } catch (error) {
      console.log('Error fetching nested comments:', error);
      throw new InternalServerErrorException('Failed to fetch comments');
    }
  }
  //helper function...
  private async buildNestedTree(comment: CommentNode): Promise<any> {
    //fetch direct children..

    const children = await this.prisma.comment.findMany({
      where: { parentId: comment.id, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        text: true,
        userId: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    return {
      id: comment.id,
      text: comment.deletedAt ? 'this comment was deleted' : comment.text,
      userId: comment.userId,
      parentId: comment.parentId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      deletedAt: comment.deletedAt,
      children: await Promise.all(
        children.map((child) => this.buildNestedTree(child)),
      ),
    };
  }

  // soft delete functionality  means only undo till 15 min after 15min no  backup permanent delete..
  async softDeleteComment(commentId: string, user: User) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.userId !== user.id)
      throw new ForbiddenException('you can only delete your own comments');

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });
  }

  //restore the comment...
  async restoreComment(id: string, user: User) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });

    if (!comment) throw new NotFoundException('comment not found');
    if (comment.userId !== user.id)
      throw new ForbiddenException('Not your comment');
    if (!comment.deletedAt)
      throw new BadRequestException('comment is not deleted');

    //main logic...
    const deletedAt = new Date(comment.deletedAt);
    const now = new Date();
    const diffInMs = now.getTime() - deletedAt.getTime();
    const diffInMinutes = diffInMs / (1000 * 60);

    if (diffInMinutes > 15) {
      throw new BadRequestException('Restore window expired');
    }
    return this.prisma.comment.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}
