const School = require('../models/School');
const Attendance = require('../models/Attendance');
const AttendanceSheet = require('../models/AttendanceSheet');
const config = require('config');
const dispatchJob = require('../jobs/dispatcher');
const NotifyChildAbsence = require('../jobs/NotifyChildAbsence');
const DateOnly = require('../utils/DateOnly');
const mongoose = require('../utils/database');
const NotFoundError = require('../errors/NotFoundError');
const User = require('../models/User');

const {saveAttendanceSheet} = require('../utils/excel');
const {parseInt} = require('../utils/utils');
const fs = require('fs');
const Fawn = require('fawn');
const _ = require('lodash');

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

  show: async(req, res) => {
    const schoolId = req.params.schoolId;
    const school = await School.findById(schoolId).exec();

    if (!school) {
        throw new NotFoundError('school', schoolId);
    }
    res.send(school.toJSON());
  },

  store: async(req, res) => {
    const props = _.pick(req.body, ['name']);
    const school = new School(props);
    await school.save();
    res.send(school.toJSON());
  },

  update: async(req, res) => {
    const schoolId = req.params.schoolId;
    const props = _.pick(req.body, ['name']);

    const task = new Fawn.Task();
    task.update('schools',
      {_id: new mongoose.Types.ObjectId(schoolId)},
      { $set: {...props} });
    task.update('child',
      {'school._id': new mongoose.Types.ObjectId(schoolId)}, {
      $set: {'school.name': props.name}
    });
    await task.run({useMongoose: true});

    const school = await School.findById(schoolId);
    res.send(school.toJSON());
  },

  destroy: async(req, res) => {
    const {schoolId} = req.params;
    const task = new Fawn.Task();
    task.remove('schools', {_id: new mongoose.Types.ObjectId(schoolId)});
    task.update('child',
      {'school._id': new mongoose.Types.ObjectId(schoolId)}, {
      $unset: {school: ''}
    });
    await task.run({useMongoose: true});
    res.send();
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
  },

  setUserAsSchoolAdmin: async(req, res) => {
    const {schoolId} = req.params;
    const {userId} = req.body;
    
    const user = await User.findByIdAndUpdate(userId, {
      school: new mongoose.Types.ObjectId(schoolId)
    }, {new: true}).populate('school').exec();
    res.send(user.toJSON());
  },

  unSetUserAsSchoolAdmin: async(req, res) => {
    const {userId} = req.body;
    
    const user = await User.findByIdAndUpdate(userId, {
      $unset: {school: ''}
    }, {new: true}).exec();
    res.send(user.toJSON());
  }
}