import { getModelForClass } from '@typegoose/typegoose';
import { PurchaseItem } from '../entities';
import { AnyObject, RepoFindOptions } from '../types';

export interface PurchaseItemRepository {
  countDocument(query: AnyObject): Promise<number>;
  find(query: AnyObject, options?: RepoFindOptions): Promise<unknown>;
  findOne(
    query: AnyObject,
    options?: Pick<RepoFindOptions, 'select' | 'sort'>
  ): Promise<PurchaseItem>;
  create(data: PurchaseItem): Promise<PurchaseItem>;
  insertMany(data: PurchaseItem[]): Promise<PurchaseItem[]>;
  updateOne(query: AnyObject, update: AnyObject): Promise<boolean>;
}

export class PurchaseItemRepositoryImpl implements PurchaseItemRepository {
  private model = getModelForClass(PurchaseItem);

  async countDocument(query: AnyObject): Promise<number> {
    return await this.model.countDocuments(query);
  }

  async find(query: AnyObject, options?: RepoFindOptions): Promise<unknown> {
    const purchaseItem = this.model.find(query);
    const { limit, skip, sort, select, distinct } = options || {};
    if (limit && limit > 0) purchaseItem.limit(limit);
    if (skip && skip > 0) purchaseItem.skip(skip);
    if (sort?.length) purchaseItem.sort(sort);
    if (select?.length) purchaseItem.select(select);
    if (distinct?.length) purchaseItem.distinct(distinct);
    return await purchaseItem;
  }

  async findOne(
    query: AnyObject,
    options?: Pick<RepoFindOptions, 'select' | 'sort'>
  ): Promise<PurchaseItem> {
    const purchaseItem = this.model.findOne(query);
    const { select, sort } = options || {};
    if (select?.length) purchaseItem.select(select);
    if (sort?.length) purchaseItem.sort(sort);

    return await purchaseItem;
  }

  async create(data: PurchaseItem): Promise<PurchaseItem> {
    return await this.model.create(data);
  }

  async insertMany(data: PurchaseItem[]): Promise<PurchaseItem[]> {
    return await this.model.insertMany(data);
  }

  async updateOne(query: AnyObject, update: AnyObject): Promise<boolean> {
    const purchaseItem = await this.model.updateOne(query, {
      $set: update,
    });
    return purchaseItem?.matchedCount > 0 ? true : false;
  }
}
