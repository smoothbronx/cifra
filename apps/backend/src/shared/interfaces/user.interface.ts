import { Role } from '@/shared/enums/Role.enum';
import { DropdownItemDto } from '@/users/dto/filter.dto';

export interface IUser {
    readonly id: number;

    login: string;

    firstName: string;

    lastName: string;

    patronymic?: string;

    branch: DropdownItemDto;

    role: Role;

    post: DropdownItemDto;

    createdAt: Date;

    lastEntry: Date;
}
