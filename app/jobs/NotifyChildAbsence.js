const Attendance = require('../models/Attendance');
const User = require('../models/User');
const mongoose = require('../utils/database');
const {timeAfter} = require('../utils/utils');
const {sendAllNotifications} = require('../utils/notifications');

class NotifyChildAbsence {
  constructor(schoolId, date) {
    this.schoolId = schoolId;
    this.date = date;
  }

  async run() {
    if (!this.schoolId || !this.date) {
      return;
    }

    const attendance = await Attendance.find({
      school: new mongoose.Types.ObjectId(this.schoolId),
      ['attendance.date']: {$ne: this.date.valueOf()},
      isVerified: true
    }).select({fullName: 1, parent1: 1, parent2: 1}).exec();

    const parentsIds = [];
    const parentsObj = {};
    for(const a of attendance) {
      ['parent1', 'parent2'].forEach(parentKey => {
        if (!a[parentKey]) {
          return;
        }

        const parentId = a[parentKey].toString();
        if (!Array.isArray(parentsObj[parentId])) {
          parentsObj[parentId] = [];
          parentsIds.push(new mongoose.Types.ObjectId(parentId));
        }
        parentsObj[parentId].push(a.fullName);
      });
    }

    const parents = await User.find({
      _id: {$in: parentsIds},
      ['refreshTokens.fcmToken']: {$exists: true},
      ['refreshTokens.lastSeen']: {$gt: timeAfter(-2592000)}, // Last Seen from 30 days or less
      refreshTokens: {$elemMatch: {
        fcmToken: {$exists: true},
        lastSeen: {$gt: timeAfter(-2592000)} // Last Seen from 30 days or less
      }}
    }).select({refreshTokens: 1, _id: 1}).exec();

    const notifications = [
      // {tokens: [],
      // title: String,
      // body: String}
    ]
    for (const parent of parents) {
      const fcm_tokens = [];
      for (const rt of parent.refreshTokens) {
        if (rt && rt.fcmToken) {
          fcm_tokens.push(rt.fcmToken);
        }
      }

      const childrenFullNames = parentsObj[parent._id.toString()];
      for (const childFullName of childrenFullNames) {
        notifications.push({
          tokens: fcm_tokens,
          title: "تأخر ابنك علي المدرسة",
          body: `لم يصل ابنك ${childFullName} إلي المدرسة حتي الآن`
        });
      }
    }

    console.log("\n\n\n", {notifications}, "\n\n\n\n");
    const res = await sendAllNotifications(notifications);
  }
}

module.exports = NotifyChildAbsence;
