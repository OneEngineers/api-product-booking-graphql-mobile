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
  DataBookingDetail,
  BookingDetailInput,
  UpdateBookingStatusInput,
  BookingInput,
  DataBooking,
} from '../typeDefs';
import { AnyObject } from '../../types';
import {
  listUserBookingAction,
  getUserBookingByIdAction,
  UpdateUserBookingStatusAction,
  createUserBookingAction,
} from '../../controllers';
import { AppHeaderContext } from '../plugins/buildAppHeaderContext';

@Resolver(Booking)
export class BookingResolver {
  @Query(() => UserBookingDataResponse)
  @UseMiddleware(userMiddleware)
  async listUserBooking(
    @Ctx() context: AppHeaderContext,
    @Arg('input')
    input: ListUserBookingInput
  ): Promise<UserBookingDataResponse> {
    const data = { input };

    return await controllerCallback<typeof data, UserBookingDataResponse>(
      listUserBookingAction,
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

  @Mutation(() => DataBooking, { nullable: true })
  @UseMiddleware(userMiddleware)
  async createBooking(
    @Ctx() context: AnyObject,
    @Arg('input', () => [BookingInput]) input: BookingInput[]
  ) {
    const data = {
      input,
    };
    return await controllerCallback(
      createUserBookingAction,
      data,
      context.userContext?.user
    );
  }
}
