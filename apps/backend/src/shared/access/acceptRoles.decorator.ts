import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AcceptRolesGuard } from '@/shared/access/AcceptRoles.guard';
import { Role } from '@/shared/enums/Role.enum';

export function AcceptRoles(...roles: Role[]) {
    return applyDecorators(
        SetMetadata('roles', roles),
        UseGuards(AcceptRolesGuard),
    );
}
