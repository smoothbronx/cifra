import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from '@/shared/enums/Role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
    @ApiProperty({
        readOnly: true,
        required: true,
        name: 'id',
        description: 'Уникальный идентификатор пользователя',
        example: 0,
    })
    public readonly id: number;

    @ApiProperty({
        required: true,
        name: 'login',
        description: 'Логин пользователя',
        example: 'ivanII@example.com',
    })
    public login: string;

    @ApiProperty({
        required: true,
        name: 'firstName',
        description: 'Имя пользователя',
        example: 'Иван',
    })
    public firstName: string;

    @ApiProperty({
        required: true,
        name: 'lastName',
        description: 'Фамилия пользователя',
        example: 'Иванов',
    })
    public lastName: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        required: false,
        name: 'patronymic',
        description: 'Отчество пользователя',
        example: 'Иванович',
    })
    public patronymic?: string;

    @IsEnum(Role)
    @ApiProperty({
        required: true,
        enum: Role,
        name: 'role',
        description: 'Роль пользователя в системе',
        example: Role.ADMIN,
    })
    public role: Role;

    @ApiProperty({
        required: true,
        name: 'postId',
        description: 'Идентификатор должности пользователя в филиале',
    })
    public postId: number;

    @IsString()
    @ApiProperty({
        required: true,
        name: 'branchId',
        description: 'Идектификатор филиала пользователя',
    })
    public branchId: number;

    @ApiProperty({
        required: true,
        readOnly: true,
        name: 'createdAt',
        description: 'Дата создания аккаунта пользователя',
        example: 1677262161181,
    })
    public createdAt: number;

    @ApiProperty({
        required: true,
        readOnly: true,
        name: 'lastEntry',
        description: 'Последний вход пользователя в систему',
        example: 1677262161181,
    })
    public lastEntry: number;

    @ApiProperty({
        required: true,
        writeOnly: true,
        name: 'password',
        description: 'Пароль пользователя',
        example: 'P@ssw0rd',
    })
    public password;
}
