import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthUser = createParamDecorator(
    (data, context: ExecutionContext): string => {
        const request = context.switchToHttp().getRequest();
        return request.user;
    },
);
