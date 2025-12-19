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
import { CONTENT_TYPE } from '../constants';

@modelOptions({
  options: { allowMixed: Severity.ALLOW },
  schemaOptions: {
    collection: 'booking_items',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
})
@GqlType()
export class BookingItem {
  @GqlField(() => ID, { name: 'id' })
  readonly _id?: ObjectId;

  @GqlField(() => Int, { name: 'userId' })
  @DbField({ required: true, index: true, alias: 'userId' })
  user_id!: number;

  @GqlField(() => ID, { name: 'bookingId' })
  @DbField({ required: true, index: true, alias: 'bookingId' })
  booking_id!: ObjectId;

  @GqlField(() => CONTENT_TYPE, { name: 'itemType' })
  @DbField({
    enum: CONTENT_TYPE,
    index: true,
    required: true,
    alias: 'itemType',
  })
  item_type!: string;

  @GqlField(() => String, { name: 'itemId' })
  @DbField({ index: true, required: true, alias: 'itemId' })
  item_id!: string;

  @GqlField(() => Int, { name: 'quantity' })
  @DbField({
    required: true,
    min: [0, 'Quantity must be positive!'],
  })
  quantity!: number;

  @GqlField(() => Float, { name: 'amount' })
  @DbField({
    required: true,
    min: [0, 'Amount must be positive!'],
  })
  amount!: number;

  @GqlField(() => Float, { name: 'expireDate' })
  @DbField({ index: true, default: 0, alias: 'expireDate' })
  expire_date?: number;

  @GqlField(() => Float, { name: 'createdAt' })
  @DbField({ required: true, alias: 'createdAt' })
  created_at!: number;

  @GqlField(() => Float, { name: 'updatedAt' })
  @DbField({ alias: 'updatedAt', default: 0 })
  updated_at?: number;
}

// register enum for graphql here
registerEnumType(CONTENT_TYPE, {
  name: 'ItemType',
  description: 'The item type of booking item',
});
