export type ReminderTime = {
  id: string;
  hour: number;
  minute: number;
};

export type NotificationSettings = {
  enabled: boolean;
  times: ReminderTime[];
};

export const DEFAULT_REMINDER_TIME: ReminderTime = {
  id: 'default',
  hour: 8,
  minute: 0,
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  times: [DEFAULT_REMINDER_TIME],
};
