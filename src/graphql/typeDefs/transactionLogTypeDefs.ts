import { Field, ObjectType } from 'type-graphql';
import { TransactionLog } from '../../entities/transactionLog';

@ObjectType()
export class TransactionLogRes {
  @Field(() => String)
  code: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => TransactionLog, { nullable: true })
  data?: TransactionLog;
}
