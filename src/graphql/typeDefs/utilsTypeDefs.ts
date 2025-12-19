import { Field, InputType, Int } from 'type-graphql';
import { ENV } from '../../constants';

@InputType()
export class PagerInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number = 1;

  @Field(() => Int, { defaultValue: ENV.ROW_LIMIT })
  limit: number = ENV.ROW_LIMIT;
}
