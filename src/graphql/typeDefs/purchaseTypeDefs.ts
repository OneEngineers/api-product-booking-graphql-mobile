import { Field, InputType, Int, ObjectType } from 'type-graphql';
import { Purchase, PurchaseItem } from '../../entities';
import { CONTENT_TYPE, PURCHASE_STATUS } from '../../constants';
import { PurchaseDataResponse } from './purchaseDataResponseTypeDefs';
import { PagerInput } from './utilsTypeDefs';
import { PaginatedResponse, Pagination } from './paginationTypeDef';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class DataPurchase extends PurchaseDataResponse(
  Purchase,
  'PurchaseData'
) {}

@ObjectType('ListUserOrderResponse')
export class DataPurchaseWithPagination extends PaginatedResponse(
  Purchase,
  'UserOrderWithPagination'
) {}
@ObjectType()
export class PurchaseItemDetail extends PurchaseItem {
  @Field(() => GraphQLJSON, { nullable: true })
  contentAttribute?: any;
}

@ObjectType()
export class PurchaseDetail extends Purchase {
  @Field(() => [PurchaseItemDetail], { nullable: true })
  items?: PurchaseItemDetail[];
}

@ObjectType()
export class DataPurchaseDetail {
  @Field(() => String)
  code: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => PurchaseDetail, { nullable: true })
  data?: PurchaseDetail;
}

@InputType()
export class PurchaseInput {
  @Field(() => CONTENT_TYPE)
  itemType: CONTENT_TYPE;

  @Field(() => String)
  itemId: string;

  @Field(() => Number)
  quantity?: number;
}

@InputType()
export class ListUserOrderFilterInput {
  @Field(() => PURCHASE_STATUS, { nullable: true })
  status?: PURCHASE_STATUS;

  @Field(() => CONTENT_TYPE, { nullable: true })
  itemType?: CONTENT_TYPE;

  @Field(() => String, { nullable: true })
  itemId?: string;
}

@InputType()
export class PurchaseDetailInput {
  @Field(() => String)
  PurchaseId: string;
}

@InputType()
export class ListUserOrderInput {
  @Field(() => ListUserOrderFilterInput)
  filter: ListUserOrderFilterInput;

  @Field(() => PagerInput)
  pager?: PagerInput;
}

@ObjectType()
export class PurchaseDetailWitPurchaseItem extends Purchase {
  @Field(() => [PurchaseItemDetail], { nullable: true })
  items?: PurchaseItemDetail[];
}

@ObjectType()
export class PaginatedData {
  @Field(() => [PurchaseDetailWitPurchaseItem])
  documents: PurchaseDetailWitPurchaseItem[];

  @Field(() => Pagination)
  pagination: Pagination;
}

@ObjectType()
export class UserPurchaseDataResponse {
  @Field(() => String)
  code: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => PaginatedData, { nullable: true })
  data?: PaginatedData;
}

@InputType()
export class UpdatePurchaseStatusInput {
  @Field()
  id!: string;

  @Field(() => PURCHASE_STATUS)
  status!: PURCHASE_STATUS;
}

@InputType()
export class PaymentServiceProviderInput {
  @Field(() => String)
  code: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  paymentOption: string;
}

@InputType()
export class PaymentInfoInput {
  @Field(() => String)
  transactionId: string;

  @Field(() => String)
  transactionHash: string;

  @Field(() => Number)
  amount: number;
}

@ObjectType()
export class PaymentPushBackData {
  @Field(() => String)
  transactionId: string;

  @Field(() => Int)
  status: number;

  @Field(() => String, { nullable: true })
  apv?: string;

  @Field(() => String, { nullable: true })
  message?: string;
}
@ObjectType()
export class PaymentPushBackResponse {
  @Field(() => String)
  code: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  message?: string;
}

@InputType()
export class PaymentPushBackInfo {
  @Field(() => String)
  transactionId: string;

  @Field(() => Int)
  status: number;

  @Field(() => String, { nullable: true })
  apv?: string;
}

@InputType()
export class PaymentPushBackInfoWingBank {
  @Field(() => String)
  referenceId: string;
}

@ObjectType()
export class PaymentPushBackResponseWingBank {
  @Field(() => String)
  code: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  message?: string;
}
