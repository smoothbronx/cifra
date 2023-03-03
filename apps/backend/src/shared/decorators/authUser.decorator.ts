import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const AuthUser = createParamDecorator((data, request: Request) => {
    return request.user;
});
