import { getModelForClass } from '@typegoose/typegoose';
import { HistoryLog } from '../entities';
import { AnyObject, RepoFindOptions } from '../types';

export interface HistoryLogRepository {
  countDocument(query: AnyObject): Promise<number>;
  find(query: AnyObject, options?: RepoFindOptions): Promise<unknown>;
  findOne(query: AnyObject): Promise<HistoryLog>;
  create(data: HistoryLog): Promise<HistoryLog>;
  updateOne(query: AnyObject, update: AnyObject): Promise<boolean>;
}

export class HistoryLogRepositoryImpl implements HistoryLogRepository {
  private model = getModelForClass(HistoryLog);

  async countDocument(query: AnyObject): Promise<number> {
    return await this.model.countDocuments(query);
  }

  async find(query: AnyObject, options?: RepoFindOptions): Promise<unknown> {
    const historyLog = this.model.find(query);
    const { limit, skip, sort, select, distinct } = options || {};
    if (limit && limit > 0) historyLog.limit(limit);
    if (skip && skip > 0) historyLog.skip(skip);
    if (sort?.length) historyLog.sort(sort);
    if (select?.length) historyLog.select(select);
    if (distinct?.length) historyLog.distinct(distinct);
    return await historyLog;
  }

  async findOne(query: AnyObject): Promise<HistoryLog> {
    const historyLog = this.model.findOne(query);
    return historyLog;
  }

  async create(data: HistoryLog): Promise<HistoryLog> {
    return await this.model.create(data);
  }

  async updateOne(query: AnyObject, update: AnyObject): Promise<boolean> {
    const historyLog = await this.model.updateOne(query, {
      $set: update,
    });
    return historyLog?.matchedCount > 0 ? true : false;
  }
}
