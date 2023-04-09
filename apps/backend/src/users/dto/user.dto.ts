import { DropdownItemDto } from '@/users/dto/filter.dto';
import { Role } from '@/shared/enums/Role.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ValidateNested,
    IsMobilePhone,
    IsOptional,
    MaxLength,
    MinLength,
    IsString,
    Matches,
    IsEmail,
    IsEnum,
} from 'class-validator';

export class UserStatisticDto {
    @ApiProperty({
        name: 'progressPercent',
        required: true,
        readOnly: true,
        example: 65,
    })
    public progressPercent: number;

    @ApiProperty({
        name: 'cardsPassed',
        required: true,
        readOnly: true,
        example: 13,
    })
    public cardsPassed: number;

    @ApiProperty({
        name: 'allCards',
        required: true,
        readOnly: true,
        example: 20,
    })
    public allCards: number;
}

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
        name: 'email',
        description: 'Адрес электронной почты пользователя',
        example: 'ivanII@example.com',
    })
    public email: string;

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

    @IsMobilePhone()
    public phoneNumber: number;

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

    @ApiProperty({
        name: 'statistic',
        required: false,
        readOnly: true,
    })
    public statistic: UserStatisticDto;
}

export class UserCreatingDto {
    @IsString()
    @ApiProperty({
        name: 'fullname',
        description: 'ФИО пользователя',
        example: 'Иванов Иван Иванович',
        required: true,
    })
    public fullname: string;

    @IsEmail()
    @ApiProperty({
        name: 'email',
        description: 'Адрес электронной почты пользователя',
        required: true,
        example: 'ivanII@example.com',
    })
    public email: string;

    @IsMobilePhone()
    @ApiProperty({
        name: 'phone',
        description: 'Номер телефона пользователя',
        required: true,
    })
    public phone: string;

    @IsString()
    @MinLength(6)
    @MaxLength(20)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Этот пароль слишком простой',
    })
    @ApiProperty({
        name: 'password',
        description: 'Пароль пользователя',
        required: true,
    })
    public password: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => DropdownItemDto)
    @ApiProperty({
        name: 'branch',
        description: 'Филиал пользователя',
        required: false,
    })
    public branch?: DropdownItemDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => DropdownItemDto)
    @ApiProperty({
        name: 'post',
        description: 'Должность пользователя',
        required: false,
    })
    public post?: DropdownItemDto;

    @ValidateNested()
    @Type(() => DropdownItemDto)
    @ApiProperty({
        name: 'course',
        description: 'Курс, к которому привязан пользователь',
        required: false,
    })
    public course?: DropdownItemDto;

    @IsEnum(Role)
    @IsOptional()
    @ApiProperty({
        name: 'role',
        description: 'Роль пользователя в системе',
        required: false,
        example: Role.ADMIN,
        default: Role.USER,
    })
    public role: Role = Role.USER;
}
