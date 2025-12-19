import moment from 'moment';
import { PurchaseRepository, PurchaseRepositoryImpl } from '../repositories';
import { Purchase } from '../entities';
import { Types } from 'mongoose';
import { AnyObject, ObjectId, RepoFindOptions } from '../types';
import {
  UserPurchaseDataResponse,
  ListUserOrderFilterInput,
  PagerInput,
} from '../graphql/typeDefs';
import { ENV, RESPONSE_CODE, RESPONSE_STATUS } from '../constants';
import { getContentAttribute, pagination } from '../utils';

export class PurchaseService {
  private purchaseRepository: PurchaseRepository = new PurchaseRepositoryImpl();

  async getUserPurchase(
    mysabayUserId: number,
    purchaseId: string
  ): Promise<any> {
    const query: { [index: string]: unknown } = {
      user_id: mysabayUserId,
      _id: new Types.ObjectId(purchaseId),
    };
    return await this.purchaseRepository.findOne(query);
  }

  async getPurchaseById(id: string): Promise<Purchase> {
    const query: { [index: string]: unknown } = {
      _id: new Types.ObjectId(id),
    };
    return this.purchaseRepository.findOne(query);
  }

  async createPurchase(dataUserTracking: Purchase): Promise<Purchase> {
    return await this.purchaseRepository.create(dataUserTracking);
  }

  async updateUserPurchase(
    purchaseId: ObjectId,
    updateData: AnyObject
  ): Promise<Purchase> {
    const query: { [index: string]: unknown } = {
      _id: purchaseId,
    };
    const update: { [index: string]: unknown } = {
      ...updateData,
      updated_at: moment.now(),
    };
    return await this.purchaseRepository.updateOne(query, update);
  }

  async updatePurchaseStatus(
    id: string,
    status: string,
    ssnTxnHash?: string,
    appleTest: boolean = false
  ): Promise<Purchase> {
    const query: { [index: string]: unknown } = {
      _id: new Types.ObjectId(id),
    };
    const update: { [index: string]: unknown } = {
      status: status,
      apple_test: appleTest,
      updated_at: moment.now(),
    };

    if (ssnTxnHash) {
      update.ssn_txn_hash = ssnTxnHash;
    }
    return await this.purchaseRepository.updateOne(query, update);
  }

  async listUserOrders(
    mysabayUserID: number,
    filter: ListUserOrderFilterInput,
    pager?: PagerInput
  ): Promise<UserPurchaseDataResponse> {
    const options: RepoFindOptions = {};
    const query: { [index: string]: unknown } = {
      user_id: mysabayUserID,
    };

    if (filter?.status) {
      query.status = filter.status;
    }

    if (filter?.itemType) {
      query.item_type = filter.itemType;
    }

    if (filter?.itemId) {
      query.item_id = filter.itemId;
    }

    if (!pager?.page) pager = { ...pager, page: 1 };
    if (!pager?.limit || pager.limit > ENV.MAX_LIMIT) {
      pager.limit = ENV.ROW_LIMIT;
    }
    options.limit = pager.limit;
    options.skip = (pager.page - 1) * pager.limit;
    options.sort = [['created_at', -1]];

    const { totalCount, listPurchase } =
      await this.purchaseRepository.listUserPurchase(query, options);

    /*
    loop purchase item inside loop purchase
    to get content attribute from cms to append into purchase item
    */
    for (const purchase of listPurchase) {
      for (const item of purchase.items) {
        const contentAttribute = await getContentAttribute(
          item.item_type,
          item.item_id
        );
        item.contentAttribute = contentAttribute;
      }
    }

    const totalUserOrderWithPagination = pagination(
      listPurchase as Purchase[],
      totalCount,
      pager?.page,
      pager?.limit
    );

    const userPurchaseData = {
      code: RESPONSE_CODE.SUCCESS,
      status: RESPONSE_STATUS.SUCCESS,
      data: {
        documents: totalUserOrderWithPagination.documents,
        pagination: totalUserOrderWithPagination.pagination,
      },
    };
    return userPurchaseData;
  }

  async getPurchaseByHash(hash: string): Promise<Purchase> {
    const query: { [index: string]: unknown } = {
      ssn_txn_hash: hash,
    };
    return this.purchaseRepository.findOne(query);
  }

  async getPurchaseByAppAccountToken(
    appAccountToken: string
  ): Promise<Purchase> {
    const query: { [index: string]: unknown } = {
      app_account_token: appAccountToken,
    };
    return this.purchaseRepository.findOne(query);
  }

  async updatePurchaseStatusByUser(
    id: string,
    userId: number,
    status: string
  ): Promise<Purchase> {
    const query: AnyObject = {
      _id: new Types.ObjectId(id),
      user_id: userId,
    };
    const update: AnyObject = {
      status,
      updated_at: moment.now(),
    };
    const options: AnyObject = {
      new: true,
    };

    return this.purchaseRepository.findOneAndUpdate(query, update, options);
  }
}
