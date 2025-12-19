import { Resolver, Query, Arg, Ctx, UseMiddleware } from 'type-graphql';
import { validatePurchaseContentAction } from '../../controllers';
import { controllerCallback, userMiddleware } from '../../middleware';
import { AppHeaderContext } from '../plugins/buildAppHeaderContext';
import { PurchaseItemInput, DataPurchaseItem } from '../typeDefs';

@Resolver()
export class PurchaseItemResolvers {
  @Query(() => DataPurchaseItem, { nullable: true })
  @UseMiddleware(userMiddleware)
  async validatePurchaseContent(
    @Ctx() context: AppHeaderContext,
    @Arg('hash', { nullable: true }) hash: string,
    @Arg('signature', { nullable: true }) signature: string,
    @Arg('timestamp', { nullable: true }) timestamp: number,
    @Arg('input') input: PurchaseItemInput
  ): Promise<DataPurchaseItem> {
    const data = { hash, signature, timestamp, input };

    return await controllerCallback(
      validatePurchaseContentAction,
      data,
      context.userContext?.user
    );
  }
}
