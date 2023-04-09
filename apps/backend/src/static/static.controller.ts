import { AcceptRoles } from '@/shared/access/acceptRoles.decorator';
import { FileTypeEnum } from '@/static/enums/fileType.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { StaticService } from '@/static/static.service';
import { JwtAuthGuard } from '@/shared/jwt/jwt.guard';
import { Express, Request, Response } from 'express';
import { Role } from '@/shared/enums/Role.enum';
import { ApiTags } from '@nestjs/swagger';
import {
    UseInterceptors,
    UploadedFile,
    Controller,
    UseGuards,
    Inject,
    Param,
    Body,
    Post,
    Req,
    Get,
    Res,
} from '@nestjs/common';

@ApiTags('static')
@AcceptRoles()
@UseGuards(JwtAuthGuard)
@Controller('/static/')
export class StaticController {
    constructor(
        @Inject(StaticService)
        private readonly staticService: StaticService,
    ) {}

    @AcceptRoles(Role.EDITOR, Role.ADMIN)
    @UseInterceptors(FileInterceptor('file'))
    @Post('/')
    public uploadFile(
        @Req() request: Request,
        @UploadedFile() file: Express.Multer.File,
        @Body('type') type: FileTypeEnum,
    ) {
        return this.staticService.uploadFile(request, file, type);
    }

    @Get('/:directory/:filename')
    public getFile(
        @Res() response: Response,
        @Param('directory') directory: string,
        @Param('filename') filename: string,
    ) {
        this.staticService.getFile(response, directory, filename);
    }
}
