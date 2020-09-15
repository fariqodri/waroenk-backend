import { Injectable } from "@nestjs/common"
import { format } from 'date-fns'
import { Cron } from "@nestjs/schedule"
import { Between } from "typeorm"

import { SellerCategoryRepository } from "../../products/repositories/seller-category.repository"
import { SellerCategory } from "../../products/entities/seller-category.entity"
import { SellerAttributeRepository } from "../../users/repositories/seller.repository"
import { ChatService } from "../../chat/service/chat.service"

export const BetweenDate = (date1: Date, date2: Date) => 
  Between(format(date1, 'yyyy-MM-dd HH:mm:SS'), format(date2, 'yyyy-MM-dd HH:mm:SS'))

@Injectable()
export class NotificationService {
  constructor(
    private sellerCategoryRepo: SellerCategoryRepository,
    private sellerRepo: SellerAttributeRepository,
    private chatService: ChatService
  ) {}

  @Cron('0 0 10 * * *', { name: 'expiry_date_notification' })
  async handleCron() {
    let today = new Date()
    let startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0)
    let endToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
    let start6DayAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6, 0)
    let end6DayAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6, 23, 59, 59, 999)
    let sellerCategories = await this.sellerCategoryRepo.find({
      where: {
        expiry_date: BetweenDate(startToday, endToday)
      }
    })
    for (var sellerCategory of sellerCategories) {
      await this.sendTextNotification(sellerCategory,
        `Kategori ${sellerCategory.category.name} anda sudah memasuki masa tenggang`)
    }
    let sellerCategories6DayAgo = await this.sellerCategoryRepo.find({
      where: {
        expiry_date: BetweenDate(start6DayAgo, end6DayAgo)
      }
    })
    for (var sellerCategory of sellerCategories6DayAgo) {
      await this.sendTextNotification(sellerCategory,
        `Masa tenggang kategori ${sellerCategory.category.name} anda sudah hampir berakhir`)
    }
  }

  async sendTextNotification(sellerCategory: SellerCategory, text: string) {
    const seller = await this.sellerRepo.findOneOrFail(sellerCategory.seller.id, {
      relations: ['user']
    })
    const deviceToken = seller.user.device_token
    if (deviceToken === undefined) {
      return;
    }
    let notificationBody = text
    let chatData: any = {
      date: new Date(),
      type: 'text',
      text: notificationBody
    };
    this.chatService.sendNotificationToDevice(deviceToken, chatData, notificationBody, 'sistem')
  }
}