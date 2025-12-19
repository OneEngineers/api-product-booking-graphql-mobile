import { SortOrder, Types } from 'mongoose';

type ApiServiceResponse<T> = Promise<[T?, string?]>;

type AnyObject = { [key: string]: any };

type ObjectId = Types.ObjectId;

type RepoFindOptions = {
  limit?: number;
  skip?: number;
  sort?: Array<[string, SortOrder]>;
  select?: string[];
  distinct?: string;
};

type PaymentServiceProvider = {
  code: string;
  name: string;
  paymentOption?: string | null;
};

type PaymentInfo = {
  transactionId: string;
  transactionHash: string;
  amount: number;
};

type BookingInfo = {
  transactionId: string;
  transactionHash: string;
  bookingAmount: number;
};

export {
  AnyObject,
  RepoFindOptions,
  ObjectId,
  ApiServiceResponse,
  PaymentServiceProvider,
  PaymentInfo,
  BookingInfo,
};
