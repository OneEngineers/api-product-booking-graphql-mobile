import { prop as DbField, Severity, modelOptions } from '@typegoose/typegoose';
import {
  Float,
  Field as GqlField,
  ObjectType as GqlType,
  ID,
  Int,
  registerEnumType,
} from 'type-graphql';
import { AnyObject, ObjectId } from '../types';
import GraphQLJSON from 'graphql-type-json';
import { convertObjectKeysFromSnakeToPascalCase } from '../utils';
import { CONTENT_TYPE } from '../constants';

@modelOptions({
  options: { allowMixed: Severity.ALLOW },
  schemaOptions: {
    collection: 'history_logs',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
})
@GqlType('HistoryLogResponse')
export class HistoryLog {
  @GqlField(() => ID, { name: 'id' })
  readonly _id?: ObjectId;

  @GqlField(() => Int, { name: 'userId' })
  @DbField({ required: true, index: true, alias: 'userId' })
  user_id!: number;

  @GqlField(() => CONTENT_TYPE, { name: 'contentType' })
  @DbField({
    enum: CONTENT_TYPE,
    required: true,
    index: true,
    alias: 'contentType',
  })
  content_type!: string;

  @GqlField(() => ID, { name: 'contentId' })
  @DbField({ required: true, index: true, alias: 'contentId' })
  content_id!: string;

  @GqlField(() => GraphQLJSON, { nullable: true })
  @DbField({
    transform: convertObjectKeysFromSnakeToPascalCase,
    default: null,
  })
  detail?: AnyObject;

  @GqlField(() => Float, { name: 'createdAt' })
  @DbField({ required: true, alias: 'createdAt' })
  created_at!: number;

  @GqlField(() => Float, { name: 'updatedAt' })
  @DbField({ alias: 'updatedAt', default: 0 })
  updated_at?: number;
}

// register enum for graphql here
registerEnumType(CONTENT_TYPE, {
  name: 'ContentType',
  description: 'The content type of item',
});
