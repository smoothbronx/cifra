import { InvalidJwtExceptionSchema } from '@/swagger/schemas/invalidJwtException.schema';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { AcceptRoles } from '@/shared/access/acceptRoles.decorator';
import { BranchesService } from '@/branches/branches.service';
import { BranchEntity } from '@/branches/branch.entity';
import { BranchDto } from '@/branches/branch.dto';
import { Role } from '@/shared/enums/Role.enum';
import {
    NotFoundException,
    ConflictException,
    ParseIntPipe,
    Controller,
    HttpCode,
    Inject,
    Delete,
    Param,
    Patch,
    Body,
    Post,
    Get,
} from '@nestjs/common';
import {
    ApiUnauthorizedResponse,
    ApiNoContentResponse,
    ApiCreatedResponse,
    ApiBearerAuth,
    ApiOkResponse,
    ApiHeader,
    ApiTags,
} from '@nestjs/swagger';

@ApiTags('branches')
@ApiHeader({
    name: 'Authorization',
    description: 'Bearer access token',
    required: true,
})
@ApiBearerAuth('AccessTokenAuth')
@ApiUnauthorizedResponse({
    description: 'Invalid access token',
    type: InvalidJwtExceptionSchema,
})
@Controller('/branches/')
export class BranchesController {
    constructor(
        @Inject(BranchesService)
        private readonly branchesService: BranchesService,
    ) {}

    @ApiOkResponse({
        description: 'Return the all branches',
        type: BranchDto,
        isArray: true,
    })
    @Get()
    public async getBranches(): Promise<BranchEntity[]> {
        return this.branchesService.getBranches();
    }

    @ApiOkResponse({
        description: 'Return the branch by his id',
        type: BranchDto,
    })
    @ApiException(() => new NotFoundException('Branch not found'))
    @Get('/:id/')
    public async getBranch(
        @Param('id', ParseIntPipe)
        branchId: number,
    ) {
        return this.branchesService.getBranch(branchId);
    }

    @ApiCreatedResponse({
        description: 'The branch creating was successful',
    })
    @ApiException(
        () => new ConflictException('Branch with current name exists'),
        {
            description: 'Branch with current name exists',
        },
    )
    @AcceptRoles(Role.ADMIN)
    @Post()
    @HttpCode(201)
    public async createBranch(@Body() branchDto: BranchDto): Promise<void> {
        return this.branchesService.createBranch(branchDto);
    }

    @ApiNoContentResponse({
        description: 'The branch deletion was successful',
    })
    @ApiException(() => new NotFoundException('Branch not found'), {
        description: 'Branch not found',
    })
    @AcceptRoles(Role.ADMIN)
    @Delete('/:id/')
    @HttpCode(204)
    public deleteBranch(
        @Param('id', ParseIntPipe) branchId: number,
    ): Promise<void> {
        return this.branchesService.deleteBranch(branchId);
    }

    @ApiNoContentResponse({
        description: 'The branch update was successful',
    })
    @ApiException(() => new NotFoundException('Branch not found'), {
        description: 'Branch not found',
    })
    @ApiException(() => new ConflictException('Branch exists'), {
        description: 'Another branch with current name exists',
    })
    @AcceptRoles(Role.ADMIN)
    @Patch('/:id/')
    @HttpCode(204)
    public updateBranch(
        @Param('id', ParseIntPipe) branchId: number,
        @Body() branchDto: BranchDto,
    ): Promise<void> {
        return this.branchesService.updateBranch(branchId, branchDto);
    }
}
