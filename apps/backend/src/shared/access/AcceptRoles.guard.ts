import { UserEntity } from '@/users/user.entity';
import { Role } from '@/shared/enums/Role.enum';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import {
    ExecutionContext,
    CanActivate,
    Injectable,
    Inject,
} from '@nestjs/common';

@Injectable()
export class AcceptRolesGuard implements CanActivate {
    constructor(
        @Inject(Reflector)
        private readonly reflector: Reflector,
    ) {}

    public canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const { user } = context.switchToHttp().getRequest();
        const roles = this.reflector.get<Role[]>('roles', context.getHandler());
        return this.userHasAccessToRoute(user, roles);
    }

    private userHasAccessToRoute(user: UserEntity, roles?: Role[]): boolean {
        return roles ? user.role in roles : true;
    }
}
