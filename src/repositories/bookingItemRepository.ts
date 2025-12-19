import { getModelForClass } from '@typegoose/typegoose';
import { BookingItem } from '../entities';
import { AnyObject, RepoFindOptions } from '../types';

export interface BookingItemRepository {
  countDocument(query: AnyObject): Promise<number>;
  find(query: AnyObject, options?: RepoFindOptions): Promise<unknown>;
  findOne(
    query: AnyObject,
    options?: Pick<RepoFindOptions, 'select' | 'sort'>
  ): Promise<BookingItem>;
  create(data: BookingItem): Promise<BookingItem>;
  insertMany(data: BookingItem[]): Promise<BookingItem[]>;
  updateOne(query: AnyObject, update: AnyObject): Promise<boolean>;
}

export class BookingItemRepositoryImpl implements BookingItemRepository {
  private model = getModelForClass(BookingItem);

  async countDocument(query: AnyObject): Promise<number> {
    return await this.model.countDocuments(query);
  }

  async find(query: AnyObject, options?: RepoFindOptions): Promise<unknown> {
    const bookingItem = this.model.find(query);
    const { limit, skip, sort, select, distinct } = options || {};
    if (limit && limit > 0) bookingItem.limit(limit);
    if (skip && skip > 0) bookingItem.skip(skip);
    if (sort?.length) bookingItem.sort(sort);
    if (select?.length) bookingItem.select(select);
    if (distinct?.length) bookingItem.distinct(distinct);
    return await bookingItem;
  }

  async findOne(
    query: AnyObject,
    options?: Pick<RepoFindOptions, 'select' | 'sort'>
  ): Promise<BookingItem> {
    const bookingItem = this.model.findOne(query);
    const { select, sort } = options || {};
    if (select?.length) bookingItem.select(select);
    if (sort?.length) bookingItem.sort(sort);

    return await bookingItem;
  }

  async create(data: BookingItem): Promise<BookingItem> {
    return await this.model.create(data);
  }

  async insertMany(data: BookingItem[]): Promise<BookingItem[]> {
    return await this.model.insertMany(data);
  }

  async updateOne(query: AnyObject, update: AnyObject): Promise<boolean> {
    const bookingItem = await this.model.updateOne(query, {
      $set: update,
    });
    return bookingItem?.matchedCount > 0 ? true : false;
  }
}
