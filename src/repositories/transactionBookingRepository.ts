import { getModelForClass } from '@typegoose/typegoose';
import { AnyObject } from '../types';
import { TransactionBooking } from '../entities';

export interface TransactionBookingRepository {
  countDocument(query: AnyObject): Promise<number>;
  findOne(query: AnyObject): Promise<TransactionBooking>;
  create(data: TransactionBooking): Promise<TransactionBooking>;
  updateOne(query: AnyObject, update: AnyObject): Promise<TransactionBooking>;
}

export class TransactionBookingRepositoryImpl
  implements TransactionBookingRepository
{
  private model = getModelForClass(TransactionBooking);

  async countDocument(query: AnyObject): Promise<number> {
    return await this.model.countDocuments(query);
  }

  async findOne(query: AnyObject): Promise<TransactionBooking> {
    const transactionLog = this.model.findOne(query);
    return transactionLog;
  }

  async create(data: TransactionBooking): Promise<TransactionBooking> {
    return await this.model.create(data);
  }

  async updateOne(
    query: AnyObject,
    update: AnyObject
  ): Promise<TransactionBooking> {
    const transactionLog = await this.model.findOneAndUpdate(
      query,
      { $set: update },
      { new: true, runValidators: true }
    );

    return transactionLog;
  }
}
