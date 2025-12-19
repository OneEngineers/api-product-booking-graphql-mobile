import { Resolver, Query, Arg, UseMiddleware } from 'type-graphql';
import { controllerCallback } from '../../middleware';
import getTransactionLogAction from '../../controllers/getTransactionLogAction';
import { TransactionLog } from '../../entities/transactionLog';
import { TransactionLogRes } from '../typeDefs/transactionLogTypeDefs';
import authMicroServiceMiddleware from '../../middleware/authMicroServiceMiddleware';

@Resolver(TransactionLog)
export class TransactionLogResolver {
  @Query(() => TransactionLogRes)
  @UseMiddleware(authMicroServiceMiddleware)
  async getTransactionLog(
    @Arg('transactionId')
    transactionId: string,
    @Arg('purchaseId', { nullable: true })
    purchaseId?: string,
    @Arg('transactionHash', { nullable: true })
    transactionHash?: string
  ): Promise<TransactionLogRes> {
    const data = { transactionHash, transactionId, purchaseId };
    return await controllerCallback<typeof data, TransactionLogRes>(
      getTransactionLogAction,
      data
    );
  }
}
