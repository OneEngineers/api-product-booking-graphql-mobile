import {
  prop as DbField,
  Severity,
  modelOptions,
  mongoose,
} from '@typegoose/typegoose';
import {
  Float,
  Field as GqlField,
  ObjectType as GqlType,
  ID,
  registerEnumType,
} from 'type-graphql';
import { AnyObject, ObjectId } from '../types';
import GraphQLJSON from 'graphql-type-json';
import { BOOKING_STATUS } from '../constants';

@modelOptions({
  options: { allowMixed: Severity.ALLOW },
  schemaOptions: {
    collection: 'transaction_booking',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
})
@GqlType('TransactionBookingResponse')
export class TransactionBooking {
  @GqlField(() => ID, { name: 'id' })
  readonly _id?: ObjectId;

  @GqlField(() => String, { name: 'transactionId' })
  @DbField({
    required: true,
    unique: true,
    alias: 'transactionId',
  })
  transaction_id!: string;

  @GqlField(() => String, { name: 'transactionHash' })
  @DbField({ required: true, unique: true, alias: 'transactionHash' })
  transaction_hash!: string;

  @GqlField(() => ID, { name: 'bookId' })
  @DbField({ required: true, alias: 'bookId' })
  book_id!: ObjectId;

  @GqlField(() => Float, { name: 'totalAmount' })
  @DbField({
    required: true,
    min: [0, 'Amount must be positive!'],
    alias: 'totalAmount',
  })
  total_amount!: number;

  @GqlField(() => BOOKING_STATUS, { name: 'bookingStatus' })
  @DbField({
    required: true,
    enum: BOOKING_STATUS,
    default: BOOKING_STATUS.Waiting,
    alias: 'bookingStatus',
  })
  booking_status!: string;

  @GqlField(() => GraphQLJSON, { nullable: true })
  @DbField({
    type: mongoose.Schema.Types.Mixed,
    default: null,
  })
  detail?: AnyObject;

  @GqlField(() => Float, { name: 'paidDate', nullable: true })
  @DbField({ alias: 'paidDate', default: null })
  paid_date?: number;

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
  description: 'Status of booking',
});
