import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ValidateNested,
    IsOptional,
    IsPositive,
    IsNumber,
    IsString,
    IsArray,
} from 'class-validator';

export class FilterDto {
    @IsString()
    @IsOptional()
    @ApiProperty({
        required: false,
        name: 'name',
        description: 'Значение для филтрации по ФИО пользователя',
        example: 'Иванов Иван Иванович',
    })
    public name?: string;

    @ValidateNested()
    @IsOptional()
    @IsArray()
    @Type(() => DropdownItemDto)
    @ApiProperty({
        required: false,
        name: 'posts',
        description: 'Список фильтрации пользователей по должности',
    })
    public posts?: DropdownItemDto[];

    @ValidateNested()
    @IsOptional()
    @IsArray()
    @Type(() => DropdownItemDto)
    @ApiProperty({
        required: false,
        name: 'branches',
        description: 'Список фильтрации пользователей по филиалу',
    })
    public branches?: DropdownItemDto[];

    @ValidateNested()
    @IsOptional()
    @IsArray()
    @Type(() => DropdownItemDto)
    @ApiProperty({
        required: false,
        name: 'courses',
        description: 'Список фильтрации пользователей по курсу',
    })
    public courses?: DropdownItemDto[];
}

export class DropdownItemDto {
    @IsString()
    @ApiProperty({ required: true, name: 'name' })
    name: string;

    @IsNumber()
    @IsPositive()
    @ApiProperty({ required: true, name: 'code' })
    code: number;
}
