const School = require('../models/School');
const Attendance = require('../models/Attendance');
const AttendanceSheet = require('../models/AttendanceSheet');
const config = require('config');
const dispatchJob = require('../jobs/dispatcher');
const NotifyChildAbsence = require('../jobs/NotifyChildAbsence');
const DateOnly = require('../utils/DateOnly');
const mongoose = require('../utils/database');
const NotFoundError = require('../errors/NotFoundError');

const {saveAttendanceSheet} = require('../utils/excel');
const fs = require('fs');

module.exports = {
  index: async(req, res) => {
      const filter = {};
      let {name} = req.query;
      if (name) {
          filter.name = {$regex: `.*${name}.*`, $options: 'i'};
      }

      const perPage = config.get('itemsPerPage');
      const page = parseInt(req.query.page, 1, false);
      
      const results = await School.paginate(filter, {
          customLabels: {docs: 'data'},
          page,
          limit: perPage
      });
      
      res.send(results);
  },

  sendChildAbsenceAlert: async(req, res) => {
    const {schoolId} = req.query;
    const job = new NotifyChildAbsence(schoolId, new DateOnly());
    dispatchJob(job);
    res.send({});
  },

  createAttendanceSheet: async(req, res) => {
    const {schoolId, date} = req.body;
    const school = await School.findById(schoolId).exec();
    if (!school) {
      throw new NotFoundError('school', schoolId);
    }

    console.log(+date);
    const attendance = await Attendance.aggregate([
      { $unwind: '$attendance' },
      { $match: {
        school: new mongoose.Types.ObjectId(schoolId),
        $or: [
          { isVerified: true },
          { ['attendance.date']: +date }
        ]
      } },
      { $sort: { 'attendance.fullName': 1 } },
      { $group: {
        _id: "$_id",
        fullName: { $first: "$fullName" },
        isAttended: { $max: { $eq: ['$attendance.date', +date] } }
      } }
    ]).exec();

    const appUrl = config.get('app.url');
    const filePath = await saveAttendanceSheet(attendance, date, school);

    try {
      const oldSheet = await AttendanceSheet.findOneAndUpdate({
        school: new mongoose.Types.ObjectId(schoolId),
        date: +date
      }, {path: filePath}, {upsert: true}).exec()

      if (oldSheet) {
        fs.unlink(oldSheet.path, err => {});
      }
    } catch(err) {}

    res.send({
      url: `${appUrl}/${filePath}`
    });
  }
}