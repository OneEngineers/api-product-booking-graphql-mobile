import { Field, InputType, ObjectType } from 'type-graphql';
import { Booking, BookingItem } from '../../entities';
import { BOOKING_STATUS, CONTENT_TYPE } from '../../constants';
import { PagerInput } from './utilsTypeDefs';
import { PaginatedResponse, Pagination } from './paginationTypeDef';
import GraphQLJSON from 'graphql-type-json';
import { BookingDataResponse } from './bookingDataResponseTypeDefs';

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
export class BookingDetailWitBookingItem extends Booking {
  @Field(() => [BookingItemDetail], { nullable: true })
  items?: BookingItemDetail[];
}

@ObjectType()
export class BookingPaginatedData {
  @Field(() => [BookingDetailWitBookingItem])
  documents: BookingDetailWitBookingItem[];

  @Field(() => Pagination)
  pagination: Pagination;
}

@ObjectType()
export class UserBookingDataResponse {
  @Field(() => String)
  code: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => BookingPaginatedData, { nullable: true })
  data?: BookingPaginatedData;
}

@InputType()
export class UpdateBookingStatusInput {
  @Field()
  id!: string;

  @Field(() => BOOKING_STATUS)
  status!: BOOKING_STATUS;
}
