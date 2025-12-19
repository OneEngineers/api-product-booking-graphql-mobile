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
import { USER_TRACK_CONTENT_TYPE } from '../constants';
import { convertObjectKeysFromSnakeToPascalCase } from '../utils';
import GraphQLJSON from 'graphql-type-json';

@modelOptions({
  options: { allowMixed: Severity.ALLOW },
  schemaOptions: {
    collection: 'user_trackings',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
})
@GqlType()
export class UserTracking {
  @GqlField(() => ID, { name: 'id' })
  readonly _id?: ObjectId;

  @GqlField(() => String, { name: 'sessionId' })
  @DbField({ required: true, unique: true, alias: 'sessionId' })
  session_id!: string;

  @GqlField(() => Int, { name: 'userId' })
  @DbField({ required: true, index: true, alias: 'userId' })
  user_id!: number;

  @GqlField(() => USER_TRACK_CONTENT_TYPE, { name: 'contentType' })
  @DbField({
    required: true,
    index: true,
    enum: USER_TRACK_CONTENT_TYPE,
    alias: 'contentType',
  })
  content_type!: string;

  @GqlField(() => String, { name: 'contentId' })
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
registerEnumType(USER_TRACK_CONTENT_TYPE, {
  name: 'UserTrackingContentType',
  description: 'The content type of user trackings',
});
