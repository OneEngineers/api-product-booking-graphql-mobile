import { getModelForClass } from '@typegoose/typegoose';
import { Purchase } from '../entities';
import { AnyObject, RepoFindOptions } from '../types';

export interface PurchaseRepository {
  countDocument(query: AnyObject): Promise<number>;
  find(query: AnyObject, options?: RepoFindOptions): Promise<unknown>;
  findOne(query: AnyObject): Promise<Purchase>;
  create(data: Purchase): Promise<Purchase>;
  updateOne(query: AnyObject, update: AnyObject): Promise<Purchase>;
  findOneAndUpdate(
    query: AnyObject,
    update: AnyObject,
    options?: AnyObject
  ): Promise<Purchase>;
  listUserPurchase(query: AnyObject, options?: RepoFindOptions): Promise<any>;
}

export class PurchaseRepositoryImpl implements PurchaseRepository {
  private model = getModelForClass(Purchase);

  async countDocument(query: AnyObject): Promise<number> {
    return await this.model.countDocuments(query);
  }

  async find(query: AnyObject, options?: RepoFindOptions): Promise<unknown> {
    const purchase = this.model.find(query);
    const { limit, skip, sort, select, distinct } = options || {};
    if (limit && limit > 0) purchase.limit(limit);
    if (skip && skip > 0) purchase.skip(skip);
    if (sort?.length) purchase.sort(sort);
    if (select?.length) purchase.select(select);
    if (distinct?.length) purchase.distinct(distinct);
    return await purchase;
  }

  async findOne(query: AnyObject): Promise<Purchase> {
    const purchase = this.model.findOne(query);
    return purchase;
  }

  async create(data: Purchase): Promise<Purchase> {
    return await this.model.create(data);
  }

  async updateOne(query: AnyObject, update: AnyObject): Promise<Purchase> {
    const purchase = await this.model.findOneAndUpdate(
      query,
      {
        $set: update,
      },
      { new: true }
    );
    return purchase;
  }

  async listUserPurchase(
    query: AnyObject,
    options?: RepoFindOptions
  ): Promise<any> {
    const { limit, skip, sort } = options || {};
    const descSort: any = Object.fromEntries(sort);

    const purchaseMatch: AnyObject = {
      user_id: query.user_id,
    };
    // Conditionally add the status to the match condition
    if (query.status) {
      purchaseMatch.status = query.status;
    }

    const pipeline: any = [
      {
        $match: purchaseMatch,
      },
      {
        $lookup: {
          from: 'purchase_items',
          localField: '_id',
          foreignField: 'purchase_id',
          as: 'items',
        },
      },
    ];
    const itemsMatch: any = [];
    if (query.item_id) {
      itemsMatch.push({ 'items.item_id': query.item_id });
    }
    if (query.item_type) {
      itemsMatch.push({ 'items.item_type': query.item_type });
    }

    if (itemsMatch.length > 0) {
      pipeline.push({
        $match: {
          $and: itemsMatch,
        },
      });
    }
    pipeline.push({
      $facet: {
        totalCount: [{ $count: 'total' }],
        data: [{ $sort: descSort }, { $skip: skip }, { $limit: limit }],
      },
    });

    const result = await this.model.aggregate(pipeline);

    // Extracting totalCount and data
    const totalCount = result[0]?.totalCount[0]?.total || 0;
    const listPurchase = result[0]?.data || [];

    return { totalCount, listPurchase };
  }
  async findOneAndUpdate(
    query: AnyObject,
    update: AnyObject,
    options: AnyObject = {}
  ): Promise<Purchase> {
    const purchase = await this.model.findOneAndUpdate(
      query,
      {
        $set: update,
      },
      options
    );
    return purchase;
  }
}
