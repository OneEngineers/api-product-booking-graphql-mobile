import { Field, InputType, Int, ObjectType } from 'type-graphql';
import { UserReferrer } from '../../entities';
import { DataResponse } from './dataResponseTypeDefs';
import GraphQLJSON from 'graphql-type-json';
import { AnyObject } from '../../types';
import { PaginatedResponse, Pagination } from './paginationTypeDef';
import { PagerInput } from './utilsTypeDefs';

@ObjectType()
export class UserReferrerResponse extends DataResponse(
  UserReferrer,
  'UserReferrerData'
) {}

@ObjectType('ListUserReferrerResponse')
export class ListUserReferrerResponse extends PaginatedResponse(
  UserReferrer,
  'UserReferrerWithPagination'
) {}

@InputType()
class ReferrerInput {
  @Field(() => String)
  referrerName!: string;

  @Field(() => Int)
  referrerId!: number;

  @Field(() => String)
  userId!: string;

  @Field(() => Int)
  campaignId!: number;

  @Field(() => GraphQLJSON, { nullable: true })
  reward?: AnyObject;
}

@InputType()
export class CreateUserReferrerInput {
  @Field(() => ReferrerInput)
  referrer!: ReferrerInput;

  @Field(() => String)
  platform!: string;

  @Field(() => GraphQLJSON, { nullable: true })
  detail?: AnyObject;
}

@InputType()
export class ListUserReferrerFilterInput {
  @Field(() => String, { nullable: true })
  userId?: string;

  @Field(() => String, { nullable: true })
  platform?: string;

  @Field(() => Int, { nullable: true })
  referrerId?: number;

  @Field(() => Number, { nullable: true })
  campaignId?: number;
}

@InputType()
export class ListUserReferrerInput {
  @Field(() => ListUserReferrerFilterInput)
  filter: ListUserReferrerFilterInput;

  @Field(() => PagerInput)
  pager?: PagerInput;
}

@ObjectType()
export class UserReferrerPagination {
  @Field(() => [UserReferrerResponse])
  documents: UserReferrerResponse[];

  @Field(() => Pagination)
  pagination: Pagination;
}

@ObjectType()
export class ListUserReferrer {
  @Field(() => String)
  code: string;

  @Field(() => String)
  status?: string;

  @Field(() => UserReferrerPagination)
  data?: UserReferrerPagination;
}
