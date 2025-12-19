import moment from 'moment';
import { BookingItem } from '../entities';
import { ObjectId, RepoFindOptions } from '../types';
import {
  BookingItemRepository,
  BookingItemRepositoryImpl,
} from '../repositories';

export class BookingItemService {
  private bookingItemRepository: BookingItemRepository =
    new BookingItemRepositoryImpl();

  async getUserBookingItem(
    contentId: string,
    contentType: string,
    mysabayUserId: number
  ): Promise<BookingItem> {
    const query: { [index: string]: unknown } = {
      user_id: mysabayUserId,
      item_id: contentId,
      item_type: contentType,
    };
    return await this.bookingItemRepository.findOne(query);
  }

  async createUserBookingItem(
    dataUserBookingItem: BookingItem
  ): Promise<BookingItem> {
    return await this.bookingItemRepository.create(dataUserBookingItem);
  }

  async createManyUserBookingItems(
    dataUserBookingItem: BookingItem[]
  ): Promise<BookingItem[]> {
    return await this.bookingItemRepository.insertMany(dataUserBookingItem);
  }

  async updateUserBookingItem(
    bookkingItemId: ObjectId,
    updateData: any
  ): Promise<boolean> {
    const query: { [index: string]: unknown } = {
      _id: bookkingItemId,
    };
    const update: { [index: string]: unknown } = {
      ...updateData,
      updated_at: moment.now(),
    };

    return await this.bookingItemRepository.updateOne(query, update);
  }

  async getBookingItem(
    itemType: string,
    itemId: string,
    userId: number
  ): Promise<BookingItem> {
    const query: { [index: string]: unknown } = {
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
    };

    const bookingItem = await this.bookingItemRepository.findOne(query, {
      sort: [['expire_date', -1]],
    });

    return bookingItem;
  }

  async getBookingItemByBookingId(
    userId: number,
    bookingId: ObjectId
  ): Promise<any[]> {
    const options: RepoFindOptions = {};
    const query: { [index: string]: unknown } = {
      user_id: userId,
      purchase_id: bookingId,
    };
    options.sort = [['created_at', -1]];
    const bookingItems = await this.bookingItemRepository.find(query, options);

    return bookingItems as BookingItem[];
  }
}
