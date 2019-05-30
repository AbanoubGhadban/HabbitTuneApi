const mongoose = require('../utils/database');
const RefreshToken = require('./RefreshToken');
const RegistrationToken = require('./RegistrationToken');
const Family = require('./Family');
const mongoosePaginate = require('mongoose-paginate-v2');
const { childStorage } = require('../utils/storage');
const DateOnlyType = require('mongoose-dateonly')(mongoose);
const DateOnly = require('../utils/DateOnly');
const ActivityHistory = require('./ActivityHistory');
const DayActivity = require('./DayActivity');
const School = require('./School');
const Attendance = require('./Attendance');
const NotFoundError = require('../errors/NotFoundError');
const Fawn = require('fawn');

const childSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 2,
    max: 255,
    required: true
  },
  fullName: {
    type: String,
    min: 6,
    max: 255,
    required: false
  },
  school: {
    type: {
      _id: {
        type: mongoose.Types.ObjectId,
        ref: 'School',
        required: true
      },
      name: {
        type: String,
        min: 2,
        max: 255,
        required: true
      }
    },
    required: false
  },
  family: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family'
  },
  role: {
    type: String,
    enum: ['son', 'daughter'],
    required: true
  },
  points: {
    type: Number,
    required: true,
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value'
    },
    index: true
  },
  birthdate: {
    type: DateOnlyType,
    required: false
  },
  photo: {
    type: String,
    max: 30,
    required: false
  },
  registrationTokens: {
    type: [RegistrationToken.schema],
    select: false
  },
  refreshTokens: {
    type: [RefreshToken.schema],
    select: false
  }
});

childSchema.plugin(mongoosePaginate);

childSchema.options.toJSON = {
  transform: function (doc, ret, options) {
    if (ret) {
      ret.id = ret._id;
      ret.thumbnail = ret.photo ? childStorage.getThumbUrl(ret.photo) : null;
      ret.photo = ret.photo ? childStorage.getFileUrl(ret.photo) : null;

      if (ret.school) {
        ret.school = {
          id: ret.school._id,
          name: ret.school.name
        };
      }
      delete ret._id;
      delete ret.registrationTokens;
      delete ret.refreshTokens;
    }
    return ret;
  }
}

childSchema.methods.setSchool = async function (schoolId, fullName, task) {
  const school = await School.findById(schoolId).exec();
  if (!school) {
    throw new NotFoundError('school', school);
  }

  if (!fullName) {
    fullName = this.fullName;
  }

  let runTask = !task;
  task = task? task : Fawn.Task();

  if (!this.school || !this.school._id ||
    (this.school._id.toString() !== schoolId)) {

    if (this.school && this.school._id) {
      task.update('attendance', {
        school: this.school._id,
        child: new mongoose.Types.ObjectId(this._id)
      }, {
        isVerified: false,
        isDeleted: true,
        parent1: null,
        parent2: null,
        family: null
      });
    }

    const familyId = this.family._id? this.family._id : this.family;
    const family = await Family.findById(familyId).exec();
    task.update('attendance', {
      school: new mongoose.Types.ObjectId(schoolId),
      child: new mongoose.Types.ObjectId(this._id)
    }, {
      isVerified: true,
      school: new mongoose.Types.ObjectId(schoolId),
      child: new mongoose.Types.ObjectId(this._id),
      fullName,
      parent1: family.parent1,
      parent2: family.parent2,
      family: family._id,
      $unset: {isDeleted: ''}
    }).options({upsert: true, setDefaultsOnInsert: true});
  }

  if (runTask) {
    task.update('child', {
      _id: this._id
    }, {
      school: {
        _id: school._id,
        name: school.name
      },
      fullName
    });
  } else {
    this.school = {
      _id: school._id,
      name: school.name
    };
  }

  if (runTask) {
    await task.run({useMongoose: true});
  }
}

childSchema.methods.exitSchool = async function() {
  if (!this.school || !this.school._id) {
    return;
  }

  const task = Fawn.Task();
  task.update('attendance', {
    school: this.school._id,
    child: new mongoose.Types.ObjectId(this._id)
  }, {
    isVerified: false,
    isDeleted: true
  });

  task.update('child', {_id: this._id}, {$unset: {school: ''}});
  await task.run({useMongoose: true});
}

childSchema.methods.getProgress = async function (fromDate, toDate) {
  if (!fromDate) {
    fromDate = new DateOnly(toDate.valueOf());
    fromDate.setDate(fromDate.getDate() - 6);
  }

  const childCreatedAt = DateOnly.fromObjectId(this._id).valueOf();
  let { minDate, maxDate } = (await ActivityHistory.aggregate([
    {
      $group: {
        _id: null,
        minDate: { $min: "$date" },
        maxDate: { $max: "$date" }
      }
    },
    {
      $limit: 1
    }
  ]).exec())['0'];
  minDate = Math.max(childCreatedAt, minDate);
  maxDate = Math.min(maxDate, (new DateOnly()).valueOf());

  if (fromDate < minDate) {
    fromDate = new DateOnly(minDate.valueOf());
  }
  if (toDate > maxDate) {
    toDate = new DateOnly(maxDate.valueOf());
  }

  const acheivedPoints = await DayActivity.aggregate([
    { $unwind: "$activities" },
    {
      $match: {
        date: { $gte: fromDate.valueOf(), $lte: toDate.valueOf() },
        child: new mongoose.Types.ObjectId(this._id)
      }
    },
    {
      $group: {
        _id: "$activities.category",
        totalPoints: { $sum: "$activities.points" }
      }
    },
    { $project: { _id: 0, category: "$_id", totalPoints: 1 } }
  ]).exec();

  const maxPoints = await ActivityHistory.aggregate([
    { $unwind: "$points" },
    { $match: { date: { $gte: fromDate.valueOf(), $lte: toDate.valueOf() } } },
    {
      $group: {
        _id: "$points.category",
        totalPoints: { $sum: "$points.points" }
      }
    },
    { $project: { _id: 0, category: "$_id", totalPoints: 1 } }
  ]);

  return {
    acheivedPoints: acheivedPoints,
    maxPoints,
    child: this.toJSON(),
    fromDate: fromDate.valueOf(),
    toDate: toDate.valueOf()
  };
}

module.exports = mongoose.model('Child', childSchema);
