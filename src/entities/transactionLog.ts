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
import { PAYMENT_STATUS } from '../constants';

@modelOptions({
  options: { allowMixed: Severity.ALLOW },
  schemaOptions: {
    collection: 'transaction_logs',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
})
@GqlType('TransactionLogResponse')
export class TransactionLog {
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

  @GqlField(() => ID, { name: 'purchaseId' })
  @DbField({ required: true, alias: 'purchaseId' })
  purchase_id!: ObjectId;

  @GqlField(() => Float, { name: 'totalAmount' })
  @DbField({
    required: true,
    min: [0, 'Amount must be positive!'],
    alias: 'totalAmount',
  })
  total_amount!: number;

  @GqlField(() => PAYMENT_STATUS, { name: 'paymentStatus' })
  @DbField({
    required: true,
    enum: PAYMENT_STATUS,
    default: PAYMENT_STATUS.Pending,
    alias: 'paymentStatus',
  })
  payment_status!: string;

  @GqlField(() => String, { name: 'paymentServiceProvider', nullable: true })
  @DbField({
    alias: 'paymentServiceProvider',
  })
  payment_service_provider?: string;

  @GqlField(() => String, { name: 'bankApv', nullable: true })
  @DbField({ default: null, maxlength: 191, alias: 'bankApv' })
  bank_apv?: string;

  @GqlField(() => GraphQLJSON, { nullable: true })
  @DbField({
    type: mongoose.Schema.Types.Mixed,
    default: null,
    alias: 'paymentProviderResponse',
  })
  pp_response?: AnyObject;

  @GqlField(() => GraphQLJSON, { nullable: true })
  @DbField({
    type: mongoose.Schema.Types.Mixed,
    default: null,
  })
  detail?: AnyObject;

  @GqlField(() => Float, { name: 'paidDate', nullable: true })
  @DbField({ alias: 'paidDate', default: null })
  paid_date?: number;

  @GqlField(() => String, { name: 'paymentType', nullable: true })
  @DbField({
    default: null,
    alias: 'paymentType',
  })
  payment_type?: string;

  @GqlField(() => Float, { name: 'createdAt' })
  @DbField({ required: true, alias: 'createdAt' })
  created_at!: number;

  @GqlField(() => Float, { name: 'updatedAt' })
  @DbField({ alias: 'updatedAt', default: 0 })
  updated_at?: number;
}

// register enum for graphql here
registerEnumType(PAYMENT_STATUS, {
  name: 'PaymentStatus',
  description: 'Status of payment',
});
