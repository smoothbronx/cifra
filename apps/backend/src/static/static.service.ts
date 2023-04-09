import { CryptoService } from '@/shared/crypto/crypto.service';
import { FileTypeEnum } from '@/static/enums/fileType.enum';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { extname, join } from 'path';
import {
    BadRequestException,
    NotFoundException,
    Injectable,
    Inject,
} from '@nestjs/common';

@Injectable()
export class StaticService {
    private readonly staticDirectory: string;
    private readonly staticPath: string;

    constructor(
        @Inject(CryptoService)
        private readonly cryptoService: CryptoService,
        @Inject(ConfigService)
        private readonly configService: ConfigService,
    ) {
        this.staticDirectory = join(__dirname, '../../../../static/');
        this.staticPath = this.configService.getOrThrow('STATIC_PATH');
    }

    public async uploadFile(
        request: Request,
        file: Express.Multer.File,
        type: FileTypeEnum,
    ) {
        const types = Object.values(FileTypeEnum);
        if (!types.includes(type))
            throw new BadRequestException('Incorrect file type');

        const uploadPath = join(this.staticDirectory, `${type}s`);
        if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
        }

        const filename =
            this.cryptoService.generateUuid({
                segments: 2,
                split: false,
            }) + extname(file.originalname);

        await writeFile(join(uploadPath, filename), file.buffer);

        return {
            path: this.getServerUrl(request, type, filename),
        };
    }

    private getServerUrl(
        request: Request,
        type: FileTypeEnum,
        filename: string,
    ) {
        const { protocol, originalUrl } = request;
        const host = request.get('Host');
        const fullUrl = `${protocol}://` + host + originalUrl;

        return `${fullUrl}${type}s/${filename}`;
    }

    public getFile(
        response: Response,
        directory: string,
        filename: string,
    ): void {
        const filenamePath = join(this.staticDirectory, directory, filename);
        if (!existsSync(filenamePath)) {
            throw new NotFoundException('Image not found');
        }

        return response.sendFile(filenamePath);
    }
}
