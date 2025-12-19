import { ClassType, Field, ObjectType } from 'type-graphql';

export function DataResponse<TItem extends object>(
  itemsField: ClassType<TItem>,
  responseObjectName: string
) {
  @ObjectType(responseObjectName)
  abstract class DataResponseClass {
    @Field(() => String)
    code: string;

    @Field(() => String, { nullable: true })
    status?: string;

    @Field(() => itemsField, { nullable: true })
    data?: TItem;
  }

  return DataResponseClass;
}
