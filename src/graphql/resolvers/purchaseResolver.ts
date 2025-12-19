import {
  Resolver,
  Arg,
  Ctx,
  UseMiddleware,
  Mutation,
  Query,
} from 'type-graphql';
import { controllerCallback, userMiddleware } from '../../middleware';
import { Purchase } from '../../entities';
import {
  DataPurchase,
  UserPurchaseDataResponse,
  ListUserOrderInput,
  PurchaseInput,
  DataPurchaseDetail,
  PurchaseDetailInput,
  UpdatePurchaseStatusInput,
  PaymentPushBackInfo,
  PaymentPushBackResponse,
  PaymentServiceProviderInput,
  PaymentInfoInput,
} from '../typeDefs';
import { AnyObject } from '../../types';
import {
  listUserOrderAction,
  userPlaceOrderAction,
  getUserOrderByIdAction,
  notifyApplePaymentAction,
  UpdateUserPurchaseStatusAction,
} from '../../controllers';
import { AppHeaderContext } from '../plugins/buildAppHeaderContext';
import onlinePaymentNotifyAction from '../../controllers/onlinePaymentNotifyAction';
@Resolver(Purchase)
export class PurchaseResolver {
  @Query(() => UserPurchaseDataResponse)
  @UseMiddleware(userMiddleware)
  async listUserOrders(
    @Ctx() context: AppHeaderContext,
    @Arg('hash', { nullable: true }) hash: string,
    @Arg('signature', { nullable: true }) signature: string,
    @Arg('timestamp', { nullable: true }) timestamp: number,
    @Arg('input')
    input: ListUserOrderInput
  ): Promise<UserPurchaseDataResponse> {
    const data = { hash, signature, timestamp, input };

    return await controllerCallback<typeof data, UserPurchaseDataResponse>(
      listUserOrderAction,
      data,
      context.userContext?.user
    );
  }

  @Mutation(() => DataPurchase, { nullable: true })
  @UseMiddleware(userMiddleware)
  async userPlaceOrder(
    @Ctx() context: AnyObject,
    @Arg('hash', { nullable: true }) hash: string,
    @Arg('signature', { nullable: true }) signature: string,
    @Arg('timestamp', { nullable: true }) timestamp: number,
    @Arg('appAccountToken', { nullable: true }) appAccountToken: string,
    @Arg('input', () => [PurchaseInput]) input: PurchaseInput[],
    @Arg('paymentServiceProvider', { nullable: true })
    paymentServiceProvider: PaymentServiceProviderInput,
    @Arg('paymentInfo', { nullable: true })
    paymentInfo: PaymentInfoInput
  ) {
    const data = {
      hash,
      signature,
      timestamp,
      input,
      appAccountToken,
      paymentServiceProvider,
      paymentInfo,
    };
    return await controllerCallback(
      userPlaceOrderAction,
      data,
      context.userContext?.user
    );
  }

  @Query(() => DataPurchaseDetail, { nullable: true })
  @UseMiddleware(userMiddleware)
  async getUserOrderById(
    @Ctx() context: AppHeaderContext,
    @Arg('hash', { nullable: true }) hash: string,
    @Arg('signature', { nullable: true }) signature: string,
    @Arg('timestamp', { nullable: true }) timestamp: number,
    @Arg('input') input: PurchaseDetailInput
  ): Promise<DataPurchaseDetail> {
    const data = { hash, signature, timestamp, input };

    return await controllerCallback(
      getUserOrderByIdAction,
      data,
      context.userContext?.user
    );
  }

  @Mutation(() => DataPurchaseDetail, { nullable: true })
  async notifyApplePayment(
    @Ctx() context: AppHeaderContext,
    @Arg('signedPayload') signedPayload: string
  ): Promise<DataPurchaseDetail> {
    return await controllerCallback(
      notifyApplePaymentAction,
      signedPayload,
      context.userContext?.user
    );
  }

  @Mutation(() => DataPurchaseDetail, { nullable: true })
  @UseMiddleware(userMiddleware)
  async updateUserPurchaseStatus(
    @Ctx() context: AppHeaderContext,
    @Arg('hash', { nullable: true }) hash: string,
    @Arg('signature', { nullable: true }) signature: string,
    @Arg('timestamp', { nullable: true }) timestamp: number,
    @Arg('input') input: UpdatePurchaseStatusInput
  ): Promise<DataPurchaseDetail> {
    const data = { hash, signature, timestamp, input };
    return await controllerCallback(
      UpdateUserPurchaseStatusAction,
      data,
      context.userContext?.user
    );
  }

  @Mutation(() => PaymentPushBackResponse, { nullable: true })
  async onlinePaymentNotify(
    @Arg('input') input: PaymentPushBackInfo
  ): Promise<PaymentPushBackResponse> {
    return await controllerCallback(onlinePaymentNotifyAction, input);
  }
}
