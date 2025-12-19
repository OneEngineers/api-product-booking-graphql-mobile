import moment from 'moment';
import {
  PreferenceRepository,
  PreferenceRepositoryImpl,
} from '../repositories';
import { Preference } from '../entities';
import { AnyObject } from '../types';

export class PreferenceService {
  private preferenceRepository: PreferenceRepository =
    new PreferenceRepositoryImpl();

  async getUserPreference(mysabayUserID: number): Promise<Preference> {
    return await this.preferenceRepository.findOne({
      user_id: mysabayUserID,
    });
  }

  async createUserPreference(
    dataUserPreference: Preference
  ): Promise<Preference> {
    return await this.preferenceRepository.create(dataUserPreference);
  }

  async updateUserPreference(
    mysabayUserID: number,
    preference: AnyObject
  ): Promise<boolean> {
    const query: { [index: string]: unknown } = {
      user_id: mysabayUserID,
    };

    const update: { [index: string]: unknown } = {
      preference,
      updated_at: moment.now(),
    };

    return await this.preferenceRepository.updateOne(query, update);
  }
}
