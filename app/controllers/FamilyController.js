const Family = require('../models/Family');
const User = require('../models/User');
const Child = require('../models/Child');
const NotFoundError = require('../errors/NotFoundError');
const errors = require('../errors/types');
const JoinCode = require('../models/JoinCode');
const ValidationError = require('../errors/ValidationError');
const ForbiddenError = require('../errors/ForbiddenError');
const Fawn = require('fawn');
const mongoose = require('../utils/database');

const _ = require('lodash');
const config = require('config');
const {timeAfter, getBetweenQuery, parseInt} = require('../utils/utils');

const {
    generateCode
} = require('../utils/codeGenerators');
const {familyStorage} = require('../utils/storage');

module.exports = {
    index: async(req, res) => {
        const filter = {};
        let {name, status, pointsMin, pointsMax} = req.query;
        if (name) {
            filter.name = {$regex: `.*${name}.*`};
        }
        if (status) {
            filter.status = status;
        }
        if (getBetweenQuery(pointsMin, pointsMax)) {
            filter.points = getBetweenQuery(pointsMin, pointsMax);
        }

        const perPage = config.get('itemsPerPage');
        const page = parseInt(req.query.page, 1, false);
        
        const results = await Family.paginate(filter, {
            customLabels: {docs: 'data'},
            page,
            limit: perPage
        });
        
        res.send(results);
    },

    show: async(req, res) => {
        const familyId = req.params.familyId;
        const family = await Family.findById(familyId)
        .populate('children')
        .populate('parent1')
        .populate('parent2').exec();

        if (!family) {
            throw new NotFoundError('family', familyId);
        }
        res.send(family.toJSON());
    },

    update: async(req, res) => {
        const familyId = req.params.familyId;
        const props = _.pick(req.body, ['name', 'status']);

        const family = await Family.findByIdAndUpdate(familyId, {
            $set: {...props}
        }, { runValidators: true, context: 'query', new: true})
        .populate('children').populate('parent1').populate('parent2').exec();
        res.send(family.toJSON());
    },

    setProfilePicture: async(req, res) => {
        const {familyId} = req.params;
        const {photoPath} = req;
        const family = await Family.findById(familyId).exec();

        if (photoPath) {
            family.photo = photoPath;
            await family.save();
            res.send(family.toJSON());
        } else {
            family.photo = undefined;
            await family.save();
            res.send(family.toJSON());
        }
    },

    generateJoinCode: async (req, res) => {
        const familyId = req.params.familyId;
        const family = await Family.findById(familyId).exec();

        if (family.parent1 && family.parent2) {
            throw ValidationError.bothParentsExist();            
        }

        // May there is already JoinCode generated since a short time
        const joinCodeTTL = config.get('joinCodeTTL');
        const codeThreshold = timeAfter(0.25*joinCodeTTL);

        await JoinCode.deleteMany({
            family: familyId,
            expAt: {$lte: codeThreshold}
        }).exec();
        
        const prevJoinCode = await JoinCode.findOne({
            family: familyId,
            expAt: {$gt: codeThreshold}
        });
        
        if (prevJoinCode) {
            return res.send(prevJoinCode.toJSON());
        }

        for (let i = 0;i < 1000;++i) {
            const code = await generateCode(6);
            let joinCode = await JoinCode.find({code}).exec();

            if (joinCode && joinCode.expAt > (new Date())) {
                continue;
            }
            if (joinCode) {
                await JoinCode.deleteOne({code});
            }

            joinCode = new JoinCode({
                code,
                expAt: timeAfter(joinCodeTTL),
                family: new mongoose.Types.ObjectId(familyId)
            });
            await joinCode.save();
            return res.send(joinCode.toJSON());
        }
        throw new Error('Failed to Generate Join Code');
    },

    addParent: async(req, res) => {
        const familyId = req.params.familyId;
        const userId = req.params.userId;
        const family = await Family.findById(familyId)
        .populate('parent1').populate('parent2').exec();
        const user = await User.findById(userId).exec();

        if (family.hasParent(userId)) {
            throw ValidationError.from('userId', userId, errors.PARENT_ALREADY_EXISTS_AT_FAMILY);
        }

        if (family.parent1 || family.parent2) {
            if (family.parent1 && family.parent2) {
                throw ValidationError.from('userId', userId, errors.ROLE_ALREADY_EXISTS);
            }
            const currentParent = family.parent1 || family.parent2;
            if (currentParent.role === user.role) {
                throw ValidationError.from('userId', userId, errors.ROLE_ALREADY_EXISTS);
            }
        }

        if (user.role === 'mother' && user.families.length > 0) {
            throw ValidationError.from('userId', userId, errors.MOTHER_ALREADY_BELONG_TO_FAMILY);
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

        const newFamily = await Family.findById(familyId)
        .populate('parent1').populate('parent2')
        .populate('children').exec();
        res.send(newFamily.toJSON());
    },

    destroy: async(req, res) => {
        const {familyId} = req.params;
        const task = new Fawn.Task();
        task.remove('family', {_id: new mongoose.Types.ObjectId(familyId)});
        task.remove('child', {family: new mongoose.Types.ObjectId(familyId)});
        task.remove('dayactivities', {family: new mongoose.Types.ObjectId(familyId)});
        await task.run({useMongoose: true});
        res.send();
    }
}
