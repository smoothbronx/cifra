import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { v4 as uuid4 } from 'uuid';

@Injectable()
export class CryptoService {
    public static passwordMatch(
        password: string,
        passwordHash: string,
    ): boolean {
        return bcrypt.compareSync(password, passwordHash);
    }

    public static generateHashFromPassword(password: string): string {
        return bcrypt.hashSync(password, bcrypt.genSaltSync());
    }

    public generateUuid(options: { segments: number; split: boolean }) {
        if (options.segments > 4 || options.segments < 1) {
            throw new Error('Incorrect segments value');
        }

        const segments: string[] = uuid4().split('-');
        const slicedSegments = segments.slice(0, options.segments + 1);

        return slicedSegments.join(options.split ? '-' : '');
    }
}
