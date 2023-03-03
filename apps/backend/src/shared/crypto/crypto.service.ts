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

    public static generateUuid() {
        return uuid4();
    }
}
