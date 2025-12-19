import {
  Resolver,
  Query,
  Arg,
  Ctx,
  UseMiddleware,
  Mutation,
  FieldResolver,
  Root,
} from 'type-graphql';
import {
  listUserHistoryLogsAction,
  logUserHistoryAction,
} from '../../controllers';
import { controllerCallback, userMiddleware } from '../../middleware';
import { AppHeaderContext } from '../plugins/buildAppHeaderContext';
import {
  ListUserHistoryLog,
  HistoryLogQueryInput,
  LogHistoryInput,
  DataHistory,
} from '../typeDefs';
import { AnyObject } from '../../types';
import GraphQLJSON from 'graphql-type-json';
import { HistoryLog } from '../../entities';
import { getContentAttribute } from '../../utils';

@Resolver(HistoryLog)
export class HistoryLogResolver {
  @Query(() => ListUserHistoryLog)
  @UseMiddleware(userMiddleware)
  async listUserHistoryLogs(
    @Ctx() context: AppHeaderContext,
    @Arg('hash', { nullable: true }) hash: string,
    @Arg('signature', { nullable: true }) signature: string,
    @Arg('timestamp', { nullable: true }) timestamp: number,
    @Arg('input')
    input: HistoryLogQueryInput
  ): Promise<ListUserHistoryLog> {
    const data = { hash, signature, timestamp, input };

    return await controllerCallback<typeof data, ListUserHistoryLog>(
      listUserHistoryLogsAction,
      data,
      context.userContext?.user
    );
  }

  @Mutation(() => DataHistory, { nullable: true })
  @UseMiddleware(userMiddleware)
  async logUserHistory(
    @Ctx() context: AnyObject,
    @Arg('hash', { nullable: true }) hash: string,
    @Arg('signature', { nullable: true }) signature: string,
    @Arg('timestamp', { nullable: true }) timestamp: number,
    @Arg('input') input: LogHistoryInput
  ) {
    const data = { hash, signature, timestamp, input };
    return await controllerCallback(
      logUserHistoryAction,
      data,
      context.userContext?.user
    );
  }

  @FieldResolver(() => GraphQLJSON, { nullable: true })
  async contentAttribute(@Root() root: any): Promise<any> {
    const userHistory = root._doc as HistoryLog;
    const contentAttribute = await getContentAttribute(
      userHistory.content_type,
      userHistory.content_id
    );
    return contentAttribute;
  }
}
