const Attendance = require('../models/Attendance');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const errors = require('../errors/types');
const config = require('config');
const mongoose = require('../utils/database');
const DateOnly = require('../utils/DateOnly');
const {getArrivalStatus} = require('../utils/schools');

module.exports = {
    index: async(req, res) => {
      const {schoolId, date} = req.params;
      const {offset, fullName} = req.query;

      const filter = {
        school: new mongoose.Types.ObjectId(schoolId),
        ['attendance.date']: +date
      };

      if (typeof(fullName) === 'string' && fullName.trim().length > 0) {
        filter.fullName = {$regex: `.*${fullName}.*`};
      }

      const perPage = config.get('itemsPerPage');
      const results = await Attendance.aggregate([
        { $unwind: '$attendance' },
        { $match: filter },
        { $sort: { ['attendance.arriveTime']: -1 } },
        { $skip: Number.isInteger(+offset) && +offset > 0? +offset : 0 },
        { $limit: perPage },
        { $group: {
          _id: '$_id',
          arriveTime: { $first: '$attendance.arriveTime' },
          arrivalStatus: { $first: '$attendance.arrivalStatus' },
          child: { $first: '$child' },
          family: { $first: '$family' },
          school: { $first: '$school' },
          fullName: { $first: '$fullName' }
        }},
        { $project: { 
          _id: 0,
          id: '$_id',
          arriveTime: '$arriveTime',
          arrivalStatus: '$arrivalStatus',
          fullName: '$fullName',
          child: '$child',
          family: '$family',
          school: '$school'
        } }
      ]).exec();

      const resJson = results.map(a => {
        if (a.arriveTime) {
          a.arriveTime = +a.arriveTime;
        }
        return a;
      });

      const attendedCount = await Attendance.findOne({
        school: new mongoose.Types.ObjectId(schoolId),
        ['attendance.date']: +date
      }).countDocuments().exec();

      const totalCount = await Attendance.findOne({
        school: new mongoose.Types.ObjectId(schoolId),
        $or: [
          {isVerified: true},
          {['attendance.date']: +date}
        ]
      }).countDocuments().exec();

      res.send({
        data: resJson,
        totalCount,
        attendedCount,
        hasMore: results.length >= perPage
      });
    },

    show: async(req, res) => {
      const {schoolId, date, childId} = req.params;
      const results = await Attendance.aggregate([
        { $unwind: '$attendance' },
        { $match: {
          school: new mongoose.Types.ObjectId(schoolId),
          child: new mongoose.Types.ObjectId(childId),
          ['attendance.date']: +date
        } },
        { $group: {
          _id: '$_id',
          arriveTime: { $first: '$attendance.arriveTime' },
          child: { $first: '$child' },
          school: { $first: '$school' },
          fullName: { $first: '$fullName' }
        }},
        { $project: { 
          _id: 0,
          id: '$_id',
          arriveTime: '$arriveTime',
          fullName: '$fullName',
          child: '$child',
          school: '$school'
        } }
      ]).limit(1).exec();

      const resJson = results.map(a => {
        if (a.arriveTime) {
          a.arriveTime = +a.arriveTime;
        }
        return a;
      });

      if (!resJson[0]) {
        throw new NotFoundError('child-school', childId + '-' + schoolId);
      }
      res.send(resJson[0]);
    },

    store: async(req, res) => {
      const {childId, schoolId} = req.params;
      const arriveTime = new Date();
      const date = new DateOnly();
      req.params.date = date;

      const tmpAttendance = await Attendance.findOne({
        child: new mongoose.Types.ObjectId(childId),
        school: new mongoose.Types.ObjectId(schoolId),
        isVerified: true
      }).exec();

      if (!tmpAttendance) {
        throw new NotFoundError('child-school', childId + '-' + schoolId);
      }

      const attendance = await Attendance.findOne({
        child: new mongoose.Types.ObjectId(childId),
        school: new mongoose.Types.ObjectId(schoolId),
        ['attendance.date']: +date
      }).exec();

      if (attendance) {
        throw ValidationError.from('child', childId, errors.CHILD_ALREADY_ATTENDED);
      }

      await Attendance.update({
        child: new mongoose.Types.ObjectId(childId),
        school: new mongoose.Types.ObjectId(schoolId)
      }, {$push: {attendance: {
        date: date.valueOf(),
        arriveTime,
        arrivalStatus: getArrivalStatus(arriveTime)
      }}});
      await module.exports.show(req, res);
    },
}
