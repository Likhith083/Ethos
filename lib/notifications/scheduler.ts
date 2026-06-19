import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { loadNotificationSettings } from '@/lib/notifications/storage';
import type { NotificationSettings, ReminderTime } from '@/lib/notifications/types';
import { getNotificationQuote } from '@/lib/quotes/provider';
import type { Quote } from '@/lib/quotes/types';

const NOTIFICATION_ID_PREFIX = 'ethos-daily-quote';
const ANDROID_CHANNEL_ID = 'ethos-daily-quote';

const MAX_BODY_LENGTH = 140;

export function reminderNotificationId(reminderId: string): string {
  return `${NOTIFICATION_ID_PREFIX}-${reminderId}`;
}

export function formatNotificationTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const paddedMinute = minute.toString().padStart(2, '0');
  return `${hour12}:${paddedMinute} ${period}`;
}

export function formatQuoteNotificationBody(quote: Quote): string {
  const text =
    quote.text.length > MAX_BODY_LENGTH
      ? `${quote.text.slice(0, MAX_BODY_LENGTH - 1)}…`
      : quote.text;
  return `"${text}" — ${quote.author}`;
}

export function notificationsSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export async function configureNotifications(): Promise<void> {
  if (!notificationsSupported()) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Daily quote',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }
}

export async function getNotificationPermissionStatus(): Promise<Notifications.PermissionStatus> {
  if (!notificationsSupported()) {
    return Notifications.PermissionStatus.UNDETERMINED;
  }

  const settings = await Notifications.getPermissionsAsync();
  return settings.status;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!notificationsSupported()) {
    return false;
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });

  return requested.granted;
}

async function scheduleReminderNotification(
  reminder: ReminderTime,
  quote: Quote,
): Promise<void> {
  const identifier = reminderNotificationId(reminder.id);
  await Notifications.cancelScheduledNotificationAsync(identifier);

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: 'Your daily moment',
      body: formatQuoteNotificationBody(quote),
      sound: true,
      ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: reminder.hour,
      minute: reminder.minute,
    },
  });
}

export async function cancelAllQuoteNotifications(): Promise<void> {
  if (!notificationsSupported()) {
    return;
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const quoteIds = scheduled
    .map((entry) => entry.identifier)
    .filter((id) => id.startsWith(NOTIFICATION_ID_PREFIX));

  await Promise.all(quoteIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

export async function applyNotificationSettings(
  settings: NotificationSettings,
): Promise<void> {
  if (!notificationsSupported()) {
    return;
  }

  if (!settings.enabled || settings.times.length === 0) {
    await cancelAllQuoteNotifications();
    return;
  }

  const granted = await requestNotificationPermissions();
  if (!granted) {
    throw new Error('Notification permission was not granted');
  }

  await cancelAllQuoteNotifications();
  const quote = await getNotificationQuote();

  for (const reminder of settings.times) {
    await scheduleReminderNotification(reminder, quote);
  }
}

export async function syncDailyQuoteNotification(): Promise<void> {
  if (!notificationsSupported()) {
    return;
  }

  const settings = await loadNotificationSettings();
  if (!settings.enabled) {
    return;
  }

  const granted = await getNotificationPermissionStatus();
  if (granted !== Notifications.PermissionStatus.GRANTED) {
    return;
  }

  await applyNotificationSettings(settings);
}
