import {
  Resolver,
  Arg,
  Ctx,
  UseMiddleware,
  Mutation,
  Query,
} from 'type-graphql';
import { controllerCallback, userMiddleware } from '../../middleware';
import { Booking } from '../../entities';
import {
  UserBookingDataResponse,
  ListUserBookingInput,
  DataBooking,
  BookingInput,
  DataBookingDetail,
  BookingDetailInput,
  UpdateBookingStatusInput,
} from '../typeDefs';
import { AnyObject } from '../../types';
import {
  userPlaceOrderAction,
  listUserBookingAction,
  getUserBookingByIdAction,
  UpdateUserBookingStatusAction,
} from '../../controllers';
import { AppHeaderContext } from '../plugins/buildAppHeaderContext';

@Resolver(Booking)
export class BookingResolver {
  @Query(() => UserBookingDataResponse)
  @UseMiddleware(userMiddleware)
  async listUserBooking(
    @Ctx() context: AppHeaderContext,
    @Arg('hash', { nullable: true }) hash: string,
    @Arg('signature', { nullable: true }) signature: string,
    @Arg('timestamp', { nullable: true }) timestamp: number,
    @Arg('input')
    input: ListUserBookingInput
  ): Promise<UserBookingDataResponse> {
    const data = { hash, signature, timestamp, input };

    return await controllerCallback<typeof data, UserBookingDataResponse>(
      listUserBookingAction,
      data,
      context.userContext?.user
    );
  }

  @Mutation(() => DataBooking, { nullable: true })
  @UseMiddleware(userMiddleware)
  async userBookings(
    @Ctx() context: AnyObject,
    @Arg('hash', { nullable: true }) hash: string,
    @Arg('signature', { nullable: true }) signature: string,
    @Arg('timestamp', { nullable: true }) timestamp: number,
    @Arg('appAccountToken', { nullable: true }) appAccountToken: string,
    @Arg('input', () => [BookingInput]) input: BookingInput[]
  ) {
    const data = {
      hash,
      signature,
      timestamp,
      input,
      appAccountToken,
    };
    return await controllerCallback(
      userPlaceOrderAction,
      data,
      context.userContext?.user
    );
  }

  @Query(() => DataBookingDetail, { nullable: true })
  @UseMiddleware(userMiddleware)
  async getUserBookingById(
    @Ctx() context: AppHeaderContext,
    @Arg('hash', { nullable: true }) hash: string,
    @Arg('signature', { nullable: true }) signature: string,
    @Arg('timestamp', { nullable: true }) timestamp: number,
    @Arg('input') input: BookingDetailInput
  ): Promise<DataBookingDetail> {
    const data = { hash, signature, timestamp, input };
    return await controllerCallback(
      getUserBookingByIdAction,
      data,
      context.userContext?.user
    );
  }

  @Mutation(() => DataBookingDetail, { nullable: true })
  @UseMiddleware(userMiddleware)
  async updateUserBookingStatus(
    @Ctx() context: AppHeaderContext,
    @Arg('hash', { nullable: true }) hash: string,
    @Arg('signature', { nullable: true }) signature: string,
    @Arg('timestamp', { nullable: true }) timestamp: number,
    @Arg('input') input: UpdateBookingStatusInput
  ): Promise<DataBookingDetail> {
    const data = { hash, signature, timestamp, input };
    return await controllerCallback(
      UpdateUserBookingStatusAction,
      data,
      context.userContext?.user
    );
  }
}
