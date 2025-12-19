import { Field, InputType, ObjectType } from 'type-graphql';
import { UserTracking } from '../../entities';
import { USER_TRACK_CONTENT_TYPE } from '../../constants';
import GraphQLJSON from 'graphql-type-json';
import { AnyObject } from '../../types';
import { DataResponse } from './dataResponseTypeDefs';

@ObjectType()
export class DataUserTracking extends DataResponse(
  UserTracking,
  'UserTrackingData'
) {}

@InputType()
export class LogUserTrackingInput {
  @Field(() => String)
  sessionId: string;

  @Field(() => USER_TRACK_CONTENT_TYPE)
  contentType: USER_TRACK_CONTENT_TYPE;

  @Field(() => String)
  contentId: string;

  @Field(() => GraphQLJSON)
  details: AnyObject;
}
