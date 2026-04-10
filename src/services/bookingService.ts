import moment from 'moment';
import { BookingRepository, BookingRepositoryImpl } from '../repositories';
import { Booking } from '../entities';
import { Types } from 'mongoose';
import { AnyObject, ObjectId, RepoFindOptions } from '../types';
import {
  ENV,
  RESPONSE_CODE,
  RESPONSE_STATUS,
  BOOKING_STATUS,
} from '../constants';
import { getContentAttribute, pagination } from '../utils';
import {
  ListUserBookingFilterInput,
  UserBookingDataResponse,
} from '../graphql/typeDefs/bookingTypeDefs';
import { PagerInput } from '../graphql/typeDefs';
export class BookingService {
  private bookingRepository: BookingRepository = new BookingRepositoryImpl();

  async getUserBooking(mysabayUserId: number, bookingId: string): Promise<any> {
    const query: { [index: string]: unknown } = {
      user_id: mysabayUserId,
      _id: new Types.ObjectId(bookingId),
    };
    return await this.bookingRepository.findOne(query);
  }

  async getBookingById(id: string): Promise<Booking> {
    const query: { [index: string]: unknown } = {
      _id: new Types.ObjectId(id),
    };
    return this.bookingRepository.findOne(query);
  }

  async createBooking(dataUserTracking: Booking): Promise<Booking> {
    return await this.bookingRepository.create(dataUserTracking);
  }

  async updateUserBooking(
    bookingId: ObjectId,
    updateData: AnyObject
  ): Promise<Booking> {
    const query: { [index: string]: unknown } = {
      _id: bookingId,
    };
    const update: { [index: string]: unknown } = {
      ...updateData,
      updated_at: moment.now(),
    };
    return await this.bookingRepository.updateOne(query, update);
  }

  async updateBookingStatus(
    id: string,
    status: string,
    ssnTxnHash?: string,
    appleTest: boolean = false
  ): Promise<Booking> {
    const query: { [index: string]: unknown } = {
      _id: new Types.ObjectId(id),
    };
    const update: { [index: string]: unknown } = {
      status: status,
      apple_test: appleTest,
      updated_at: moment.now(),
    };

    if (ssnTxnHash) {
      update.ssn_txn_hash = ssnTxnHash;
    }
    return await this.bookingRepository.updateOne(query, update);
  }

  async listUserBooking(
    mysabayUserID: number,
    filter: ListUserBookingFilterInput,
    pager?: PagerInput
  ): Promise<UserBookingDataResponse> {
    const options: RepoFindOptions = {};
    const query: { [index: string]: unknown } = {
      user_id: mysabayUserID,
    };

    if (filter?.status) {
      query.status = filter.status;
    }

    if (filter?.itemType) {
      query.item_type = filter.itemType;
    }

    if (filter?.itemId) {
      query.item_id = filter.itemId;
    }

    if (!pager?.page) pager = { ...pager, page: 1 };
    if (!pager?.limit || pager.limit > ENV.MAX_LIMIT) {
      pager.limit = ENV.ROW_LIMIT;
    }
    options.limit = pager.limit;
    options.skip = (pager.page - 1) * pager.limit;
    options.sort = [['created_at', -1]];

    const { totalCount, listBooking } =
      await this.bookingRepository.listUserBooking(query, options);

    /*
    loop purchase item inside loop purchase
    to get content attribute from cms to append into purchase item
    */
    for (const booking of listBooking) {
      for (const item of booking.item) {
        const contentAttribute = await getContentAttribute(
          item.item_type,
          item.item_id
        );
        item.contentAttribute = contentAttribute;
      }
    }

    const totalUserOrderWithPagination = pagination(
      listBooking as Booking[],
      totalCount,
      pager?.page,
      pager?.limit
    );

    const userBookingData = {
      code: RESPONSE_CODE.SUCCESS,
      status: RESPONSE_STATUS.SUCCESS,
      data: {
        documents: totalUserOrderWithPagination.documents,
        pagination: totalUserOrderWithPagination.pagination,
      },
    };
    return userBookingData;
  }

  async getBookingByHash(hash: string): Promise<Booking> {
    const query: { [index: string]: unknown } = {
      ssn_txn_hash: hash,
    };
    return this.bookingRepository.findOne(query);
  }

  async getPurchaseByAppAccountToken(
    appAccountToken: string
  ): Promise<Booking> {
    const query: { [index: string]: unknown } = {
      app_account_token: appAccountToken,
    };
    return this.bookingRepository.findOne(query);
  }

  async updateBookingStatusByUser(
    id: string,
    userId: number,
    status: string
  ): Promise<Booking> {
    const query: AnyObject = {
      _id: new Types.ObjectId(id),
      user_id: userId,
    };
    const update: AnyObject = {
      status,
      updated_at: moment.now(),
    };
    const options: AnyObject = {
      new: true,
    };

    return this.bookingRepository.findOneAndUpdate(query, update, options);
  }

  async approveBookingByAdmin(
    bookingId: string,
    adminId: string,
    notes?: string
  ): Promise<Booking> {
    const query: { [index: string]: unknown } = {
      _id: new Types.ObjectId(bookingId),
      status: BOOKING_STATUS.Open,
    };

    const update: { [index: string]: unknown } = {
      status: BOOKING_STATUS.Approved,
      admin_approved_by: adminId,
      admin_approval_notes: notes || '',
      approved_at: moment.now(),
      updated_at: moment.now(),
    };

    return await this.bookingRepository.updateOne(query, update);
  }

  async rejectBookingByAdmin(
    bookingId: string,
    adminId: string,
    reason: string
  ): Promise<Booking> {
    const query: { [index: string]: unknown } = {
      _id: new Types.ObjectId(bookingId),
    };

    const update: { [index: string]: unknown } = {
      status: BOOKING_STATUS.Rejected,
      admin_rejected_by: adminId,
      rejection_reason: reason,
      rejected_at: moment.now(),
      updated_at: moment.now(),
    };

    return await this.bookingRepository.updateOne(query, update);
  }

  async completeBooking(bookingId: string): Promise<Booking> {
    const query: { [index: string]: unknown } = {
      _id: new Types.ObjectId(bookingId),
      status: BOOKING_STATUS.Approved,
    };

    const update: { [index: string]: unknown } = {
      status: BOOKING_STATUS.Completed,
      completed_at: moment.now(),
      updated_at: moment.now(),
    };

    return await this.bookingRepository.updateOne(query, update);
  }
}
