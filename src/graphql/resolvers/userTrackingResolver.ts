import { Resolver, Arg, Ctx, UseMiddleware, Mutation } from 'type-graphql';
import { logUserTrackingAction } from '../../controllers';
import { controllerCallback, userMiddleware } from '../../middleware';
import { AppHeaderContext } from '../plugins/buildAppHeaderContext';
import { LogUserTrackingInput, DataUserTracking } from '../typeDefs';

@Resolver()
export class UserTrackingResolver {
  @Mutation(() => DataUserTracking, { nullable: true })
  @UseMiddleware(userMiddleware)
  async logUserTracking(
    @Ctx() context: AppHeaderContext,
    @Arg('hash', { nullable: true }) hash: string,
    @Arg('signature', { nullable: true }) signature: string,
    @Arg('timestamp', { nullable: true }) timestamp: number,
    @Arg('input') input: LogUserTrackingInput
  ) {
    const data = { hash, signature, timestamp, input };
    return await controllerCallback(
      logUserTrackingAction,
      data,
      context.userContext?.user
    );
  }
}
