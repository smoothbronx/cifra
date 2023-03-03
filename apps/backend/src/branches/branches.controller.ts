import { BranchesService } from '@/branches/branches.service';
import { BranchEntity } from '@/branches/branch.entity';
import { BranchDto } from '@/branches/branch.dto';
import {
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

@Controller('/branches/')
export class BranchesController {
    constructor(
        @Inject(BranchesService)
        private readonly branchesService: BranchesService,
    ) {}

    @Get()
    public async getBranches(): Promise<BranchEntity[]> {
        return this.branchesService.getBranches();
    }

    @Get('/:id/')
    public async getBranch(
        @Param('id', ParseIntPipe)
        branchId: number,
    ) {
        return this.branchesService.getBranch(branchId);
    }

    @Post()
    @HttpCode(201)
    public async createBranch(@Body() branchDto: BranchDto): Promise<void> {
        return this.branchesService.createBranch(branchDto);
    }

    @Delete('/:id/')
    @HttpCode(204)
    public deleteBranch(
        @Param('id', ParseIntPipe) branchId: number,
    ): Promise<void> {
        return this.branchesService.deleteBranch(branchId);
    }

    @Patch('/:id/')
    @HttpCode(204)
    public updateBranch(
        @Param('id', ParseIntPipe) branchId: number,
        @Body() branchDto: BranchDto,
    ): Promise<void> {
        return this.branchesService.updateBranch(branchId, branchDto);
    }
}
