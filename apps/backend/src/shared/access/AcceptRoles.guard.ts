import { ExecutionContext, CanActivate, Injectable } from '@nestjs/common';
import { UserEntity } from '@/users/user.entity';
import { Role } from '@/shared/enums/Role.enum';
import { Observable } from 'rxjs';

@Injectable()
export class AcceptRolesGuard implements CanActivate {
    public canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const { metadata, user } = context.switchToHttp().getRequest();
        return this.userHasAccessToRoute(user, metadata.roles);
    }

    private userHasAccessToRoute(user: UserEntity, roles?: Role[]): boolean {
        return roles ? user.role in roles : true;
    }
}
