import { UserEntity } from '@/users/user.entity';
import { Role } from '@/shared/enums/Role.enum';
import { Reflector } from '@nestjs/core';
import {
    ExecutionContext,
    CanActivate,
    Injectable,
    Inject,
    ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AcceptRolesGuard implements CanActivate {
    constructor(
        @Inject(Reflector)
        private readonly reflector: Reflector,
    ) {}

    public canActivate(context: ExecutionContext): boolean {
        const { user } = context.switchToHttp().getRequest();
        const roles = this.reflector.get<Role[]>('roles', context.getHandler());
        return this.userHasAccessToRoute(user, roles);
    }

    private userHasAccessToRoute(user: UserEntity, roles?: Role[]): boolean {
        if (!roles) return true;
        if (roles.includes(user.role)) return true;
        throw new ForbiddenException(
            'Insufficient permissions to perform this operation',
        );
    }
}
