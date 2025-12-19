import { ClassType, Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
export class Pagination {
  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  lastPage: number;

  @Field(() => Int)
  from: number;

  @Field(() => Int)
  to: number;

  @Field(() => Int)
  perPage: number;

  @Field(() => Int)
  total: number;
}

export function PaginatedResponse<TItem extends object>(
  itemsField: ClassType<TItem>,
  responseObjectName: string
) {
  @ObjectType(responseObjectName)
  class PaginatedData {
    @Field(() => [itemsField])
    documents: TItem[];

    @Field(() => Pagination)
    pagination: Pagination;
  }

  @ObjectType()
  abstract class PaginatedResponseClass {
    @Field(() => String)
    code: string;

    @Field(() => String, { nullable: true })
    status?: string;

    @Field(() => PaginatedData, { nullable: true })
    data?: PaginatedData;
  }

  return PaginatedResponseClass;
}
