import { Injectable } from "@nestjs/common";
import { nanoid } from "nanoid";
import { ResponseBody, ResponseListBody } from "../../utils/response";
import { SponsorParam } from "../dto/misc.dto";
import { SponsorEntity } from "../entities/sponsor.entity";
import { SponsorRepository } from "../repositories/sponsor.repository";

@Injectable()
export class SponsorService {
  constructor(
    private sponsorRepo: SponsorRepository,
  ) {}

  async createSponsor(param: SponsorParam): Promise<ResponseBody<SponsorEntity>> {
    let newSponsor: SponsorEntity = {
        id: nanoid(11),
        image: param.image,
        type: param.type,
        deleted_at: null
    }
    await this.sponsorRepo.insert(newSponsor)
    return new ResponseBody(newSponsor)
  }

  async listSponsor(type: string): Promise<ResponseListBody<any>> {
      let sponsors = await this.sponsorRepo.find({ 
        where: {
          deleted_at: null,
          type: type 
        }
      })
      return new ResponseListBody(sponsors)
  }

  async deleteSponsor(id: string): Promise<ResponseBody<any>> {
      let sponsor = await this.sponsorRepo.findOneOrFail(id)
      sponsor.deleted_at = new Date()
      await this.sponsorRepo.save(sponsor)
      return new ResponseBody(null, "sponsor deleted") 
  }
}