import { ENV, RESPONSE_CODE, RESPONSE_STATUS } from '../constants';
import { DataHistory, LogHistoryInput } from '../graphql/typeDefs';
import { HistoryLogService } from '../services';
import { debug, isJsonObjectWithinSizeLimit } from '../utils';
import { HistoryLog } from '../entities';
import moment from 'moment';

const logUserHistoryAction = async (
  data: {
    hash: string;
    signature: string;
    timestamp: number;
    input: LogHistoryInput;
  },
  user: { mysabayUserID?: number }
): Promise<DataHistory> => {
  const { input } = data;

  // validate object size of history log details
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
  const historyLogService = new HistoryLogService();

  const userHistoryLog = await historyLogService.getUserHistoryLog(
    input.contentId,
    input.contentType,
    user.mysabayUserID
  );
  debug(`Exist user history log`, userHistoryLog);

  let dataUserHistoryLog = null;
  if (userHistoryLog) {
    const updateUserHistory = await historyLogService.updateUserHistoryLog(
      input.contentId,
      input.contentType,
      user.mysabayUserID,
      input.details
    );

    if (updateUserHistory) {
      dataUserHistoryLog = await historyLogService.getUserHistoryLog(
        input.contentId,
        input.contentType,
        user.mysabayUserID
      );
    }
  } else {
    const newUserHistoryLog: HistoryLog = {
      user_id: user.mysabayUserID,
      content_type: input.contentType,
      content_id: input.contentId,
      detail: input.details,
      created_at: moment.now(),
    };
    dataUserHistoryLog =
      await historyLogService.createUserHistoryLog(newUserHistoryLog);
  }

  return {
    code: RESPONSE_CODE.SUCCESS,
    status: RESPONSE_STATUS.SUCCESS,
    data: dataUserHistoryLog,
  };
};

export default logUserHistoryAction;
