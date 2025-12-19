import { Field, InputType, ObjectType } from 'type-graphql';
import { PaginatedResponse } from './paginationTypeDef';
import { HistoryLog } from '../../entities';
import { CONTENT_TYPE } from '../../constants';
import GraphQLJSON from 'graphql-type-json';
import { AnyObject } from '../../types';
import { DataResponse } from './dataResponseTypeDefs';
import { PagerInput } from './utilsTypeDefs';

@ObjectType()
export class ListUserHistoryLog extends PaginatedResponse(
  HistoryLog,
  'UserHistoryLog'
) {}

@ObjectType()
export class DataHistory extends DataResponse(
  HistoryLog,
  'UserHistoryLogData'
) {}

@InputType()
export class FilterInput {
  @Field(() => CONTENT_TYPE)
  contentType: CONTENT_TYPE;

  @Field(() => String, { nullable: true })
  contentId?: string;
}

@InputType()
export class HistoryLogQueryInput {
  @Field(() => FilterInput)
  filter: FilterInput;

  @Field(() => PagerInput)
  pager?: PagerInput;
}

@InputType()
export class LogHistoryInput {
  @Field(() => CONTENT_TYPE)
  contentType: CONTENT_TYPE;

  @Field(() => String)
  contentId: string;

  @Field(() => GraphQLJSON)
  details: AnyObject;
}
