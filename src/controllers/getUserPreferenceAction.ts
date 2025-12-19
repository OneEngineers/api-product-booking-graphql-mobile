import { PreferenceService } from '../services';
import { DataPreference } from '../graphql/typeDefs';
import { RESPONSE_CODE, RESPONSE_STATUS } from '../constants';

const getUserPreferenceAction = async (
  data: {
    hash: string;
    signature: string;
    timestamp: number;
  },
  user: {
    mysabayUserID?: number;
  }
): Promise<DataPreference> => {
  const preferenceService = new PreferenceService();
  const userPreference = await preferenceService.getUserPreference(
    user.mysabayUserID
  );

  return {
    code: RESPONSE_CODE.SUCCESS,
    status: RESPONSE_STATUS.SUCCESS,
    data: userPreference,
  };
};

export default getUserPreferenceAction;
