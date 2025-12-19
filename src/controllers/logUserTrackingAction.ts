import moment from 'moment';
import { ENV, RESPONSE_CODE, RESPONSE_STATUS } from '../constants';
import { DataUserTracking, LogUserTrackingInput } from '../graphql/typeDefs';
import { UserTrackingService } from '../services';
import { debug, isJsonObjectWithinSizeLimit } from '../utils';
import { UserTracking } from '../entities';

const logUserTrackingAction = async (
  data: {
    hash: string;
    signature: string;
    timestamp: number;
    input: LogUserTrackingInput;
  },
  user: { mysabayUserID?: number }
): Promise<DataUserTracking> => {
  const { input } = data;

  // validate object size of user tracking details
  const isValidateSize = isJsonObjectWithinSizeLimit(
    input.details,
    ENV.MAXIMUM_OBJECT_SIZE
  );
  if (!isValidateSize) {
    return {
      code: RESPONSE_CODE.INVALID_INPUT,
      status: RESPONSE_STATUS.FAILED,
      data: null,
    };
  }

  // validate record if exist will replace else create
  const userTrackingService = new UserTrackingService();

  const userTracking = await userTrackingService.getUserTracking(
    input.sessionId,
    input.contentId,
    input.contentType,
    user.mysabayUserID
  );
  debug(`Exist user tracking ${userTracking}`);

  if (userTracking) {
    await userTrackingService.updateUserTracking(
      input.sessionId,
      input.contentId,
      input.contentType,
      user.mysabayUserID,
      input.details
    );
  } else {
    const newUserTracking: UserTracking = {
      session_id: input.sessionId,
      user_id: user.mysabayUserID,
      content_type: input.contentType,
      content_id: input.contentId,
      detail: input.details,
      created_at: moment.now(),
    };
    await userTrackingService.createUserTracking(newUserTracking);
  }
  return {
    code: RESPONSE_CODE.SUCCESS,
    status: RESPONSE_STATUS.SUCCESS,
    data: null,
  };
};

export default logUserTrackingAction;
