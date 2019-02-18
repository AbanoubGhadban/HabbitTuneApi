const Family = require('../models/Family');
const User = require('../models/User');
const Child = require('../models/Child');
const JoinCode = require('../models/JoinCode');
const ValidationError = require('../errors/ValidationError');
const errors = require('../errors/types');
const ForbiddenError = require('../errors/ForbiddenError');

const _ = require('lodash');

module.exports = {
    update: async(req, res) => {
        const childId = req.params.childId;
        const props = _.pick(['name', 'role']);
        
        const newChild = await Child.findByIdAndUpdate(childId, {
            $set: {...props}
        });
        res.send(newChild.toJSON());
    }
}
