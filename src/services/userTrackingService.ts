import moment from 'moment';
import {
  UserTrackingRepository,
  UserTrackingRepositoryImpl,
} from '../repositories';
import { UserTracking } from '../entities';
import { AnyObject } from '../types';

export class UserTrackingService {
  private userTrackingRepository: UserTrackingRepository =
    new UserTrackingRepositoryImpl();

  async getUserTracking(
    sessionId: string,
    contentId: string,
    contentType: string,
    mysabayUserId: number
  ): Promise<UserTracking> {
    const query: { [index: string]: unknown } = {
      session_id: sessionId,
      content_id: contentId,
      content_type: contentType,
      user_id: mysabayUserId,
    };
    return this.userTrackingRepository.findOne(query);
  }

  async createUserTracking(
    dataUserTracking: UserTracking
  ): Promise<UserTracking> {
    return await this.userTrackingRepository.create(dataUserTracking);
  }

  async updateUserTracking(
    sessionId: string,
    contentId: string,
    contentType: string,
    mysabayUserId: number,
    dataDetail: AnyObject
  ): Promise<boolean> {
    const query: { [index: string]: unknown } = {
      session_id: sessionId,
      content_id: contentId,
      content_type: contentType,
      user_id: mysabayUserId,
    };
    const update: { [index: string]: unknown } = {
      detail: dataDetail,
      updated_at: moment.now(),
    };
    return await this.userTrackingRepository.updateOne(query, update);
  }
}
