import { getModelForClass } from '@typegoose/typegoose';
import { AnyObject } from '../types';
import { TransactionLog } from '../entities/transactionLog';

export interface TransactionLogRepository {
  countDocument(query: AnyObject): Promise<number>;
  findOne(query: AnyObject): Promise<TransactionLog>;
  create(data: TransactionLog): Promise<TransactionLog>;
  updateOne(query: AnyObject, update: AnyObject): Promise<TransactionLog>;
}

export class TransactionLogRepositoryImpl implements TransactionLogRepository {
  private model = getModelForClass(TransactionLog);

  async countDocument(query: AnyObject): Promise<number> {
    return await this.model.countDocuments(query);
  }

  async findOne(query: AnyObject): Promise<TransactionLog> {
    const transactionLog = this.model.findOne(query);
    return transactionLog;
  }

  async create(data: TransactionLog): Promise<TransactionLog> {
    return await this.model.create(data);
  }

  async updateOne(
    query: AnyObject,
    update: AnyObject
  ): Promise<TransactionLog> {
    const transactionLog = await this.model.findOneAndUpdate(
      query,
      { $set: update },
      { new: true, runValidators: true }
    );

    return transactionLog;
  }
}
