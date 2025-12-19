import { Field, InputType, ObjectType } from 'type-graphql';
import { PurchaseItem } from '../../entities';
import { CONTENT_TYPE } from '../../constants';
import { DataResponse } from './dataResponseTypeDefs';

@ObjectType()
export class DataPurchaseItem extends DataResponse(
  PurchaseItem,
  'PurchaseItemData'
) {}

@InputType()
export class PurchaseItemInput {
  @Field(() => CONTENT_TYPE)
  contentType: CONTENT_TYPE;

  @Field(() => String)
  contentId: string;

  @Field(() => String)
  streamUrl?: string;
}
