import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '@prisma/client';
@Controller('comments')
@UseGuards(AuthGuard('jwt'))
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async create(@Body() dto: CreateCommentDto, @Request() req: { user: User }) {
    return this.commentService.createComment(dto, req.user);
  }

  @Get()
  async getAll() {
    return this.commentService.getAllNestedComments();
  }

  @Delete(':id')
  async softDelete(@Param('id') id: string, @Request() req: { user: User }) {
    return this.commentService.softDeleteComment(id, req.user);
  }

  @Post(':id/restore')
  async restore(@Param('id') id: string, @Request() req: { user: User }) {
    return this.commentService.restoreComment(id, req.user);
  }
}
