import { getModelForClass } from '@typegoose/typegoose';
import { Preference } from '../entities';
import { AnyObject, RepoFindOptions } from '../types';

export interface PreferenceRepository {
  countDocument(query: AnyObject): Promise<number>;
  find(query: AnyObject, options?: RepoFindOptions): Promise<unknown>;
  findOne(query: AnyObject): Promise<Preference>;
  create(data: Preference): Promise<Preference>;
  updateOne(query: AnyObject, update: AnyObject): Promise<boolean>;
}

export class PreferenceRepositoryImpl implements PreferenceRepository {
  private model = getModelForClass(Preference);

  async countDocument(query: AnyObject): Promise<number> {
    return await this.model.countDocuments(query);
  }

  async find(query: AnyObject, options?: RepoFindOptions): Promise<unknown> {
    const preference = this.model.find(query);
    const { limit, skip, sort, select, distinct } = options || {};
    if (limit && limit > 0) preference.limit(limit);
    if (skip && skip > 0) preference.skip(skip);
    if (sort?.length) preference.sort(sort);
    if (select?.length) preference.select(select);
    if (distinct?.length) preference.distinct(distinct);
    return await preference;
  }

  async findOne(query: AnyObject): Promise<Preference> {
    const preference = this.model.findOne(query);
    return preference;
  }

  async create(data: Preference): Promise<Preference> {
    return await this.model.create(data);
  }

  async updateOne(query: AnyObject, update: AnyObject): Promise<boolean> {
    const preference = await this.model.updateOne(query, {
      $set: update,
    });
    return preference?.matchedCount > 0 ? true : false;
  }
}
