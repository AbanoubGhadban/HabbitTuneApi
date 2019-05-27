const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const config = require('config');
const appUrl = config.get('app.url');
const {callbackToPromise} = require('./utils');

const getStorage = directory => {
  return multer.diskStorage({
    destination: `imgs/${directory}`,
    filename: function (req, file, callback) {
      crypto.pseudoRandomBytes(16, function(err, raw) {
        if (err) return callback(err);
        callback(null, raw.toString('hex') + path.extname(file.originalname));
      });
    }
  });
}

const createThumbnail = async(sourcePath, destPath) => {
  const thumbDir = path.dirname(destPath);
  if (!(await callbackToPromise(fs.exists, true, thumbDir))) {
    await callbackToPromise(fs.mkdir, false, thumbDir);
  }
  
  return callbackToPromise(fs.copyFile, false, sourcePath, destPath);
}

const userStorage = {
  storageOptions: getStorage('users'),
  
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
  },

  createThumbnail: (fileName) => {
    const filePath = userStorage.getFilePath(fileName);
    const thumbPath = userStorage.getThumbPath(fileName);
    return createThumbnail(filePath, thumbPath);
  }
}

const childStorage = {
  storageOptions: getStorage('children'),
  
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
  },

  createThumbnail: (fileName) => {
    const filePath = childStorage.getFilePath(fileName);
    const thumbPath = childStorage.getThumbPath(fileName);
    return createThumbnail(filePath, thumbPath);
  }
}

const familyStorage = {
  storageOptions: getStorage('families'),
  
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
  },

  createThumbnail: (fileName) => {
    const filePath = familyStorage.getFilePath(fileName);
    const thumbPath = familyStorage.getThumbPath(fileName);
    return createThumbnail(filePath, thumbPath);
  }
}

const schoolStorage = {
  storageOptions: getStorage('schools'),
  
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
  },

  createThumbnail: (fileName) => {
    const filePath = schoolStorage.getFilePath(fileName);
    const thumbPath = schoolStorage.getThumbPath(fileName);
    return createThumbnail(filePath, thumbPath);
  }
}

module.exports = {
  userStorage,
  childStorage,
  familyStorage,
  schoolStorage
};