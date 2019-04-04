const Child = require('../models/Child');
const LoginCode = require('../models/LoginCode');
const ValidationError = require('../errors/ValidationError');
const errors = require('../errors/types');
const config = require('config');
const {
    getBetweenQuery,
    parseInt
} = require('../utils/utils');
const mongoose = require('../utils/database');
const Fawn = require('fawn');

const _ = require('lodash');
const {timeAfter} = require('../utils/utils');
const {generateCode} = require('../utils/codeGenerators');

module.exports = {
    index: async(req, res) => {
        const filter = {};
        let {name, role, pointsMin, pointsMax} = req.query;
        if (name) {
            filter.name = {$regex: `.*${name}.*`};
        }
        if (role) {
            filter.role = role;
        }
        if (getBetweenQuery(pointsMin, pointsMax)) {
            filter.points = getBetweenQuery(pointsMin, pointsMax);
        }

        const perPage = config.get('itemsPerPage');
        const page = parseInt(req.query.page, 1, false);
        
        const results = await Child.paginate(filter, {
            customLabels: {docs: 'data'},
            page,
            limit: perPage
        });
        
        res.send(results);
    },

    show: async(req, res) => {
        const childId = req.params.childId;
        const child = await Child.findById(childId).populate('family').exec();
        res.send(child.toJSON());
    },

    update: async(req, res) => {
        const childId = req.params.childId;
        const props = _.pick(req.body, ['name', 'role']);
        
        const newChild = await Child.findByIdAndUpdate({_id: childId}, {
            $set: {...props}
        }, { runValidators: true, context: 'query', new: true})
        .populate('family').exec();
        res.send(newChild.toJSON());
    },

    destroy: async(req, res) => {
        const {childId} = req.params;
        const child = await Child.findById(childId).exec();

        const incFamilyPoints = child.points? -child.points : 0;
        const task = new Fawn.Task();
        task.remove('child', {_id: new mongoose.Types.ObjectId(childId)});
        task.update('families', {_id: new mongoose.Types.ObjectId(child.family)}, {
            $pull: {children: new mongoose.Types.ObjectId(childId)},
            $inc: {points: incFamilyPoints}
        });
        task.remove('dayactivities', {child: new mongoose.Types.ObjectId(childId)});
        await task.run({useMongoose: true});
        res.send();
    },

    logout: async(req, res) => {
        const {childId} = req.params;
        await Child.update({_id: childId}, {
            $set: { refreshTokens: [] }
        });
        res.send({
            message: 'Logged out from all sessions'
        });
    },

    generateLoginCode: async(req, res) => {
        const childId = req.params.childId;

        // May there is already LoginCode generated since a short time
        const loginCodeTTL = config.get('childLoginCodeTTL');
        const codeThreshold = timeAfter(0.25*loginCodeTTL);

        await LoginCode.deleteMany({
            child: childId,
            expAt: {$lte: codeThreshold}
        });

        const prevLoginCode = await LoginCode.findOne({
            child: childId,
            expAt: {$gt: codeThreshold}
        });
        
        if (prevLoginCode) {
            return res.send(prevLoginCode.toJSON());
        }

        for (let i = 0;i < 1000;++i) {
            const code = await generateCode(6);
            let loginCode = await LoginCode.find({code}).exec();

            if (loginCode && loginCode.expAt > (new Date())) {
                continue;
            }
            if (loginCode) {
                await LoginCode.deleteOne({code});
            }

            loginCode = new LoginCode({
                code,
                expAt: timeAfter(loginCodeTTL),
                child: new mongoose.Types.ObjectId(childId)
            });
            await loginCode.save();
            return res.send(loginCode.toJSON());
        }
        throw new Error('Failed to Generate Login Code');
    }
}
