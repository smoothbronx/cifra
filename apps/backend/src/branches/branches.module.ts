import { BranchesController } from '@/branches/branches.controller';
import { forwardRef, Module, UseGuards } from '@nestjs/common';
import { BranchesService } from '@/branches/branches.service';
import { JwtStrategy } from '@/shared/jwt/jwt.strategy';
import { BranchEntity } from '@/branches/branch.entity';
import { JwtAuthGuard } from '@/shared/jwt/jwt.guard';
import { UsersModule } from '@/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';

const dynamicTypeOrmModule = TypeOrmModule.forFeature([BranchEntity]);

@UseGuards(JwtAuthGuard)
@Module({
    imports: [dynamicTypeOrmModule, forwardRef(() => UsersModule)],
    providers: [JwtStrategy, BranchesService],
    controllers: [BranchesController],
    exports: [BranchesService, dynamicTypeOrmModule],
})
export class BranchesModule {}
