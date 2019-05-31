const admin = require('./firebase');
const messaging = admin.messaging();

/**
 * @param title()
 * @param String body
 */
const multicastNotification = (title, body, fcmTokens) => {
  console.log({fcmTokens});
  const message = {
    tokens: fcmTokens,
    notification: {
      title,
      body
    }
  };

  return messaging.sendMulticast(message);
}

const sendAllNotifications = messages => {
  const fcmMessages = [];
  for (const m of messages) {
    if (!Array.isArray(m.tokens)) {
      continue;
    }

    for (const token of m.tokens) {
      fcmMessages.push({
        token,
        notification: {
          title: m.title,
          body: m.body
        }
      });
    }
  }

  console.log({fcmMessages})
  if (fcmMessages.length === 0) {
    return Promise.resolve();
  }
  return messaging.sendAll(fcmMessages);
}

module.exports = {
  multicastNotification,
  sendAllNotifications
};
