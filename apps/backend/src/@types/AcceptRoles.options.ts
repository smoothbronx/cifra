import { Role } from '@/shared/enums/Role.enum';

export type AcceptRolesOptions = {
    accept?: Role[];
    prevent?: Role[];
};
