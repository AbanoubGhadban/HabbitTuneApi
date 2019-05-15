const mongoose = require('../utils/database');
const RefreshToken = require('./RefreshToken');
const RegistrationToken = require('./RegistrationToken');
const mongoosePaginate = require('mongoose-paginate-v2');
const {childStorage} = require('../utils/storage');
const DateOnlyType = require('mongoose-dateonly')(mongoose);
const DateOnly = require('../utils/DateOnly');
const ActivityHistory = require('./ActivityHistory');
const DayActivity = require('./DayActivity');

const childSchema = new mongoose.Schema({
    name: {
        type: String,
        min: 2,
        max: 255,
        required: true
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
            ret.thumbnail = ret.photo? childStorage.getThumbUrl(ret.photo) : null;
            ret.photo = ret.photo? childStorage.getFileUrl(ret.photo) : null;
            delete ret._id;
            delete ret.registrationTokens;
            delete ret.refreshTokens;
        }
        return ret;
    }
}

childSchema.methods.getProgress = async function (fromDate, toDate) {
    if (!fromDate) {
        fromDate = new DateOnly(toDate.valueOf());
        fromDate.setDate(fromDate.getDate() - 6);
    }

    const childCreatedAt = DateOnly.fromObjectId(this._id).valueOf();
    let {minDate, maxDate} = (await ActivityHistory.aggregate([
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
      { $match: {
        date: { $gte: fromDate.valueOf(), $lte: toDate.valueOf() },
        child: new mongoose.Types.ObjectId(this._id)
      }},
      { $group: {
        _id: "$activities.category",
        totalPoints: { $sum: "$activities.points" }
      }},
      { $project: { _id: 0, category: "$_id", totalPoints: 1 } }
    ]).exec();

    const maxPoints = await ActivityHistory.aggregate([
      { $unwind: "$points" },
      { $match: { date: { $gte: fromDate.valueOf(), $lte: toDate.valueOf() } } },
      { $group: {
        _id: "$points.category",
        totalPoints: { $sum: "$points.points" }
      }},
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
