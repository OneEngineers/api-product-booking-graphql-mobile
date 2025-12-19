import { Preference } from '../entities';
import { PreferenceService } from '../services';
import { PreferenceInput, DataPreference } from '../graphql/typeDefs';
import { ENV, RESPONSE_CODE, RESPONSE_STATUS } from '../constants';
import { debug, isJsonObjectWithinSizeLimit } from '../utils';

const updateUserPreferenceAction = async (
  queryOption: {
    hash: string;
    signature: string;
    timestamp: number;
    input: PreferenceInput;
  },
  user: { mysabayUserID?: number }
): Promise<DataPreference> => {
  // validate object size of user tracking details
  const isValidateSize = isJsonObjectWithinSizeLimit(
    queryOption.input.preference,
    ENV.MAXIMUM_OBJECT_SIZE
  );
  if (!isValidateSize) {
    return {
      code: RESPONSE_CODE.INVALID_INPUT,
      status: RESPONSE_STATUS.FAILED,
      data: null,
    };
  }

  const preferenceService = new PreferenceService();
  const getUserPreference = await preferenceService.getUserPreference(
    user.mysabayUserID
  );
  debug(`Exist user preference ${getUserPreference}`);

  let dataUserPreference = null;
  if (getUserPreference) {
    const updateUserPreference = await preferenceService.updateUserPreference(
      user.mysabayUserID,
      queryOption.input.preference
    );
    if (updateUserPreference) {
      dataUserPreference = await preferenceService.getUserPreference(
        user.mysabayUserID
      );
    }
  } else {
    const newUserPreference: Preference = {
      user_id: user.mysabayUserID,
      preference: queryOption.input.preference,
      created_at: Date.now(),
    };
    dataUserPreference =
      await preferenceService.createUserPreference(newUserPreference);
  }

  return {
    code: RESPONSE_CODE.SUCCESS,
    status: RESPONSE_STATUS.SUCCESS,
    data: dataUserPreference,
  };
};

export default updateUserPreferenceAction;
