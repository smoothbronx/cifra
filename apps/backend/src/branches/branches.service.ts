import { BranchEntity } from '@/branches/branch.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BranchDto } from '@/branches/branch.dto';
import { Repository } from 'typeorm';
import {
    ConflictException,
    NotFoundException,
    Injectable,
} from '@nestjs/common';

@Injectable()
export class BranchesService {
    constructor(
        @InjectRepository(BranchEntity)
        private readonly branchesRepository: Repository<BranchEntity>,
    ) {}

    public getBranches(): Promise<BranchEntity[]> {
        return this.branchesRepository.find();
    }

    public getBranch(branchId: number): Promise<BranchEntity> {
        return this.getBranchByIdOrFall(branchId);
    }

    public async createBranch(branchDto: BranchDto): Promise<void> {
        const branch = await this.branchesRepository.findOneBy({
            name: branchDto.name,
        });
        if (branch) throw new ConflictException('Branch exists');

        const newBranch: BranchEntity =
            this.branchesRepository.create(branchDto);
        await this.branchesRepository.save(newBranch);
    }

    public async deleteBranch(branchId: number): Promise<void> {
        await this.getBranchByIdOrFall(branchId);
        await this.branchesRepository.delete({ id: branchId });
    }

    public async updateBranch(
        branchId: number,
        branchDto: BranchDto,
    ): Promise<void> {
        await this.getBranchByIdOrFall(branchId);
        await this.branchesRepository.update({ id: branchId }, branchDto);
    }

    private async getBranchByIdOrFall(id: number): Promise<BranchEntity> {
        const branch = await this.branchesRepository.findOneBy({
            id,
        });

        if (!branch) throw new NotFoundException('Branch not found');

        return branch;
    }
}
