import { UserEntity } from '@/users/user.entity';
import { Observable } from 'rxjs';
import { Request } from 'express';
import {
    ExecutionContext,
    NestInterceptor,
    CallHandler,
    Injectable,
} from '@nestjs/common';

@Injectable()
export class UserActivityInterceptor implements NestInterceptor {
    public async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        await this.updateUserLastEntry(request);
        return next.handle();
    }

    private async updateUserLastEntry(request: Request) {
        const user = request.user as UserEntity;
        if (!user) return;
        user.lastEntry = new Date();
        return user.save();
    }
}
