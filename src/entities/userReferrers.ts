import { prop as DbField, Severity, modelOptions } from '@typegoose/typegoose';
import {
  Float,
  Field as GqlField,
  ObjectType as GqlType,
  ID,
  Int,
} from 'type-graphql';
import { AnyObject, ObjectId } from '../types';
import { convertObjectKeysFromSnakeToPascalCase } from '../utils';
import GraphQLJSON from 'graphql-type-json';

@GqlType()
export class Referrer {
  @GqlField(() => String, { name: 'referrerName' })
  @DbField({ required: true })
  referrer_name!: string;

  @GqlField(() => Int, { name: 'referrerId' })
  @DbField({ required: true, alias: 'referrerId' })
  referrer_id!: number;

  @GqlField(() => String, { name: 'userId' })
  @DbField({
    required: true,
    alias: 'userId',
  })
  user_id!: string;

  @GqlField(() => Int, { name: 'campaignId' })
  @DbField({
    required: true,
    alias: 'campaignId',
  })
  campaign_id!: number;

  @GqlField(() => GraphQLJSON, { nullable: true })
  @DbField({ default: null })
  reward?: AnyObject;
}

@modelOptions({
  options: { allowMixed: Severity.ALLOW },
  schemaOptions: {
    collection: 'user_referrers',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
})
@GqlType()
export class UserReferrer {
  @GqlField(() => ID, { name: 'id' })
  readonly _id?: ObjectId;

  @GqlField(() => Int, { name: 'userId' })
  @DbField({ required: true, index: true, alias: 'userId' })
  user_id!: number;

  @GqlField(() => Referrer, { name: 'referrer' })
  @DbField({
    required: true,
    _id: false,
  })
  referrer!: Referrer;

  @GqlField(() => String, { name: 'platform' })
  @DbField({ default: null })
  platform?: string;

  @GqlField(() => GraphQLJSON, { nullable: true })
  @DbField({
    transform: convertObjectKeysFromSnakeToPascalCase,
    default: null,
  })
  detail?: AnyObject;

  @GqlField(() => Float, { name: 'createdAt' })
  @DbField({ required: true, alias: 'createdAt' })
  created_at: number;

  @GqlField(() => Float, { name: 'updatedAt' })
  @DbField({ alias: 'updatedAt', default: 0 })
  updated_at?: number;
}
