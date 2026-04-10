import { Resolver, Arg, Ctx, UseMiddleware, Mutation } from 'type-graphql';
import { controllerCallback, userMiddleware } from '../../middleware';
import { Booking } from '../../entities';
import {
  adminApproveBookingAction,
  adminRejectBookingAction,
  completeBookingAction,
} from '../../controllers';
import { AppHeaderContext } from '../plugins/buildAppHeaderContext';
import {
  AdminApproveBookingInput,
  AdminRejectBookingInput,
  CompleteBookingInput,
  AdminApprovalResponse,
} from '../typeDefs/bookingTypeDefs';

@Resolver(Booking)
export class AdminBookingResolver {
  @Mutation(() => AdminApprovalResponse, { nullable: true })
  async adminApproveBooking(
    @Arg('input') input: AdminApproveBookingInput
  ): Promise<AdminApprovalResponse> {
    return await controllerCallback(adminApproveBookingAction, input);
  }

  @Mutation(() => AdminApprovalResponse, { nullable: true })
  async adminRejectBooking(
    @Ctx() context: AppHeaderContext,
    @Arg('input') input: AdminRejectBookingInput
  ): Promise<AdminApprovalResponse> {
    return await controllerCallback(
      adminRejectBookingAction,
      input,
      context.adminContext.admin || { adminId: input.adminId }
    );
  }

  @Mutation(() => AdminApprovalResponse, { nullable: true })
  @UseMiddleware(userMiddleware)
  async completeBooking(
    @Ctx() context: AppHeaderContext,
    @Arg('input') input: CompleteBookingInput
  ): Promise<AdminApprovalResponse> {
    return await controllerCallback(
      completeBookingAction,
      input,
      context.userContext?.user
    );
  }
}
