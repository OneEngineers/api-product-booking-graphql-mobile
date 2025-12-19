import { ENV } from '../constants';
import { Pagination } from '../graphql/typeDefs';

export const pagination = <T>(
  documents: T[],
  totalDocuments: number,
  page: number = 1,
  limit: number = ENV.ROW_LIMIT
): {
  documents: T[];
  pagination: Pagination;
} => {
  if (limit > ENV.MAX_LIMIT) {
    throw new Error('Limit exceeded');
  }

  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(totalDocuments / limit);

  let fromItem = skip + 1;
  let toItem = documents.length + skip;
  if (documents.length < 1) {
    fromItem = 0;
    toItem = 0;
  }
  const pagination: Pagination = {
    currentPage: page,
    lastPage: totalPages,
    from: fromItem,
    to: toItem,
    perPage: limit,
    total: totalDocuments,
  };

  return { documents, pagination };
};
