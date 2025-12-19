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
import { PURCHASE_STATUS } from '../constants';

@modelOptions({
  options: { allowMixed: Severity.ALLOW },
  schemaOptions: {
    collection: 'purchases',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
})
@GqlType()
export class PaymentServiceProvider {
  @GqlField(() => String)
  @DbField({ type: String, required: true })
  code!: string;

  @GqlField(() => String)
  @DbField({ type: String, required: true })
  name!: string;

  @GqlField(() => String, { nullable: true })
  @DbField({ type: String, default: null })
  paymentOption?: string;
}

@GqlType('UserOrderResponse')
export class Purchase {
  @GqlField(() => ID, { name: 'id' })
  readonly _id?: ObjectId;

  @GqlField(() => Int, { name: 'userId' })
  @DbField({ required: true, index: true, alias: 'userId' })
  user_id!: number;

  @GqlField(() => Float, { name: 'orderDate' })
  @DbField({ required: true, index: true, alias: 'orderDate' })
  order_date!: number;

  @GqlField(() => String, { name: 'appAccountToken', nullable: true })
  @DbField({ index: true, alias: 'appAccountToken' })
  app_account_token!: string;

  @GqlField(() => PaymentServiceProvider, { name: 'paymentServiceProvider' })
  @DbField({ required: true, _id: false })
  payment_service_provider: PaymentServiceProvider;

  @GqlField(() => String, { name: 'currencyCode' })
  @DbField({ required: true, alias: 'currencyCode' })
  currency_code!: string;

  @GqlField(() => Float, { name: 'totalAmount' })
  @DbField({
    required: true,
    alias: 'totalAmount',
    min: [0, 'Total amount must be positive!'],
  })
  total_amount!: number;

  @GqlField(() => String, { name: 'ssnTxnHash' })
  @DbField({ unique: true, required: true, alias: 'ssnTxnHash' })
  ssn_txn_hash!: string;

  @GqlField(() => PURCHASE_STATUS, { name: 'status' })
  @DbField({
    index: true,
    enum: PURCHASE_STATUS,
    default: PURCHASE_STATUS.Open,
  })
  status!: string;

  @GqlField(() => Boolean, { name: 'appleTest' })
  @DbField({ alias: 'appleTest', default: false })
  apple_test?: boolean;

  @GqlField(() => Float, { name: 'createdAt' })
  @DbField({ required: true, alias: 'createdAt' })
  created_at!: number;

  @GqlField(() => Float, { name: 'updatedAt' })
  @DbField({ alias: 'updatedAt', default: 0 })
  updated_at?: number;
}

// register enum for graphql here
registerEnumType(PURCHASE_STATUS, {
  name: 'PurchaseStatus',
  description: 'The status of purchase',
});
