import { HistoryLogResolver } from './historyLogResolver';
import { UserTrackingResolver } from './userTrackingResolver';
import { PreferenceResolvers } from './preferenceResolvers';
import { PurchaseResolver } from './purchaseResolver';
import { PurchaseItemResolvers } from './purchaseItemResolvers';
import { UserReferrerResolver } from './userReferrerResolver';
import { TransactionLogResolver } from './transactionLogResolver';
import { BookingResolver } from './bookingResolvers';

export default [
  HistoryLogResolver,
  UserTrackingResolver,
  PreferenceResolvers,
  PurchaseResolver,
  PurchaseItemResolvers,
  UserReferrerResolver,
  TransactionLogResolver,
  BookingResolver,
];
