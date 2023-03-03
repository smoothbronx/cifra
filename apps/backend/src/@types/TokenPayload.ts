import { Role } from '@/shared/enums/Role.enum';

export type TokenPayload = {
    type: 'access' | 'refresh';
    login: string;
    role: Role;
};
