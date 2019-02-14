const Family = require('../models/Family');
const User = require('../models/User');
const Child = require('../models/Child');
const JoinCode = require('../models/JoinCode');
const ValidationError = require('../errors/ValidationError');
const errors = require('../errors/types');

const _ = require('lodash');
const config = require('config');
const bcrypt = require('bcrypt');

module.exports = {
    index: async(req, res) => {
        const filter = {};
        const {name, phone, role, group} = req.query;
        if (name) {
            filter.name = {$regex: `.*${name}.*`};
        }
        if (phone) {
            filter.phone = {$like: `.*${phone}.*`}
        }
        if (role) {
            filter.role = role;
        }
        if (group) {
            filter.group = group;
        }

        const perPage = config.get('itemsPerPage');
        const page = req.query.page? req.query.page : 1;
        
        const results = await User.paginate(filter, {
            customLabels: {docs: 'data'}
        });
        
        res.send(results);
    },

    store: async(req, res) => {
        const props = _.pick(req.body, ['name', 'phone', 'role', 'group']);
        const salt = await bcrypt.genSalt();
        props.password = await bcrypt.hash(req.body.password, salt);
        
        const user = new User(props);
        await user.save();
        res.send(user.toJSON());
    },

    update: async(req, res) => {
        const userId = req.params.userId;
        const user = await User.findById(userId).exec();

        const props = _.pick(req.body, ['name', 'phone', 'role', 'group']);
        const roleChanged = props.role && props.role !== user.role;

        if (roleChanged) {
            if (props.role === 'mother') {
                const count = await Family.count({
                    $or: [{parent1: userId}, {parent2: userId}]
                }).exec();
                if (count > 1) {
                    throw ValidationError.from('role', props.role, 
                        errors.USER_HAVING_MORE_THAN_ONE_FAMILY, 'Mother can belong to only one family');
                }
            }

            const count = await Family.count({ $or: [
                { $and: [{parent1: userId}, {parent2: {$ne: null}}] },
                { $and: [{parent1: {$ne: null}}, {parent2: userId}] }
            ]}).exec();

            if (count > 0) {
                throw ValidationError.from('role', props.role, errors.ROLE_ALREADY_EXISTS);
            }
        }

        if (req.body.password) {
            const salt = await bcrypt.genSalt();
            props.password = await bcrypt.hash(req.body.password, salt);
        }
        
        const newUser = await User.findByIdAndUpdate(userId, {
            $set: {...props}
        }, {new: true});
        res.send(newUser.toJSON());
    }
};
