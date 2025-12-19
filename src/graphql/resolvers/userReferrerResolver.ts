import {
  Resolver,
  Arg,
  Ctx,
  UseMiddleware,
  Mutation,
  Query,
} from 'type-graphql';
import {
  UserReferrerResponse,
  CreateUserReferrerInput,
  ListUserReferrerResponse,
  ListUserReferrerInput,
} from '../typeDefs';
import { controllerCallback, userMiddleware } from '../../middleware';
import { AppHeaderContext } from '../plugins/buildAppHeaderContext';
import {
  createUserReferrerAction,
  listUserReferrerAction,
} from '../../controllers';

@Resolver()
export class UserReferrerResolver {
  @Mutation(() => UserReferrerResponse, { nullable: true })
  @UseMiddleware(userMiddleware)
  async createUserReferrer(
    @Ctx() context: AppHeaderContext,
    @Arg('hash', { nullable: true }) hash: string,
    @Arg('signature', { nullable: true }) signature: string,
    @Arg('timestamp', { nullable: true }) timestamp: number,
    @Arg('input') input: CreateUserReferrerInput
  ) {
    const data = { hash, signature, timestamp, input };

    return await controllerCallback(
      createUserReferrerAction,
      data,
      context.userContext?.user
    );
  }

  @Query(() => ListUserReferrerResponse, { nullable: true })
  @UseMiddleware(userMiddleware)
  async listUserReferrer(
    @Ctx() context: AppHeaderContext,
    @Arg('hash', { nullable: true }) hash: string,
    @Arg('signature', { nullable: true }) signature: string,
    @Arg('timestamp', { nullable: true }) timestamp: number,
    @Arg('input') input: ListUserReferrerInput
  ) {
    const data = { hash, signature, timestamp, input };
    return await controllerCallback<typeof data, ListUserReferrerResponse>(
      listUserReferrerAction,
      data,
      context.userContext?.user
    );
  }
}
