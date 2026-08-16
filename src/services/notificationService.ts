import User from '../models/User';

interface ExpoPushMessage {
  to: string;
  sound?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: 'default' | 'normal' | 'high';
}

/**
 * Send Expo Push Notification to all active Admin users with valid push tokens
 */
export const sendAdminPushNotification = async (
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> => {
  try {
    const adminUsers = await User.find({ role: 'Admin', pushToken: { $exists: true, $ne: '' } });
    const pushTokens = adminUsers
      .map((u) => u.pushToken)
      .filter((token): token is string => Boolean(token && token.trim().length > 0));

    if (pushTokens.length === 0) {
      console.log('[PUSH] No admin push tokens registered.');
      return;
    }

    const messages: ExpoPushMessage[] = pushTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
    }));

    await sendExpoPushMessages(messages);
  } catch (error) {
    console.error('[PUSH] Error in sendAdminPushNotification:', error);
  }
};

/**
 * Send Expo Push Notification to a specific user by ID
 */
export const sendUserPushNotification = async (
  userId: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.pushToken) {
      return;
    }

    const messages: ExpoPushMessage[] = [
      {
        to: user.pushToken,
        sound: 'default',
        title,
        body,
        data,
        priority: 'high',
      },
    ];

    await sendExpoPushMessages(messages);
  } catch (error) {
    console.error('[PUSH] Error in sendUserPushNotification:', error);
  }
};

/**
 * Helper to dispatch HTTP POST request to Expo Push API
 */
const sendExpoPushMessages = async (messages: ExpoPushMessage[]): Promise<void> => {
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    console.log('[PUSH] Expo Push API response:', JSON.stringify(result));
  } catch (error) {
    console.error('[PUSH] Failed to send push messages via Expo API:', error);
  }
};
