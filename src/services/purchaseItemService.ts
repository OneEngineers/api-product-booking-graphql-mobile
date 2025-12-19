import moment from 'moment';
import { PurchaseItem } from '../entities';
import { ObjectId, RepoFindOptions } from '../types';
import {
  PurchaseItemRepository,
  PurchaseItemRepositoryImpl,
} from '../repositories';

export class PurchaseItemService {
  private purchaseItemRepository: PurchaseItemRepository =
    new PurchaseItemRepositoryImpl();

  async getUserPurchaseItem(
    contentId: string,
    contentType: string,
    mysabayUserId: number
  ): Promise<PurchaseItem> {
    const query: { [index: string]: unknown } = {
      user_id: mysabayUserId,
      item_id: contentId,
      item_type: contentType,
    };
    return await this.purchaseItemRepository.findOne(query);
  }

  async createUserPurchaseItem(
    dataUserPurchaseItem: PurchaseItem
  ): Promise<PurchaseItem> {
    return await this.purchaseItemRepository.create(dataUserPurchaseItem);
  }

  async createManyUserPurchaseItems(
    dataUserPurchaseItems: PurchaseItem[]
  ): Promise<PurchaseItem[]> {
    return await this.purchaseItemRepository.insertMany(dataUserPurchaseItems);
  }

  async updateUserPurchaseItem(
    purchaseItemId: ObjectId,
    updateData: any
  ): Promise<boolean> {
    const query: { [index: string]: unknown } = {
      _id: purchaseItemId,
    };
    const update: { [index: string]: unknown } = {
      ...updateData,
      updated_at: moment.now(),
    };

    return await this.purchaseItemRepository.updateOne(query, update);
  }

  async getPurchaseItem(
    itemType: string,
    itemId: string,
    userId: number
  ): Promise<PurchaseItem> {
    const query: { [index: string]: unknown } = {
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
    };

    const purchaseItem = await this.purchaseItemRepository.findOne(query, {
      sort: [['expire_date', -1]],
    });

    return purchaseItem;
  }

  async getPurchaseItemByPurchaseId(
    userId: number,
    purchaseId: ObjectId
  ): Promise<any[]> {
    const options: RepoFindOptions = {};
    const query: { [index: string]: unknown } = {
      user_id: userId,
      purchase_id: purchaseId,
    };
    options.sort = [['created_at', -1]];
    const purchaseItems = await this.purchaseItemRepository.find(
      query,
      options
    );

    return purchaseItems as PurchaseItem[];
  }
}
