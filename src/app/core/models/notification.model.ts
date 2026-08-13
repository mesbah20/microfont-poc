/**
 * UBL demo-faithful notification model.
 * Mirrors `INotificationResponse` from the UBL demo.
 */
export interface INotificationResponse {
  notificationID?: string;
  NotificationTitle?: string;
  NotificationBody?: string;
  CreatedAt?: Date | string | null;
  WebUrl?: string | null;
  ImgUrl?: string | null;
  isRead?: boolean;
}