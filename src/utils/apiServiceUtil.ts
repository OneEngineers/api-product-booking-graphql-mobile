import { httpPost, httpPostGraphQl } from './httpUtil';
import { ENV } from '../constants';
import { AxiosRequestConfig } from 'axios';
import crypto from 'crypto';
import moment from 'moment';

export const getMovieFromCMS = async (
  contentId: string,
  additionalFields: string = ''
): Promise<any> => {
  const bodyParams = {
    query: `
      query movie {
        movie(id: "${contentId}") {
          data {
            attributes {
              Title
              ${additionalFields}
              ReleaseDate
              Thumbnail {
                data {
                  attributes {
                    url
                    blurhash
                  }
                }
              }
              createdAt
              updatedAt
              publishedAt
            }
          }
        }
      }
    `,
  };

  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${ENV.MOVIE_API_TOKEN}`,
    },
  };

  const [response, err] = await httpPostGraphQl(
    ENV.MOVIE_API_URL,
    bodyParams,
    config
  );

  if (err) {
    const errorMsg =
      err?.response?.data || err || 'Error fetching movie from CMS';
    return [null, errorMsg as string];
  }
  const responseData = response.data as {
    data: { movie: any };
  };
  const movieData = responseData?.data?.movie;
  return [movieData, null];
};

export const getBookFromCMS = async (
  contentId: string,
  additionalFields: string = ''
): Promise<any> => {
  const bodyParams = {
    query: `
      query book {
        book(documentId: "${contentId}") {
          title
          ${additionalFields}
          bookCover {
            url
            blurhash
          }
          updatedAt
          createdAt
          publishedAt
        }
      }
    `,
  };
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${ENV.BOOK_API_TOKEN}`,
    },
  };

  const [response, err] = await httpPostGraphQl(
    ENV.BOOK_API_URL,
    bodyParams,
    config
  );

  if (err) {
    const errorMsg =
      err?.response?.data || err || 'Error fetching book from CMS';
    return [null, errorMsg as string];
  }
  const responseData = response.data as {
    data: { book: any };
  };
  const bookData = responseData?.data?.book;

  return [bookData, null];
};
export const getPodcastFromCMS = async (contentId: string): Promise<any> => {
  const bodyParams = {
    query: `
      query podcast {
        podcast(id: "${contentId}") {
          data {
            attributes {
              title
              albumCover {
                data {
                  attributes {
                    url
                    blurhash
                  }
                }
              }
              createdAt
              updatedAt
              publishedAt
            }
          }
        }
      }
    `,
  };

  const [response, err] = await httpPostGraphQl(
    ENV.PODCAST_API_URL,
    bodyParams
  );

  if (err) {
    const errorMsg =
      err?.response?.data || err || 'Error fetching podcast from CMS';
    return [null, errorMsg as string];
  }
  const responseData = response.data as {
    data: { podcast: any };
  };
  const podcastData = responseData?.data?.podcast;
  return [podcastData, null];
};

export const getPayWayTxnDetail = async (transactionId: string) => {
  try {
    const url = `${ENV.ABA_PAY_WAY_URL}/api/payment-gateway/v1/payments/transaction-detail`;
    const currentDate = moment.now();
    const hash = crypto
      .createHmac('sha512', ENV.ABA_PAY_API_KEY)
      .update(String(currentDate) + ENV.ABA_PAY_MERCHANT_ID + transactionId)
      .digest('base64');
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const body = {
      req_time: currentDate,
      merchant_id: ENV.ABA_PAY_MERCHANT_ID,
      tran_id: transactionId,
      hash,
    };

    const [response, err] = await httpPost(url, body, config);

    if (err) {
      const errorMsg =
        err?.response?.data || err || 'Error Get Transaction From ABA.';
      return [null, errorMsg as string];
    }

    return response?.data?.data;
  } catch (error) {
    throw Error(error);
  }
};

export const getWingPayTxnDetail = async (referenceId: string) => {
  try {
    const url_wing = `${ENV.WING_PAY_WAY_URL}/v2/online/payment/transaction/inquiry`;
    const sanbox = '1';
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const body = {
      api_key: ENV.WING_PAY_API_KEY,
      user_name: ENV.WING_PAY_USERNAME,
      order_reference_no: referenceId,
      // tran_id: transactionId,
      san_box: sanbox,
    };

    const [response, err] = await httpPost(url_wing, body, config);

    if (err) {
      const errorMsg =
        err?.response?.data || err || 'Error Get Transaction From Wing Bank.';
      return [null, errorMsg as string];
    }

    return response?.data?.data;
  } catch (error) {
    throw Error(error);
  }
};
