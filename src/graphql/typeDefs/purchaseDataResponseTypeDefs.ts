import { ClassType, Field, ObjectType } from 'type-graphql';

@ObjectType()
export class PaymentServiceProvider {
  @Field(() => String)
  code!: string;

  @Field(() => String)
  name!: string;
}

export function PurchaseDataResponse<TItem extends object>(
  itemsField: ClassType<TItem>,
  responseObjectName: string
) {
  @ObjectType(responseObjectName)
  class PurchasedData {
    @Field(() => itemsField)
    document: TItem;

    @Field(() => String, { nullable: true })
    paymentAddress: string;
  }

  @ObjectType()
  abstract class PurchaseResponseClass {
    @Field(() => String)
    code: string;

    @Field(() => String, { nullable: true })
    status?: string;

    @Field(() => PurchasedData, { nullable: true })
    data?: PurchasedData;
  }

  return PurchaseResponseClass;
}
