import { Field, InputType, ObjectType } from 'type-graphql';
import { BookingItem } from '../../entities';
import { CONTENT_TYPE } from '../../constants';
import { DataResponse } from './dataResponseTypeDefs';

@ObjectType()
export class DataBookingItem extends DataResponse(
  BookingItem,
  'BookingItemData'
) {}

@InputType()
export class BookingItemInput {
  @Field(() => CONTENT_TYPE)
  contentType: CONTENT_TYPE;

  @Field(() => String)
  contentId: string;
}
