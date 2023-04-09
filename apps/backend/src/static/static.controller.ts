import { FileInterceptor } from '@nestjs/platform-express';
import { FileTypeEnum } from '@/static/enums/fileType.enum';
import { StaticService } from '@/static/static.service';
import { Express, Request, Response } from 'express';
import {
    UseInterceptors,
    UploadedFile,
    Controller,
    Inject,
    Body,
    Post,
    Req,
    Get,
    Param,
    Res,
} from '@nestjs/common';

@Controller('/static/')
export class StaticController {
    constructor(
        @Inject(StaticService)
        private readonly staticService: StaticService,
    ) {}

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
