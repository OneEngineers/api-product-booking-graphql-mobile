import { prop as DbField, Severity, modelOptions } from '@typegoose/typegoose';
import {
  Float,
  Field as GqlField,
  ObjectType as GqlType,
  ID,
  Int,
  registerEnumType,
} from 'type-graphql';
import { ObjectId } from '../types';
import { BOOKING_STATUS } from '../constants';

@modelOptions({
  options: { allowMixed: Severity.ALLOW },
  schemaOptions: {
    collection: 'booking',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
})
@GqlType('UserBookingResponse')
export class Booking {
  @GqlField(() => ID, { name: 'id' })
  readonly _id?: ObjectId;

  @GqlField(() => Int, { name: 'userId' })
  @DbField({ required: true, index: true, alias: 'userId' })
  user_id!: number;

  @GqlField(() => Float, { name: 'bookingDate' })
  @DbField({ required: true, index: true, alias: 'bookingDate' })
  booking_date!: number;

  @GqlField(() => Float, { name: 'returnDate' })
  @DbField({ required: true, index: true, alias: 'returnDate' })
  return_date!: number;

  @GqlField(() => Float, { name: 'bookingDay' })
  @DbField({ required: true, index: true, alias: 'bookingDay' })
  booking_day!: number;

  @GqlField(() => Float, { name: 'totalAmount' })
  @DbField({
    alias: 'totalAmount',
    min: [0, 'Total amount must be positive!'],
  })
  total_amount: number;

  @GqlField(() => BOOKING_STATUS, { name: 'status' })
  @DbField({
    index: true,
    enum: BOOKING_STATUS,
    default: BOOKING_STATUS.Waiting,
  })
  status!: string;

  @GqlField(() => Float, { name: 'createdAt' })
  @DbField({ required: true, alias: 'createdAt' })
  created_at!: number;

  @GqlField(() => Float, { name: 'updatedAt' })
  @DbField({ alias: 'updatedAt', default: 0 })
  updated_at?: number;

  @GqlField(() => String, { name: 'adminApprovedBy', nullable: true })
  @DbField({ alias: 'adminApprovedBy' })
  admin_approved_by?: string;

  @GqlField(() => String, { name: 'adminApprovalNotes', nullable: true })
  @DbField({ alias: 'adminApprovalNotes' })
  admin_approval_notes?: string;

  @GqlField(() => Float, { name: 'approvedAt', nullable: true })
  @DbField({ alias: 'approvedAt' })
  approved_at?: number;

  @GqlField(() => String, { name: 'adminRejectedBy', nullable: true })
  @DbField({ alias: 'adminRejectedBy' })
  admin_rejected_by?: string;

  @GqlField(() => String, { name: 'rejectionReason', nullable: true })
  @DbField({ alias: 'rejectionReason' })
  rejection_reason?: string;

  @GqlField(() => Float, { name: 'rejectedAt', nullable: true })
  @DbField({ alias: 'rejectedAt' })
  rejected_at?: number;

  @GqlField(() => Float, { name: 'completedAt', nullable: true })
  @DbField({ alias: 'completedAt' })
  completed_at?: number;
}

// register enum for graphql here
registerEnumType(BOOKING_STATUS, {
  name: 'BookingStatus',
  description: 'The status of purchase',
});
