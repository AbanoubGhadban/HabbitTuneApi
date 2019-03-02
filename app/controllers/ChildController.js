const Family = require('../models/Family');
const User = require('../models/User');
const Child = require('../models/Child');
const JoinCode = require('../models/JoinCode');
const ValidationError = require('../errors/ValidationError');
const errors = require('../errors/types');
const ForbiddenError = require('../errors/ForbiddenError');

const _ = require('lodash');

module.exports = {
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
    }
}
