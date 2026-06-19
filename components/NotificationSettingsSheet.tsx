import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { useAppSettings } from '@/components/AppSettingsProvider';
import { BottomSheet } from '@/components/BottomSheet';
import {
  applyNotificationSettings,
  formatNotificationTime,
  getNotificationPermissionStatus,
  notificationsSupported,
  requestNotificationPermissions,
} from '@/lib/notifications/scheduler';
import {
  createReminderId,
  loadNotificationSettings,
  saveNotificationSettings,
} from '@/lib/notifications/storage';
import type { NotificationSettings, ReminderTime } from '@/lib/notifications/types';
import { colors } from '@/theme/colors';

type NotificationSettingsSheetProps = {
  visible: boolean;
  onClose: () => void;
};

function toTimeDate(hour: number, minute: number): Date {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function NotificationSettingsSheet({ visible, onClose }: NotificationSettingsSheetProps) {
  const { isLightTheme } = useAppSettings();
  const supported = notificationsSupported();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const loadSettings = useCallback(async () => {
    const stored = await loadNotificationSettings();
    setSettings(stored);
    const status = await getNotificationPermissionStatus();
    setPermissionDenied(status === Notifications.PermissionStatus.DENIED);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (visible) {
      setIsLoading(true);
      void loadSettings();
    }
  }, [loadSettings, visible]);

  const persistSettings = useCallback(async (next: NotificationSettings) => {
    setIsSaving(true);
    try {
      await saveNotificationSettings(next);
      await applyNotificationSettings(next);
      setSettings(next);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to update notification settings';
      Alert.alert('Notifications', message);
      const restored = await loadNotificationSettings();
      setSettings(restored);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleToggle = useCallback(
    async (enabled: boolean) => {
      if (!settings) {
        return;
      }

      if (enabled && supported) {
        const granted = await requestNotificationPermissions();
        if (!granted) {
          const status = await getNotificationPermissionStatus();
          setPermissionDenied(status === Notifications.PermissionStatus.DENIED);
          Alert.alert(
            'Permission required',
            'Enable notifications in system settings to receive daily quotes.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => void Linking.openSettings(),
              },
            ],
          );
          return;
        }
        setPermissionDenied(false);
      }

      await persistSettings({ ...settings, enabled });
    },
    [persistSettings, settings, supported],
  );

  const handleTimeChange = useCallback(
    async (event: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === 'android') {
        setShowPicker(false);
      }

      if (event.type === 'dismissed' || !date || !settings || !editingReminderId) {
        setEditingReminderId(null);
        return;
      }

      const nextTimes = settings.times.map((reminder) =>
        reminder.id === editingReminderId
          ? { ...reminder, hour: date.getHours(), minute: date.getMinutes() }
          : reminder,
      );

      setEditingReminderId(null);
      await persistSettings({ ...settings, times: nextTimes });
    },
    [editingReminderId, persistSettings, settings],
  );

  const handleAddTime = useCallback(async () => {
    if (!settings) {
      return;
    }

    const newReminder: ReminderTime = {
      id: createReminderId(),
      hour: 12,
      minute: 0,
    };

    await persistSettings({
      ...settings,
      times: [...settings.times, newReminder],
    });
  }, [persistSettings, settings]);

  const handleDeleteTime = useCallback(
    async (reminderId: string) => {
      if (!settings || settings.times.length <= 1) {
        return;
      }

      const nextTimes = settings.times.filter((reminder) => reminder.id !== reminderId);
      await persistSettings({ ...settings, times: nextTimes });
    },
    [persistSettings, settings],
  );

  const openPickerFor = useCallback((reminderId: string) => {
    setEditingReminderId(reminderId);
    setShowPicker(true);
  }, []);

  const labelColor = isLightTheme ? colors.primary : colors.foreground;
  const mutedColor = isLightTheme ? colors.muted : '#AEAEB2';
  const rowBackground = isLightTheme ? '#F2F2F7' : '#2C2C2E';

  const editingReminder = settings?.times.find((reminder) => reminder.id === editingReminderId);

  return (
    <BottomSheet visible={visible} title="Reminders" onClose={onClose}>
      {isLoading || !settings ? (
        <View style={styles.loading}>
          <ActivityIndicator color={labelColor} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {!supported ? (
            <Text style={[styles.description, { color: mutedColor }]}>
              Daily reminders are available on iOS and Android.
            </Text>
          ) : (
            <>
              <Text style={[styles.description, { color: mutedColor }]}>
                Receive a motivational quote at the times you choose.
              </Text>

              {permissionDenied ? (
                <Pressable
                  style={[styles.permissionBanner, { backgroundColor: rowBackground }]}
                  onPress={() => void Linking.openSettings()}
                  accessibilityRole="button"
                  accessibilityLabel="Open system settings to enable notifications"
                >
                  <Text style={[styles.permissionText, { color: labelColor }]}>
                    Notifications are off. Tap to open Settings.
                  </Text>
                </Pressable>
              ) : null}

              <View style={[styles.row, { backgroundColor: rowBackground }]}>
                <Text style={[styles.rowLabel, { color: labelColor }]}>Daily reminders</Text>
                <Switch
                  value={settings.enabled}
                  onValueChange={(value) => void handleToggle(value)}
                  disabled={isSaving}
                  trackColor={{ false: '#3A3A3C', true: '#34C759' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {settings.enabled ? (
                <View style={styles.timesSection}>
                  <Text style={[styles.sectionTitle, { color: mutedColor }]}>Reminder times</Text>

                  {settings.times.map((reminder) => (
                    <View
                      key={reminder.id}
                      style={[styles.timeRow, { backgroundColor: rowBackground }]}
                    >
                      <Pressable
                        style={styles.timeButton}
                        onPress={() => openPickerFor(reminder.id)}
                        disabled={isSaving}
                        accessibilityRole="button"
                        accessibilityLabel={`Edit reminder at ${formatNotificationTime(reminder.hour, reminder.minute)}`}
                      >
                        <Text style={[styles.timeValue, { color: labelColor }]}>
                          {formatNotificationTime(reminder.hour, reminder.minute)}
                        </Text>
                      </Pressable>

                      {settings.times.length > 1 ? (
                        <Pressable
                          onPress={() => void handleDeleteTime(reminder.id)}
                          disabled={isSaving}
                          hitSlop={8}
                          accessibilityRole="button"
                          accessibilityLabel="Delete reminder time"
                        >
                          <Ionicons name="trash-outline" size={20} color={mutedColor} />
                        </Pressable>
                      ) : null}
                    </View>
                  ))}

                  <Pressable
                    style={[styles.addButton, { borderColor: isLightTheme ? colors.border : colors.borderDark }]}
                    onPress={() => void handleAddTime()}
                    disabled={isSaving}
                    accessibilityRole="button"
                    accessibilityLabel="Add another reminder time"
                  >
                    <Ionicons name="add" size={20} color={labelColor} />
                    <Text style={[styles.addLabel, { color: labelColor }]}>Add another time</Text>
                  </Pressable>
                </View>
              ) : null}

              {showPicker && editingReminder && settings.enabled ? (
                <DateTimePicker
                  value={toTimeDate(editingReminder.hour, editingReminder.minute)}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => void handleTimeChange(event, date)}
                />
              ) : null}

              {isSaving ? (
                <View style={styles.savingRow}>
                  <ActivityIndicator color={mutedColor} size="small" />
                  <Text style={[styles.savingLabel, { color: mutedColor }]}>Saving…</Text>
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
    marginBottom: 16,
  },
  permissionBanner: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  rowLabel: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  timesSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  timeButton: {
    flex: 1,
  },
  timeValue: {
    fontSize: 17,
    fontFamily: 'Inter_500Medium',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addLabel: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  savingLabel: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
});
