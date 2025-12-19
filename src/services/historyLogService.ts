import moment from 'moment';
import {
  HistoryLogRepository,
  HistoryLogRepositoryImpl,
} from '../repositories';
import { HistoryLog } from '../entities';
import { AnyObject, RepoFindOptions } from '../types';
import {
  FilterInput,
  PagerInput,
  ListUserHistoryLog,
} from '../graphql/typeDefs';
import { ENV, RESPONSE_CODE, RESPONSE_STATUS } from '../constants';
import { pagination } from '../utils';

export class HistoryLogService {
  private historyLogRepository: HistoryLogRepository =
    new HistoryLogRepositoryImpl();

  async listUserHistoryLogs(
    mysabayUserID: number,
    filter: FilterInput,
    pager?: PagerInput
  ): Promise<ListUserHistoryLog> {
    const options: RepoFindOptions = {};
    const query: { [index: string]: unknown } = {
      user_id: mysabayUserID,
      content_type: filter.contentType,
    };

    if (filter?.contentId) {
      query.content_id = filter.contentId;
    }

    if (!pager?.page) pager = { ...pager, page: 1 };
    if (!pager?.limit || pager.limit > ENV.MAX_LIMIT) {
      pager.limit = ENV.ROW_LIMIT;
    }
    options.limit = pager.limit;
    options.skip = (pager.page - 1) * pager.limit;
    options.sort = [['created_at', -1]];

    const userHistoryLog = await this.historyLogRepository.find(query, options);
    const totalHistoryLog =
      await this.historyLogRepository.countDocument(query);

    const historyLogWithPagination = pagination(
      userHistoryLog as HistoryLog[],
      totalHistoryLog,
      pager?.page,
      pager?.limit
    );

    const userHistoryLogData = {
      code: RESPONSE_CODE.SUCCESS,
      status: RESPONSE_STATUS.SUCCESS,
      data: {
        documents: historyLogWithPagination.documents,
        pagination: historyLogWithPagination.pagination,
      },
    };
    return userHistoryLogData;
  }

  async getUserHistoryLog(
    contentId: string,
    contentType: string,
    mysabayUserId: number
  ): Promise<HistoryLog> {
    const query: { [index: string]: unknown } = {
      user_id: mysabayUserId,
      content_id: contentId,
      content_type: contentType,
    };
    return this.historyLogRepository.findOne(query);
  }

  async createUserHistoryLog(
    dataUserHistoryLog: HistoryLog
  ): Promise<HistoryLog> {
    return await this.historyLogRepository.create(dataUserHistoryLog);
  }

  async updateUserHistoryLog(
    contentId: string,
    contentType: string,
    mysabayUserId: number,
    dataDetail: AnyObject
  ): Promise<boolean> {
    const query: { [index: string]: unknown } = {
      content_id: contentId,
      content_type: contentType,
      user_id: mysabayUserId,
    };
    const update: { [index: string]: unknown } = {
      detail: dataDetail,
      updated_at: moment.now(),
    };

    return await this.historyLogRepository.updateOne(query, update);
  }
}
