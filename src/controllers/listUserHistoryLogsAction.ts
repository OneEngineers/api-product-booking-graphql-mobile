import { HistoryLogQueryInput, ListUserHistoryLog } from '../graphql/typeDefs';
import { HistoryLogService } from '../services';

const listUserHistoryLogsAction = async (
  queryOption: {
    hash: string;
    signature: string;
    timestamp: number;
    input: HistoryLogQueryInput;
  },
  user: { mysabayUserID?: number }
): Promise<ListUserHistoryLog> => {
  const historyLogService = new HistoryLogService();
  return await historyLogService.listUserHistoryLogs(
    user.mysabayUserID,
    queryOption.input?.filter,
    queryOption.input?.pager
  );
};

export default listUserHistoryLogsAction;
