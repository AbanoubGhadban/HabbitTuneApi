const Jimp = require('jimp');
const ValidationError = require('../errors/ValidationError');
const types = require('../errors/types');
const crypto = require('crypto');
const fupload = require('express-fileupload');
const fs = require('fs');

const dirs = ['imgs', 'imgs/users', 'imgs/children', 'imgs/families', 'imgs/schools',
'imgs/users/thumb', 'imgs/children/thumb', 'imgs/families/thumb', 'imgs/schools/thumb'];

for (const dir of dirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

const fileUpload = fupload({
  limits: { fileSize: 10 * 1024 * 1024 },
  limitHandler: (req, res, next) => {
    next(ValidationError.from(
      'photo', null, types.EXCEEDED_MAX_IMAGE_SIZE
    ));
  }
});

const imageUpload = directory => async(req, res, next) => {
  const photo = req.files.photo;
  if (!photo) {
    return next();
  }

  const fileName = crypto.pseudoRandomBytes(16).toString('hex');
  await Jimp.read(photo.data)
  .then(img => {
    const aspectRatio = img.bitmap.width/img.bitmap.height;
    if (aspectRatio > 2 || aspectRatio < .5) {
      throw ValidationError.from('photo', null, types.INVALID_IMAGE_ASPECT_RATIO);
    }

    if (img.bitmap.width <= 1600 && img.bitmap.height <= 1600) {
      return img.write(`imgs/${directory}/${fileName}.jpg`);
    }

    if (img.bitmap.width > img.bitmap.height) {
      return img.resize(1600, Jimp.AUTO)
      .quality(60)
      .write(`imgs/${directory}/${fileName}.jpg`);
    } else {
      return img.resize(Jimp.AUTO, 1600)
      .quality(60)
      .write(`imgs/${directory}/${fileName}.jpg`);
    }
  });

  await Jimp.read(photo.data)
  .then(img => {
    if (img.bitmap.width > img.bitmap.height) {
      return img.resize(128, Jimp.AUTO)
      .quality(60)
      .write(`imgs/${directory}/thumb/${fileName}.jpg`);
    } else {
      return img.resize(Jimp.AUTO, 128)
      .quality(60)
      .write(`imgs/${directory}/thumb/${fileName}.jpg`);
    }
  });
  req.photoPath = `${fileName}.jpg`;
  return next();
}

module.exports = {
  fileUpload,
  childrenStorage: imageUpload('children'),
  familiesStorage: imageUpload('families'),
  schoolsStorage: imageUpload('schools'),
  usersStorage: imageUpload('users')
}
