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

    public getBranch(branchCode: number): Promise<BranchEntity> {
        return this.getBranchByIdOrFall(branchCode);
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

    public async insertBranches(...branches: string[]): Promise<void> {
        for (const branchName of branches) {
            const foundBranch = await this.branchesRepository.findOneBy({
                name: branchName,
            });
            if (foundBranch) continue;
            const newBranch = this.branchesRepository.create({
                name: branchName,
            });
            await this.branchesRepository.save(newBranch);
        }
    }

    public async deleteBranch(branchCode: number): Promise<void> {
        await this.getBranchByIdOrFall(branchCode);
        await this.branchesRepository.delete({ code: branchCode });
    }

    public async updateBranch(
        branchCode: number,
        branchDto: BranchDto,
    ): Promise<void> {
        await this.getBranchByIdOrFall(branchCode);
        await this.branchesRepository.update({ code: branchCode }, branchDto);
    }

    private async getBranchByIdOrFall(code: number): Promise<BranchEntity> {
        const branch = await this.branchesRepository.findOneBy({
            code,
        });

        if (!branch) throw new NotFoundException('Branch not found');

        return branch;
    }
}
