import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_REMINDER_TIME,
  type NotificationSettings,
  type ReminderTime,
} from '@/lib/notifications/types';

const STORAGE_KEY = 'ethos.notifications.settings.v2';
const LEGACY_STORAGE_KEY = 'ethos.notifications.settings.v1';

function isValidHour(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 23;
}

function isValidMinute(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 59;
}

function parseReminderTime(value: unknown, fallbackId: string): ReminderTime | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<ReminderTime>;
  if (!isValidHour(candidate.hour) || !isValidMinute(candidate.minute)) {
    return null;
  }

  return {
    id: typeof candidate.id === 'string' && candidate.id.length > 0 ? candidate.id : fallbackId,
    hour: candidate.hour,
    minute: candidate.minute,
  };
}

function parseTimes(value: unknown): ReminderTime[] {
  if (!Array.isArray(value)) {
    return [DEFAULT_REMINDER_TIME];
  }

  const times = value
    .map((entry, index) => parseReminderTime(entry, `reminder-${index}`))
    .filter((entry): entry is ReminderTime => entry !== null);

  return times.length > 0 ? times : [DEFAULT_REMINDER_TIME];
}

async function migrateLegacySettings(): Promise<NotificationSettings | null> {
  const raw = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { enabled?: boolean; hour?: number; minute?: number };
    const migrated: NotificationSettings = {
      enabled: parsed.enabled === true,
      times: [
        {
          id: DEFAULT_REMINDER_TIME.id,
          hour: isValidHour(parsed.hour) ? parsed.hour : DEFAULT_REMINDER_TIME.hour,
          minute: isValidMinute(parsed.minute) ? parsed.minute : DEFAULT_REMINDER_TIME.minute,
        },
      ],
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
    return migrated;
  } catch {
    return null;
  }
}

export async function loadNotificationSettings(): Promise<NotificationSettings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const migrated = await migrateLegacySettings();
    return migrated ?? DEFAULT_NOTIFICATION_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<NotificationSettings>;
    return {
      enabled: parsed.enabled === true,
      times: parseTimes(parsed.times),
    };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export async function saveNotificationSettings(
  settings: NotificationSettings,
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function createReminderId(): string {
  return `reminder-${Date.now()}`;
}
