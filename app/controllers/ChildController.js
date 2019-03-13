const Child = require('../models/Child');
const errors = require('../errors/types');
const config = require('config');
const {
    getBetweenQuery,
    parseInt
} = require('../utils/utils');
const mongoose = require('../utils/database');
const Fawn = require('fawn');

const _ = require('lodash');

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
    }
}
