import { Injectable } from "@nestjs/common";
import { nanoid } from "nanoid";
import { ResponseBody, ResponseListBody } from "../../utils/response";
import { SliderParam } from "../dto/misc.dto";
import { SliderEntity } from "../entities/slider.entity";
import { SliderRepository } from "../repositories/slider.repository";

@Injectable()
export class SliderService {
  constructor(
    private sliderRepo: SliderRepository,
  ) {}

  async createSlider(param: SliderParam): Promise<ResponseBody<SliderEntity>> {
    let newSlider: SliderEntity = {
        id: nanoid(11),
        image: param.image,
        deleted_at: null
    }
    await this.sliderRepo.insert(newSlider)
    return new ResponseBody(newSlider)
  }

  async listSlider(): Promise<ResponseListBody<any>> {
      let sliders = await this.sliderRepo.find({ deleted_at: null })
      return new ResponseListBody(sliders)
  }

  async deleteSlider(id: string): Promise<ResponseBody<any>> {
      let slider = await this.sliderRepo.findOneOrFail(id)
      slider.deleted_at = new Date()
      await this.sliderRepo.save(slider)
      return new ResponseBody(null, "slider deleted") 
  }
}