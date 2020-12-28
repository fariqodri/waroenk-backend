import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

import { SellerCategoryRepository } from "../../products/repositories/seller-category.repository";
import { SellerCategory } from "../../products/entities/seller-category.entity";
import { SellerAttributeRepository } from "../../users/repositories/seller.repository";
import { ChatProvider } from "../../chat/providers/chat.provider";

@Injectable()
export class NotificationService {
  constructor(
    private sellerCategoryRepo: SellerCategoryRepository,
    private sellerRepo: SellerAttributeRepository,
    private chatProvider: ChatProvider
  ) {}

  @Cron('0 0 10 * * *', { name: 'expiry_date_notification' })
  async handleCron() {
    const today = new Date()
    const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0)
    const endToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    const start6DayAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6, 0);
    const end6DayAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6, 23, 59, 59, 999);
    const sellerCategories = await this.sellerCategoryRepo.createQueryBuilder()
      .where(`expiry_date BETWEEN '${startToday.toISOString()}' AND '${endToday.toISOString()}'`)
      .getMany();
    for (const sellerCategory of sellerCategories) {
      await this.sendTextNotification(sellerCategory,
        `Kategori ${sellerCategory.category.name} anda sudah memasuki masa tenggang`);
    }
    const sellerCategories6DayAgo = await this.sellerCategoryRepo.createQueryBuilder()
    .where(`expiry_date BETWEEN '${start6DayAgo.toISOString()}' AND '${end6DayAgo.toISOString()}'`)
    .getMany();
    for (const sellerCategory of sellerCategories6DayAgo) {
      await this.sendTextNotification(sellerCategory,
        `Masa tenggang kategori ${sellerCategory.category.name} anda sudah hampir berakhir`);
    }
  }

  async sendTextNotification(sellerCategory: SellerCategory, text: string) {
    const seller = await this.sellerRepo.findOneOrFail(sellerCategory.seller.id, {
      relations: ['user']
    });
    const deviceToken = seller.user.device_token;
    if (deviceToken === undefined) {
      return;
    };
    const notificationBody = text;
    const chatData: any = {
      date: new Date(),
      type: 'text',
      text: notificationBody
    };
    this.chatProvider.sendToDevice(deviceToken, chatData, notificationBody, 'sistem');
  }
}