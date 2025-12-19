import moment from 'moment';
import { ENV, RESPONSE_CODE, RESPONSE_STATUS } from '../constants';
import { UserReferrer } from '../entities';
import {
  UserReferrerResponse,
  CreateUserReferrerInput,
} from '../graphql/typeDefs';
import { UserReferrerService } from '../services';
import { isJsonObjectWithinSizeLimit } from '../utils';
import { Referrer } from '../entities/userReferrers';

const createUserReferrerAction = async (
  data: {
    hash: string;
    signature: string;
    timestamp: number;
    input: CreateUserReferrerInput;
  },
  user: {
    mysabayUserID?: number;
  }
): Promise<UserReferrerResponse> => {
  const { input } = data;
  const userReferrerService = new UserReferrerService();

  if (user.mysabayUserID === input.referrer.referrerId) {
    return {
      code: RESPONSE_CODE.INVALID_INPUT,
      status: RESPONSE_STATUS.FAILED,
    };
  }

  /**
   * Validates the owner referrer to ensure that the user is not attempting to create a user referrer
   * where their `mysabayUserID` matches the `referrerID`. If such a condition is detected, an error
   * response is returned to prevent invalid data creation.
   */
  const userReferrer = await userReferrerService.getUserReferrer({
    'referrer.referrer_id': user.mysabayUserID,
  });
  if (userReferrer) {
    return {
      code: RESPONSE_CODE.INVALID_INPUT,
      status: RESPONSE_STATUS.FAILED,
    };
  }

  const isValidateSize = isJsonObjectWithinSizeLimit(
    input.detail,
    ENV.MAXIMUM_OBJECT_SIZE
  );
  if (!isValidateSize) {
    return {
      code: RESPONSE_CODE.INVALID_INPUT,
      status: RESPONSE_STATUS.FAILED,
      data: null,
    };
  }

  /**
   * Retrieves an existing user referrer based on the provided MySabay user ID,
   * referrer user ID, and referrer ID. This function interacts with the
   * `userReferrerService` to fetch the corresponding user referrer record.
   */
  const existingUserReferrer =
    await userReferrerService.getUserReferrerByMysabayUserId(
      user.mysabayUserID,
      input.referrer.userId,
      input.referrer.referrerId
    );

  if (existingUserReferrer) {
    return {
      code: RESPONSE_CODE.ALREADY_EXISTS,
      status: RESPONSE_STATUS.FAILED,
    };
  }

  const referrerData: Referrer = {
    referrer_name: input.referrer.referrerName,
    user_id: input.referrer.userId,
    campaign_id: input.referrer.campaignId,
    reward: input.referrer.reward,
    referrer_id: input.referrer.referrerId,
  };

  const newUserReferrerData: UserReferrer = {
    user_id: user.mysabayUserID,
    referrer: referrerData,
    platform: input.platform,
    detail: input.detail,
    created_at: moment.now(),
  };

  const newUserReferrer =
    await userReferrerService.createUserReferrer(newUserReferrerData);

  return {
    code: RESPONSE_CODE.SUCCESS,
    status: RESPONSE_STATUS.SUCCESS,
    data: newUserReferrer,
  };
};

export default createUserReferrerAction;
