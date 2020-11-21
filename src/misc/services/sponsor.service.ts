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
  ) { }

  async createSponsor(param: SponsorParam): Promise<ResponseBody<SponsorEntity>> {
    const images = param.image.split(',');
    const newSponsors = [];
    let size = 0;
    if (param.size) {
      size = param.size;
    }
    for (const image of images) {
      const newSponsor: SponsorEntity = {
        id: nanoid(11),
        image,
        type: param.type,
        size,
        deleted_at: null
      }
      newSponsors.push(newSponsor);
    }
    await this.sponsorRepo.insert(newSponsors);
    return new ResponseBody(newSponsors)
  }

  async listSponsor(type: string): Promise<ResponseListBody<any>> {
    const sponsors = await this.sponsorRepo.find({
      where: {
        deleted_at: null,
        type: type
      }
    })
    return new ResponseListBody(sponsors)
  }

  async editSponsor(id: string, param: SponsorParam): Promise<ResponseBody<any>> {
    const sponsor = await this.sponsorRepo.findOneOrFail(id)
    sponsor.image = param.image
    await this.sponsorRepo.save(sponsor)
    return new ResponseBody(null, "sponsor deleted")
  }

  async deleteSponsor(id: string): Promise<ResponseBody<any>> {
    const sponsor = await this.sponsorRepo.findOneOrFail(id)
    sponsor.deleted_at = new Date()
    await this.sponsorRepo.save(sponsor)
    return new ResponseBody(null, "sponsor deleted")
  }
}