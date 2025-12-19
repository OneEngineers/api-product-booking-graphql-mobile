import moment from 'moment';
import { AnyObject } from '../types';
import {
  TransactionLogRepository,
  TransactionLogRepositoryImpl,
} from '../repositories/transactionLogRepository';
import { TransactionLog } from '../entities/transactionLog';

export class TransactionLogService {
  private transactionLogRepository: TransactionLogRepository =
    new TransactionLogRepositoryImpl();

  async getPurchaseTransactionLog(purchaseId: string): Promise<TransactionLog> {
    const query: { [index: string]: unknown } = {
      purchase_id: purchaseId,
    };
    return this.transactionLogRepository.findOne(query);
  }

  async getTransactionLog(query: any): Promise<TransactionLog> {
    return this.transactionLogRepository.findOne(query);
  }

  async createTransactionLog(
    transactionLog: TransactionLog
  ): Promise<TransactionLog> {
    return await this.transactionLogRepository.create(transactionLog);
  }

  async updateTransactionLog(
    query: any,
    data: AnyObject
  ): Promise<TransactionLog> {
    const update: { [index: string]: unknown } = {
      ...data,
      updated_at: moment.now(),
    };

    return await this.transactionLogRepository.updateOne(query, update);
  }
}
