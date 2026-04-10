import { ClassType, Field, ObjectType } from 'type-graphql';

export function BookingDataResponse<TItem extends object>(
  itemsField: ClassType<TItem>,
  responseObjectName: string
) {
  @ObjectType(responseObjectName)
  class BookingData {
    @Field(() => itemsField)
    document: TItem;
  }

  @ObjectType()
  abstract class BookingResponseClass {
    @Field(() => String)
    code: string;

    @Field(() => String, { nullable: true })
    status?: string;

    @Field(() => BookingData, { nullable: true })
    data?: BookingData;
  }

  return BookingResponseClass;
}
