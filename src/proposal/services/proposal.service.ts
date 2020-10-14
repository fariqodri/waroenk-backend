import { Injectable } from '@nestjs/common';
import { ResponseBody, ResponseListBody } from '../../utils/response';
import { ProposalRepository } from '../repositories/proposal.repository';
import { ProposalDataRepository } from '../repositories/proposal-data.repository';
import { ProposalItemRepository } from '../repositories/proposal-item.repository';
import { ProposalQuery, CreateProposalParam, EditProposalParam } from '../dto/proposal.dto';
import { ProposalData } from '../entities/proposal-data.entity';
import { ProposalEntity } from '../entities/proposal.entity';
import { nanoid } from 'nanoid';
import { UserRepository } from '../../users/repositories/users.repository';

@Injectable()
export class ProposalService {
  constructor(
    private proposalRepo: ProposalRepository,
    private proposalDataRepo: ProposalDataRepository,
    private proposalItemRepo: ProposalItemRepository,
    private userRepo: UserRepository) {}

  async listProposalItems(type: string): Promise<ResponseListBody<any[]>> {
    let queryBuilder = this.proposalItemRepo.createQueryBuilder()
        .where('is_active IS TRUE')
        .andWhere('type = :type', { type: type })
    queryBuilder = queryBuilder.select(
      `id AS id,
      type AS type,
      item AS item`
    )
    let proposalItems = await queryBuilder.execute()
    return new ResponseListBody(proposalItems, 'ok', 1, proposalItems.length)
  }

  async listUserProposal(param: ProposalQuery, userId: string): Promise<ResponseListBody<any[]>> {
    const skippedItems = (param.page - 1) * param.limit;
    let queryBuilder = this.proposalRepo.createQueryBuilder()
        .where('is_active IS TRUE')
        .andWhere('userId = :userId', { userId: userId })
    if (param.type) {
      queryBuilder = queryBuilder.andWhere(
        'type = :type',
        { type: param.type },
      );
    }
    queryBuilder = queryBuilder
      .offset(skippedItems)
      .limit(param.limit)
      .orderBy('created_at', 'DESC')
      .select(
        `id AS id,
        type AS type,
        created_at AS created_at`
      )
    let proposals = await queryBuilder.execute()
    return new ResponseListBody(proposals, 'ok', Number(param.page), proposals.length)
  }

  async detailProposal(id: string): Promise<ResponseListBody<any>> {
    let proposalData = await this.proposalDataRepo.find({
      relations: ['proposal'],
      where: {
        is_active: true,
        proposal: id
      },
      order: { key: 'ASC' }
    })
    proposalData.forEach(function(p) {
      delete p.created_at
      delete p.proposal
      delete p.is_active
    })
    return new ResponseListBody(proposalData, 'ok', 1, proposalData.length)
  }

  async editProposal(param: EditProposalParam, id: string): Promise<ResponseBody<any>> {
    let proposalData = await this.proposalDataRepo.find({
      relations: ['proposal'],
      where: {
        is_active: true,
        proposal: id
      }
    })
    param.data.forEach(async function(pair) {
      for (let proposal of proposalData) {
        if (proposal.key == pair[0]) {
          proposal.value = pair[1]
          await this.proposalDataRepo.save(proposal)
        }
      }
    });
    return new ResponseBody(null)
  }

  async saveProposal(param: CreateProposalParam, userId: string): Promise<ResponseBody<any>> {
    const user = await this.userRepo.findOne(userId)
    let newProposal: ProposalEntity = {
      id: nanoid(11),
      user: user,
      type: param.type,
      created_at: new Date(),
      is_active: true
    }
    await this.proposalRepo.insert(newProposal)
    let newProposalDataList: ProposalData[] = []
    param.data.forEach(async function(pair) {
      let newProposalData: ProposalData = {
        id: nanoid(11),
        proposal: newProposal,
        key: pair[0],
        value: pair[1],
        created_at: new Date(),
        is_active: true
      }
      newProposalDataList.push(newProposalData)
    });
    await this.proposalDataRepo.insert(newProposalDataList)
    let response = {
      id: newProposal.id,
      userId: userId,
      type: param.type
    }
    return new ResponseBody(response)
  }
}
