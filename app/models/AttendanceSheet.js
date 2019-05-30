const mongoose = require('../utils/database');
const DateOnlyType = require('mongoose-dateonly')(mongoose);

const attendanceSheetSchema = new mongoose.Schema({
    path: {
        type: String,
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        index: true,
        required: true
    },
    date: {
      type: DateOnlyType,
      index: true,
      required: true
    }
});

module.exports = mongoose.model('AttendanceSheet', attendanceSheetSchema);
