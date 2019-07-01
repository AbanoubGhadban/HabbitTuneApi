const Family = require('../models/Family');
const Attendance = require('../models/Attendance');
const School = require('../models/School');
const NotFoundError = require('../errors/NotFoundError');
const errors = require('../errors/types');
const JoinCode = require('../models/JoinCode');
const ValidationError = require('../errors/ValidationError');
const ForbiddenError = require('../errors/ForbiddenError');
const Fawn = require('fawn');
const mongoose = require('../utils/database');

const _ = require('lodash');
const config = require('config');
const {parseInt} = require('../utils/utils');

module.exports = {
    index: async(req, res) => {
        const {schoolId} = req.params;
        const filter = {
          school: new mongoose.Types.ObjectId(schoolId),
          isDeleted: {$ne: true}
        };
        let {fullName, isVerified} = req.query;
        if (fullName) {
            filter.fullName = {$regex: `.*${fullName}.*`};
        }
        if (typeof(isVerified) === 'string') {
          const isVerifiedStr = isVerified.toLowerCase();
          if (isVerifiedStr === 'true') {
            filter.isVerified = true;
          } else if (isVerified === 'false') {
            filter.isVerified = false;
          }
        }

        const perPage = config.get('itemsPerPage');
        const page = parseInt(req.query.page, 1, false);
        
        console.log(filter);
        const results = await Attendance
        .paginate(filter, {
            select: "-attendance",
            customLabels: {docs: 'data'},
            page,
            limit: perPage
        });
        
        res.send(results);
    },

    showAll: async(req, res) => {
      const {schoolId} = req.params;
      const results = await Attendance.find({
        school: new mongoose.Types.ObjectId(schoolId),
        isVerified: true,
        isDeleted: {$ne: true}
      }).select("_id child fullName").exec();

      const resultsJson = [];
      results.forEach(child => resultsJson.push(child.toJSON()));
      res.send(resultsJson);
  },

    verifyStudent: async(req, res) => {
        const {schoolId, childId} = req.params;
        const attendance = await Attendance.find({
          child: new mongoose.Types.ObjectId(childId),
          school: new mongoose.Types.ObjectId(schoolId),
          isVerified: false,
          isDeleted: {$ne: true}
        }).select('-attendance').exec();

        if (!attendance) {
          throw new NotFoundError('child-school', childId + '-' + schoolId);
        }

        const school = await School.findById(schoolId);
        const task = new Fawn.Task();
        task.update('child', 
          {_id: new mongoose.Types.ObjectId(childId)},
          {$set: {
            'school._id': new mongoose.Types.ObjectId(schoolId),
            'school.name': school.name,
            fullName: attendance.fullName
          }}
        );

        task.update('attendance', {
          child: new mongoose.Types.ObjectId(childId),
          school: new mongoose.Types.ObjectId(schoolId)
        }, {
          $set: {isVerified: true, isDeleted: false}
        });
        await task.run({useMongoose: true});

        const newAttendance = await Attendance.findOne({
          child: new mongoose.Types.ObjectId(childId),
          school: new mongoose.Types.ObjectId(schoolId)
        }).select('-attendance').exec();
        console.log(newAttendance);
        res.send(newAttendance.toJSON());
    },

    destroy: async(req, res) => {
        const {schoolId, childId} = req.params;
        const attendance = await Attendance.find({
          child: new mongoose.Types.ObjectId(childId),
          school: new mongoose.Types.ObjectId(schoolId),
          isVerified: true,
          isDeleted: {$ne: true}
        }).select('-attendance').exec();

        if (!attendance) {
          throw new NotFoundError('child-school', childId + '-' + schoolId);
        }

        const task = new Fawn.Task();
        task.update('child', {_id: new mongoose.Types.ObjectId(childId)},
          {$unset: {school: ''}});
        task.update('attendance', {
          child: new mongoose.Types.ObjectId(childId),
          school: new mongoose.Types.ObjectId(schoolId)
        }, {
          isVerified: false,
          isDeleted: true
        });
        await task.run({useMongoose: true});
        res.send();
    }
}
