import { getModelForClass } from '@typegoose/typegoose';
import { AnyObject, RepoFindOptions } from '../types';
import { UserReferrer } from '../entities';

export interface UserReferrerRepository {
  findOne(query: AnyObject): Promise<UserReferrer>;
  find(query: AnyObject, options?: RepoFindOptions): Promise<unknown>;
  create(data: UserReferrer): Promise<UserReferrer>;
  updateOne(query: AnyObject, update: AnyObject): Promise<boolean>;
  count(query: AnyObject): Promise<number>;
}

export class UserReferrerRepositoryImpl implements UserReferrerRepository {
  private model = getModelForClass(UserReferrer);

  async findOne(query: AnyObject): Promise<UserReferrer> {
    const userReferrer = await this.model.findOne(query);
    return userReferrer;
  }
  async create(data: UserReferrer): Promise<UserReferrer> {
    return await this.model.create(data);
  }
  async updateOne(query: AnyObject, update: AnyObject): Promise<boolean> {
    const userReferrer = await this.model.updateOne(query, {
      $set: update,
    });
    return userReferrer?.matchedCount > 0 ? true : false;
  }

  async count(query: AnyObject): Promise<number> {
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
}
