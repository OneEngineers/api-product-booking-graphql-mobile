import { prop as DbField, Severity, modelOptions } from '@typegoose/typegoose';
import {
  Float,
  Field as GqlField,
  ObjectType as GqlType,
  ID,
  Int,
} from 'type-graphql';
import { AnyObject, ObjectId } from '../types';
import GraphQLJSON from 'graphql-type-json';
import { convertObjectKeysFromSnakeToPascalCase } from '../utils';

@modelOptions({
  options: { allowMixed: Severity.ALLOW },
  schemaOptions: {
    collection: 'preferences',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
})
@GqlType()
export class Preference {
  @GqlField(() => ID, { name: 'id' })
  readonly _id?: ObjectId;

  @GqlField(() => Int, { name: 'userId' })
  @DbField({ required: true, index: true, alias: 'userId' })
  user_id!: number;

  @GqlField(() => GraphQLJSON)
  @DbField({
    transform: convertObjectKeysFromSnakeToPascalCase,
    required: true,
  })
  preference!: AnyObject;

  @GqlField(() => Float, { name: 'createdAt' })
  @DbField({ required: true, alias: 'createdAt' })
  created_at!: number;

  @GqlField(() => Float, { name: 'updatedAt' })
  @DbField({ alias: 'updatedAt', default: 0 })
  updated_at?: number;
}
