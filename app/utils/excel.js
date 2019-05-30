const excel = require('node-excel-export');
const fs = require('fs');
const DateOnly = require('./DateOnly');
const crypto = require('crypto');

const getNewFileName = date => new Promise((resolve, reject) => {
  crypto.pseudoRandomBytes(16, function(err, raw) {
    if (err) return reject(err);
    resolve(`${+date}` + raw.toString('hex'));
  });
})

// You can define styles as json object
const styles = {
  mainHeader: {
    font: {
      color: {
        rgb: 'FF009688'
      },
      sz: 20,
      bold: true
    },
    alignment: {
      vertical: "center",
      horizontal: "center"
    }
  },
  headerDark: {
    fill: {
      fgColor: {
        rgb: 'FF795548'
      }
    },
    font: {
      color: {
        rgb: 'FFFFFFFF'
      },
      sz: 14,
      bold: true
    },
    alignment: {
      vertical: "center",
      horizontal: "center"
    }
  },
  cellPink: {
    fill: {
      fgColor: {
        rgb: 'FFFFCCFF'
      }
    }
  },
  cellGreen: {
    fill: {
      fgColor: {
        rgb: 'FF8BC34A'
      }
    },
    alignment: {
      vertical: "center",
      horizontal: "center"
    }
  },
  cellRed: {
    fill: {
      fgColor: {
        rgb: 'FFF44336'
      }
    },
    alignment: {
      vertical: "center",
      horizontal: "center"
    }
  }
};

//Here you specify the export structure
const specification = {
  serial: {
    displayName: 'م',
    headerStyle: styles.headerDark,
    cellStyle: styles.cellPink, // <- Cell style
    width: 30 // <- width in pixels
  },
  fullName: {
    displayName: 'الطالب',
    headerStyle: styles.headerDark,
    cellStyle: styles.cellPink, // <- Cell style
    width: 220 // <- width in pixels
  },
  isAttended: { // <- the key should match the actual data key
    displayName: 'الحضور', // <- Here you specify the column header
    headerStyle: styles.headerDark, // <- Header style
    cellStyle: function(value, row) { // <- style renderer function
      // if the status is 1 then color in green else color in red
      // Notice how we use another cell value to style the current one
      return row.isAttended ? styles.cellGreen : styles.cellRed; // <- Inline cell style is possible 
    },
    cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
      return value ? '1' : '0';
    },
    width: 50 // <- width in pixels
  }
}

const merges = [
  { start: { row: 1, column: 1 }, end: { row: 2, column: 14 } },
  { start: { row: 3, column: 1 }, end: { row: 4, column: 14 } }
]

const getHeader = (date, school) => [
  [{value: school.name, style: styles.mainHeader}],
  [],
  [{value: (new DateOnly(+date)).toLocalDate(), style: styles.mainHeader}],
  [],
  []
]

const getDataSet = attendance => {
  const dataSet = [];
  let i = 1;
  for (const a of attendance) {
    dataSet.push({
      serial: i,
      fullName: a.fullName,
      isAttended: a.isAttended
    });
    ++i;
  }
  
  return dataSet;
}

const saveAttendanceSheet = (attendance, date, school) =>
  new Promise(async(resolve, reject) => {

    const report = excel.buildExport(
      [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
        {
          name: (new DateOnly(+date).toLocalDate()), // <- Specify sheet name (optional)
          heading: getHeader(date, school), // <- Raw heading array (optional)
          merges: merges, // <- Merge cell ranges
          specification: specification, // <- Report specification
          data: getDataSet(attendance) // <-- Report data
        }
      ]
    );

    const fileName = await getNewFileName(date);
    fs.writeFile(`sheets/${fileName}.xlsx`, report, err => {
      if (err) {
        reject(err);
      } else {
        resolve(`sheets/${fileName}.xlsx`);
      }
    });
});

module.exports = {
  saveAttendanceSheet
}
