import { ENV, RESPONSE_CODE, RESPONSE_STATUS } from '../constants';
import { UserReferrer } from '../entities/userReferrers';
import {
  ListUserReferrerFilterInput,
  ListUserReferrerResponse,
  PagerInput,
} from '../graphql/typeDefs';
import {
  UserReferrerRepository,
  UserReferrerRepositoryImpl,
} from '../repositories';
import { AnyObject, RepoFindOptions } from '../types';
import { pagination } from '../utils';

export class UserReferrerService {
  private userReferrerRepository: UserReferrerRepository =
    new UserReferrerRepositoryImpl();

  async getUserReferrer(query: AnyObject): Promise<UserReferrer | null> {
    return await this.userReferrerRepository.findOne(query);
  }

  async getUserReferrerByMysabayUserId(
    mysabayUserId: number,
    referrerUserId: string,
    referrerId: number
  ): Promise<UserReferrer | null> {
    const query: { [index: string]: unknown } = {
      'referrer.user_id': referrerUserId,
      'referrer.referrer_id': referrerId,
      user_id: mysabayUserId,
    };

    return await this.userReferrerRepository.findOne(query);
  }

  async createUserReferrer(data: UserReferrer): Promise<UserReferrer> {
    return await this.userReferrerRepository.create(data);
  }

  async listUserReferrer(
    mysabayUserID: number,
    filter?: ListUserReferrerFilterInput,
    pager?: PagerInput
  ): Promise<ListUserReferrerResponse> {
    const options: RepoFindOptions = {};
    const query: { [index: string]: unknown } = {
      user_id: mysabayUserID,
    };

    if (filter?.platform) {
      query.platform = filter.platform;
    }

    if (filter?.campaignId) {
      query['referrer.campaign_id'] = filter.campaignId;
    }

    if (filter?.referrerId) {
      query['referrer.referrer_id'] = filter.referrerId;
    }

    if (filter?.userId) {
      query['referrer.user_id'] = filter.userId;
    }

    if (!pager?.page) pager = { ...pager, page: 1 };
    if (!pager?.limit || pager.limit > ENV.MAX_LIMIT) {
      pager.limit = ENV.ROW_LIMIT;
    }

    options.limit = pager.limit;
    options.skip = (pager.page - 1) * pager.limit;
    options.sort = [['created_at', -1]];

    const totalCount = await this.userReferrerRepository.count(query);
    const userReferrers = (await this.userReferrerRepository.find(
      query,
      options
    )) as UserReferrer[];

    const paginatedResults = pagination(
      userReferrers,
      totalCount,
      pager.page,
      pager.limit
    );

    return {
      code: RESPONSE_CODE.SUCCESS,
      status: RESPONSE_STATUS.SUCCESS,
      data: {
        documents: paginatedResults.documents,
        pagination: paginatedResults.pagination,
      },
    };
  }

  async updateUserReferrer(
    query: AnyObject,
    updateInfo: AnyObject
  ): Promise<boolean> {
    return await this.userReferrerRepository.updateOne(query, updateInfo);
  }
}
