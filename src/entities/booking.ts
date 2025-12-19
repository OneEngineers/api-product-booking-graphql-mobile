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

  @GqlField(() => Float, { name: 'totalAmount' })
  @DbField({
    required: true,
    alias: 'totalAmount',
    min: [0, 'Total amount must be positive!'],
  })
  total_amount!: number;

  @GqlField(() => Float, { name: 'startDate', nullable: true })
  @DbField({ index: true, alias: 'startDate' })
  start_date: number;

  @GqlField(() => Float, { name: 'endDate', nullable: true })
  @DbField({ index: true, alias: 'endDate' })
  end_date: number;

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
}

// register enum for graphql here
registerEnumType(BOOKING_STATUS, {
  name: 'BookingStatus',
  description: 'The status of booking',
});
