import { HistoryLogResolver } from './historyLogResolver';
import { UserTrackingResolver } from './userTrackingResolver';
import { PreferenceResolvers } from './preferenceResolvers';
import { PurchaseResolver } from './purchaseResolver';
import { PurchaseItemResolvers } from './purchaseItemResolvers';
import { TransactionLogResolver } from './transactionLogResolver';
import { BookingResolver } from './bookingResolvers';
import { AdminBookingResolver } from './AdminBookingResolver';
export default [
  HistoryLogResolver,
  UserTrackingResolver,
  PreferenceResolvers,
  PurchaseResolver,
  PurchaseItemResolvers,
  TransactionLogResolver,
  BookingResolver,
  AdminBookingResolver,
];
