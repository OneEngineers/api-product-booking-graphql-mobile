import {
  Resolver,
  Mutation,
  Query,
  Arg,
  Ctx,
  UseMiddleware,
} from 'type-graphql';
import {
  updateUserPreferenceAction,
  getUserPreferenceAction,
} from '../../controllers';
import { controllerCallback, userMiddleware } from '../../middleware';
import { AppHeaderContext } from '../plugins/buildAppHeaderContext';
import { PreferenceInput, DataPreference } from '../../graphql/typeDefs';

@Resolver()
export class PreferenceResolvers {
  @Mutation(() => DataPreference, { nullable: true })
  @UseMiddleware(userMiddleware)
  async updateUserPreference(
    @Ctx() context: AppHeaderContext,
    @Arg('hash', { nullable: true }) hash: string,
    @Arg('signature', { nullable: true }) signature: string,
    @Arg('timestamp', { nullable: true }) timestamp: number,
    @Arg('input') input: PreferenceInput
  ): Promise<DataPreference> {
    const data = { hash, signature, timestamp, input };

    return await controllerCallback(
      updateUserPreferenceAction,
      data,
      context.userContext?.user
    );
  }

  @Query(() => DataPreference, { nullable: true })
  @UseMiddleware(userMiddleware)
  async getUserPreference(
    @Ctx() context: AppHeaderContext,
    @Arg('hash', { nullable: true }) hash: string,
    @Arg('signature', { nullable: true }) signature: string,
    @Arg('timestamp', { nullable: true }) timestamp: number
  ): Promise<DataPreference> {
    const data = { hash, signature, timestamp };

    return await controllerCallback(
      getUserPreferenceAction,
      data,
      context.userContext?.user
    );
  }
}
