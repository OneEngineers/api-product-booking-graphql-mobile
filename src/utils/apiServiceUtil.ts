import { httpPostGraphQl } from './httpUtil';
import { ENV } from '../constants';
import { AxiosRequestConfig } from 'axios';

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
