const Family = require('../models/Family');
const User = require('../models/User');
const Child = require('../models/Child');
const JoinCode = require('../models/JoinCode');
const ValidationError = require('../errors/ValidationError');
const errors = require('../errors/types');
const NotFoundError = require('../errors/NotFoundError');
const mongoose = require('../utils/database');

const Fawn = require('fawn');
const _ = require('lodash');

module.exports = {
    index: async(req, res) => {
        const familyId = req.params.familyId;
        const children = await Child.find({family: familyId}).exec();

        res.send(children.map(child => child.toJSON()));
    },

    store: async(req, res) => {
        const familyId = req.params.familyId;
        const props = _.pick(req.body, ['name', 'birthdate', 'role']);
        const {fullName, schoolId} = req.body;
        props.family = new mongoose.Types.ObjectId(familyId);
        
        let child = new Child(props);
        const family = await Family.findById(familyId).exec();
        if (!family) {
            throw new NotFoundError('family', familyId);
        }

        const task = new Fawn.Task();
        if (fullName && schoolId) {
            await child.setSchool(schoolId, fullName, task);
        }
        task.save('child', child);
        task.update('families', {_id: familyId}, {
            $push: {children: child._id}
        });
        await task.run({useMongoose: true});

        child = await Child.findById(child._id).populate('family').exec();
        res.send(child.toJSON());
    }
}
