const path = require('path');
const config = require('config');
const appUrl = config.get('app.url');

const userStorage = {
  getFilePath: fileName => {
    return path.join('imgs', 'users', fileName);
  },

  getFileUrl: fileName => {
    return (new URL(userStorage.getFilePath(fileName), appUrl)).toString();
  },

  getThumbPath: fileName => {
    return path.join('imgs', 'users', 'thumb', fileName);
  },

  getThumbUrl: fileName => {
    return (new URL(userStorage.getThumbPath(fileName), appUrl)).toString();
  }
}

const childStorage = {
  getFilePath: fileName => {
    return path.join('imgs', 'children', fileName);
  },

  getFileUrl: fileName => {
    return (new URL(childStorage.getFilePath(fileName), appUrl)).toString();
  },

  getThumbPath: fileName => {
    return path.join('imgs', 'children', 'thumb', fileName);
  },

  getThumbUrl: fileName => {
    return (new URL(childStorage.getThumbPath(fileName), appUrl)).toString();
  }
}

const familyStorage = {
  getFilePath: fileName => {
    return path.join('imgs', 'families', fileName);
  },

  getFileUrl: fileName => {
    return (new URL(familyStorage.getFilePath(fileName), appUrl)).toString();
  },

  getThumbPath: fileName => {
    return path.join('imgs', 'families', 'thumb', fileName);
  },

  getThumbUrl: fileName => {
    return (new URL(familyStorage.getThumbPath(fileName), appUrl)).toString();
  }
}

const schoolStorage = {
  getFilePath: fileName => {
    return path.join('imgs', 'schools', fileName);
  },

  getFileUrl: fileName => {
    return (new URL(schoolStorage.getFilePath(fileName), appUrl)).toString();
  },

  getThumbPath: fileName => {
    return path.join('imgs', 'schools', 'thumb', fileName);
  },

  getThumbUrl: fileName => {
    return (new URL(schoolStorage.getThumbPath(fileName), appUrl)).toString();
  }
}

module.exports = {
  userStorage,
  childStorage,
  familyStorage,
  schoolStorage
};