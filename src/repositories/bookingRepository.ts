import { getModelForClass } from '@typegoose/typegoose';
import { Booking } from '../entities';
import { AnyObject, RepoFindOptions } from '../types';

export interface BookingRepository {
  countDocument(query: AnyObject): Promise<number>;
  find(query: AnyObject, options?: RepoFindOptions): Promise<unknown>;
  findOne(query: AnyObject): Promise<Booking>;
  create(data: Booking): Promise<Booking>;
  updateOne(query: AnyObject, update: AnyObject): Promise<Booking>;
  findOneAndUpdate(
    query: AnyObject,
    update: AnyObject,
    options?: AnyObject
  ): Promise<Booking>;
  listUserBooking(query: AnyObject, options?: RepoFindOptions): Promise<any>;
}

export class BookingRepositoryImpl implements BookingRepository {
  private model = getModelForClass(Booking);

  async countDocument(query: AnyObject): Promise<number> {
    return await this.model.countDocuments(query);
  }

  async find(query: AnyObject, options?: RepoFindOptions): Promise<unknown> {
    const booking = this.model.find(query);
    const { limit, skip, sort, select, distinct } = options || {};
    if (limit && limit > 0) booking.limit(limit);
    if (skip && skip > 0) booking.skip(skip);
    if (sort?.length) booking.sort(sort);
    if (select?.length) booking.select(select);
    if (distinct?.length) booking.distinct(distinct);
    return await booking;
  }

  async findOne(query: AnyObject): Promise<Booking> {
    const booking = this.model.findOne(query);
    return booking;
  }

  async create(data: Booking): Promise<Booking> {
    return await this.model.create(data);
  }

  async updateOne(query: AnyObject, update: AnyObject): Promise<Booking> {
    const booking = await this.model.findOneAndUpdate(
      query,
      {
        $set: update,
      },
      { new: true }
    );
    return booking;
  }

  async listUserBooking(
    query: AnyObject,
    options?: RepoFindOptions
  ): Promise<any> {
    const { limit, skip, sort } = options || {};
    const descSort: any = Object.fromEntries(sort);

    const bookingMatch: AnyObject = {
      user_id: query.user_id,
    };
    // Conditionally add the status to the match condition
    if (query.status) {
      bookingMatch.status = query.status;
    }

    const pipeline: any = [
      {
        $match: bookingMatch,
      },
      {
        $lookup: {
          from: 'booking_items',
          localField: '_id',
          foreignField: 'booking_id',
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
    const listBooking = result[0]?.data || [];

    return { totalCount, listBooking };
  }
  async findOneAndUpdate(
    query: AnyObject,
    update: AnyObject,
    options: AnyObject = {}
  ): Promise<Booking> {
    const booking = await this.model.findOneAndUpdate(
      query,
      {
        $set: update,
      },
      options
    );
    return booking;
  }
}
