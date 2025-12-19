import { debug } from 'console';
import { PurchaseItemService, PurchaseService } from '../services';
import { PurchaseItemInput, DataPurchaseItem } from '../graphql/typeDefs';
import {
  CONTENT_TYPE,
  ENV,
  PURCHASE_STATUS,
  RESPONSE_CODE,
  RESPONSE_STATUS,
} from '../constants';
import { getContentFromCMS, getRedisCache, setRedisCache } from '../utils';
import moment from 'moment';

const validatePurchaseContentAction = async (
  queryOption: {
    hash: string;
    signature: string;
    timestamp: number;
    input: PurchaseItemInput;
  },
  user: { mysabayUserID?: number }
): Promise<DataPurchaseItem> => {
  const purchaseItemService = new PurchaseItemService();
  const purchaseService = new PurchaseService();

  let additionalFields = '';
  if (queryOption.input.contentType === CONTENT_TYPE.Movies) {
    additionalFields = `
    Price
    ExpiredDate
    episodes{
      data{
        attributes{
          Video
        }
      }
    }
  `;
  } else if (queryOption.input.contentType === CONTENT_TYPE.Book) {
    additionalFields = `Price`;
  }
  const getContentKey = `cms:content:${queryOption.input.contentType.toLowerCase()}:${queryOption.input.contentId}`;
  let getCMSContent = await getRedisCache(getContentKey);
  if (!getCMSContent) {
    getCMSContent = await getContentFromCMS(
      queryOption.input.contentType,
      queryOption.input.contentId,
      additionalFields
    );
    if (getCMSContent) {
      await setRedisCache(getContentKey, getCMSContent, ENV.CACHED_EXPIRE);
    }
  }

  debug(`CMS content: `, getCMSContent);

  // check content url with stream url
  if (queryOption.input.contentType === CONTENT_TYPE.Movies) {
    // sample movie url: https://fsgw.sabay.com/reality-stone-dev/Avengers_endgame_f56c73e570.mp4
    const movieUrl: string = getCMSContent.episodes.data[0].attributes.Video;
    const contentMovieName = movieUrl.split('/').pop();

    // sample stream url: /video-chunks/Avengers_endgame_f56c73e570.mp4/index.m3u8
    const streamMovieName = queryOption.input.streamUrl.split('/')[2];
    if (contentMovieName !== streamMovieName) {
      debug(
        `Stream movie name: ${streamMovieName} and content movie name :${contentMovieName} is not match`
      );
      return {
        code: RESPONSE_CODE.INVALID_INPUT,
        status: RESPONSE_STATUS.FAILED,
      };
    }
  }

  if (getCMSContent?.ExpiredDate !== undefined) {
    // check expired date from cms
    if (getCMSContent.ExpiredDate !== 0) {
      const expiredDate = moment(getCMSContent.ExpiredDate).valueOf();
      if (expiredDate < moment.now()) {
        debug(`Content is expired: ${getCMSContent.id} `);
        return {
          code: RESPONSE_CODE.INVALID_INPUT,
          status: RESPONSE_STATUS.FAILED,
        };
      }
    }
  }

  // check price from cms
  if (getCMSContent?.Price <= 0) {
    return {
      code: RESPONSE_CODE.SUCCESS,
      status: RESPONSE_STATUS.SUCCESS,
    };
  }

  const getPurchaseItemKey = `${queryOption.input.contentType.toLowerCase()}:${queryOption.input.contentId}:${user.mysabayUserID}`;
  let getPurchaseItem = await getRedisCache(getPurchaseItemKey);

  if (!getPurchaseItem) {
    getPurchaseItem = await purchaseItemService.getPurchaseItem(
      queryOption.input.contentType,
      queryOption.input.contentId,
      user.mysabayUserID
    );
    if (getPurchaseItem) {
      await setRedisCache(
        getPurchaseItemKey,
        getPurchaseItem,
        ENV.CACHED_EXPIRE
      );
    }
  }

  if (!getPurchaseItem) {
    debug(`Purchase Item not found`, queryOption.input);

    return {
      code: RESPONSE_CODE.NOT_FOUND_INPUT,
      status: RESPONSE_STATUS.FAILED,
    };
  }

  // check expire_date
  if (
    getPurchaseItem.expire_date > 0 &&
    getPurchaseItem.expire_date < moment.now()
  ) {
    debug(`Purchase item expired: ${getPurchaseItem._id}`);
    return {
      code: RESPONSE_CODE.INVALID_INPUT,
      status: RESPONSE_STATUS.FAILED,
    };
  }

  const purchaseId = String(getPurchaseItem.purchase_id);
  let getPurchase = await getRedisCache(purchaseId);

  if (!getPurchase) {
    getPurchase = await purchaseService.getPurchaseById(purchaseId);
    if (getPurchase) {
      await setRedisCache(purchaseId, getPurchase, ENV.CACHED_EXPIRE);
    }
  }

  if (!getPurchase) {
    debug(`Purchase ${getPurchaseItem.purchase_id} not found`);

    return {
      code: RESPONSE_CODE.NOT_FOUND_INPUT,
      status: RESPONSE_STATUS.FAILED,
    };
  }

  //check purchase status
  if (getPurchase.status !== PURCHASE_STATUS.Completed) {
    debug(`Purchase: ${getPurchase._id} status open`);
    return {
      code: RESPONSE_CODE.INVALID_INPUT,
      status: RESPONSE_STATUS.FAILED,
    };
  }

  return {
    code: RESPONSE_CODE.SUCCESS,
    status: RESPONSE_STATUS.SUCCESS,
  };
};

export default validatePurchaseContentAction;
