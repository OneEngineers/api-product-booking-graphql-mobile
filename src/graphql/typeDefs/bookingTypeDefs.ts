import { Field, InputType, ObjectType, Int } from 'type-graphql';
import { Booking, BookingItem } from '../../entities';
import { BOOKING_STATUS, CONTENT_TYPE } from '../../constants';
import { PagerInput } from './utilsTypeDefs';
import { PaginatedResponse, Pagination } from './paginationTypeDef';
import { BookingDataResponse } from './bookingDataResponseTypeDefs';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class DataBooking extends BookingDataResponse(Booking, 'BookingData') {}

@ObjectType('ListUserBookingResponse')
export class DataBookingWithPagination extends PaginatedResponse(
  Booking,
  'UserBookingWithPagination'
) {}
@ObjectType()
export class BookingItemDetail extends BookingItem {
  @Field(() => GraphQLJSON, { nullable: true })
  contentAttribute?: any;
}

@ObjectType()
export class BookingDetail extends Booking {
  @Field(() => [BookingItemDetail], { nullable: true })
  items?: BookingItemDetail[];
}

@ObjectType()
export class DataBookingDetail {
  @Field(() => String)
  code: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => BookingDetail, { nullable: true })
  data?: BookingDetail;
}

@InputType()
export class BookingInput {
  @Field(() => CONTENT_TYPE)
  itemType: CONTENT_TYPE;

  @Field(() => String)
  itemId: string;

  @Field(() => Number)
  quantity?: number;

  @Field(() => Number)
  bookingDay?: number;
}

@InputType()
export class ListUserBookingFilterInput {
  @Field(() => BOOKING_STATUS, { nullable: true })
  status?: BOOKING_STATUS;

  @Field(() => CONTENT_TYPE, { nullable: true })
  itemType?: CONTENT_TYPE;

  @Field(() => String, { nullable: true })
  itemId?: string;
}

@InputType()
export class BookingDetailInput {
  @Field(() => String)
  BookingId: string;
}

@InputType()
export class ListUserBookingInput {
  @Field(() => ListUserBookingFilterInput)
  filter: ListUserBookingFilterInput;

  @Field(() => PagerInput)
  pager?: PagerInput;
}

@ObjectType()
export class BookingDetailWitBokingItem extends Booking {
  @Field(() => [BookingItemDetail], { nullable: true })
  items?: BookingItemDetail[];
}

@ObjectType()
export class PaginatedBookingData {
  @Field(() => [BookingDetailWitBokingItem])
  documents: BookingDetailWitBokingItem[];

  @Field(() => Pagination)
  pagination: Pagination;
}
@InputType()
export class BookingInfoInput {
  @Field(() => String)
  transactionId: string;

  @Field(() => String)
  transactionHash: string;

  @Field(() => Number)
  amount: number;

  @Field(() => String)
  service_reffer: string;
}

@ObjectType()
export class UserBookingDataResponse {
  @Field(() => String)
  code: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => PaginatedBookingData, { nullable: true })
  data?: PaginatedBookingData;
}

@InputType()
export class UpdateBookingStatusInput {
  @Field()
  id!: string;

  @Field(() => BOOKING_STATUS)
  status!: BOOKING_STATUS;
}

@ObjectType()
export class BookingPushBackResponse {
  @Field(() => String)
  code: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  message?: string;
}

@InputType()
export class BookingPushBackInfo {
  @Field(() => String)
  transactionId: string;

  @Field(() => Int)
  status: number;

  @Field(() => String, { nullable: true })
  adp?: string;
}

@InputType()
export class AdminApproveBookingInput {
  @Field(() => String)
  bookingId!: string;

  @Field(() => String, { nullable: true })
  approvalNotes?: string;

  // @Field(() => String)
  // adminId!: string;
}

@InputType()
export class AdminRejectBookingInput {
  @Field(() => String)
  bookingId!: string;

  @Field(() => String)
  reason!: string;

  @Field(() => String)
  adminId!: string;
}

@InputType()
export class CompleteBookingInput {
  @Field(() => String)
  bookingId!: string;
}

@ObjectType()
export class AdminApprovalResponse {
  @Field(() => String)
  code: string;

  @Field(() => String)
  status: string;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => BookingDetail, { nullable: true })
  data?: BookingDetail;
}
