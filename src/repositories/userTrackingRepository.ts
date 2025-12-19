import { getModelForClass } from '@typegoose/typegoose';
import { UserTracking } from '../entities';
import { AnyObject } from '../types';

export interface UserTrackingRepository {
  findOne(query: AnyObject): Promise<UserTracking>;
  create(data: UserTracking): Promise<UserTracking>;
  updateOne(query: AnyObject, update: AnyObject): Promise<boolean>;
}

export class UserTrackingRepositoryImpl implements UserTrackingRepository {
  private model = getModelForClass(UserTracking);

  async findOne(query: AnyObject): Promise<UserTracking> {
    const userTracking = this.model.findOne(query);
    return userTracking;
  }

  async create(data: UserTracking): Promise<UserTracking> {
    return await this.model.create(data);
  }

  async updateOne(query: AnyObject, update: AnyObject): Promise<boolean> {
    const userTracking = await this.model.updateOne(query, {
      $set: update,
    });
    return userTracking?.matchedCount > 0 ? true : false;
  }
}
