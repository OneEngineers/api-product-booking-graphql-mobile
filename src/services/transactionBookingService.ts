import moment from 'moment';
import { AnyObject } from '../types';
import {
  TransactionBookingRepository,
  TransactionBookingRepositoryImpl,
} from '../repositories/transactionBookingRepository';
import { TransactionBooking } from '../entities';

export class TransactionBookingService {
  private transactionBookingRepository: TransactionBookingRepository =
    new TransactionBookingRepositoryImpl();

  async getPurchaseTransactionLog(
    booingId: string
  ): Promise<TransactionBooking> {
    const query: { [index: string]: unknown } = {
      purchase_id: booingId,
    };
    return this.transactionBookingRepository.findOne(query);
  }

  async getTransactionLog(query: any): Promise<TransactionBooking> {
    return this.transactionBookingRepository.findOne(query);
  }

  async createTransactionLog(
    transactionLog: TransactionBooking
  ): Promise<TransactionBooking> {
    return await this.transactionBookingRepository.create(transactionLog);
  }

  async updateTransactionLog(
    query: any,
    data: AnyObject
  ): Promise<TransactionBooking> {
    const update: { [index: string]: unknown } = {
      ...data,
      updated_at: moment.now(),
    };

    return await this.transactionBookingRepository.updateOne(query, update);
  }
}
