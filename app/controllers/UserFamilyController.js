const Family = require('../models/Family');
const User = require('../models/User');
const JoinCode = require('../models/JoinCode');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const errors = require('../errors/types');
const ForbiddenError = require('../errors/ForbiddenError');
const mongoose = require('../utils/database');

const Fawn = require('fawn');
const _ = require('lodash');

module.exports = {
    index: async(req, res) => {
        const userId = req.params.userId;
        const user = await User.findById(userId).populate('families').exec();

        res.send(user.toJSON().families);
    },

    store: async(req, res) => {
        const userId = req.params.userId;
        const user = await User.findById(userId).populate('families').exec();

        if (!user) {
            throw new NotFoundError('user', userId);
        }
        
        if (user.role === 'mother' && user.families.length > 0) {
            throw ValidationError.from('userId', userId, errors.MOTHER_ALREADY_BELONG_TO_FAMILY);
        }

        let family = new Family({
            parent1: userId,
            name: req.body.name
        });

        const task = new Fawn.Task();
        task.save('families', family);
        task.update('users', {_id: userId}, {
            $push: {families: new mongoose.Types.ObjectId(family._id)}
        });
        await task.run({useMongoose: true});
        
        family = await Family.findById(family._id).populate('parent1').exec();
        res.send(family.toJSON());
    },

    join: async(req, res) => {
        const userId = req.params.userId;
        const code = req.body.code;

        let user = await User.findById(userId).exec();
        const joinCode = await JoinCode.findOne({
            code,
            expAt: {$gt: new Date()}
        }).populate('family').exec();

        if (!joinCode) {
            throw ValidationError.invalidJoinCode(code);
        }

        const family = joinCode.family;
        if (user.role === 'mother' && user.families.length > 0) {
            throw ValidationError.from('userId', userId, errors.MOTHER_ALREADY_BELONG_TO_FAMILY);
        }

        if (family.parent1 && family.parent2) {
            throw ValidationError.from('userId', userId, errors.ROLE_ALREADY_EXISTS);
        }

        if ((family.parent1 && family.parent1.role === user.role) ||
            (family.parent2 && family.parent2.role === user.role)) {
            throw ValidationError.from('userId', userId, errors.ROLE_ALREADY_EXISTS);
        }

        const parentField = family.parent1? 'parent2' : 'parent1';
        const task = new Fawn.Task();
        task.update('users', {_id: userId}, {
            $push: {families: family._id}
        });
        task.update('families', {_id: family._id}, {
            $set: {[parentField]: user._id}
        });
        task.update('attendance', {family: family._id}, {
            $set: {[parentField]: user._id}
        });
        await task.run({useMongoose: true});

        user = await User.findById(userId).populate('families').exec();
        res.send(user.toJSON());
    },

    leave: async(req, res) => {
        const {userId, familyId} = req.params;
        const family = await Family.findById(familyId).exec();

        if (!family.parent1 || !family.parent2) {
            throw ValidationError.from('userId', userId, errors.REMOVING_THE_ONLY_PARENT_OF_FAMILY);
        }

        const parentField = family.parent1.equals(userId)? 'parent1' : 'parent2';
        const task = new Fawn.Task();
        task.update('users', {_id: new mongoose.Types.ObjectId(userId)}, {
            $pull: {families: new mongoose.Types.ObjectId(familyId)}
        });
        task.update('families', {_id: mongoose.Types.ObjectId(familyId)}, {
            $unset: {[parentField]: ""}
        });
        task.update('attendance', {family: mongoose.Types.ObjectId(familyId)}, {
            $unset: {[parentField]: ""}
        });
        await task.run({useMongoose: true});

        const user = await User.findById(userId).populate('families').exec();
        res.send(user.toJSON());
    }
}
