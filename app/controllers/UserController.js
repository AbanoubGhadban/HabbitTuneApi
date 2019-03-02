const Family = require('../models/Family');
const User = require('../models/User');
const Child = require('../models/Child');
const JoinCode = require('../models/JoinCode');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const errors = require('../errors/types');

const _ = require('lodash');
const config = require('config');
const bcrypt = require('bcrypt');
const {parseInt} = require('../utils/utils');

module.exports = {
    index: async(req, res) => {
        const filter = {};
        const {name, phone, role, group} = req.query;
        if (name) {
            filter.name = {$regex: `.*${name}.*`};
        }
        if (phone) {
            filter.phone = {$regex: `.*${phone}.*`}
        }
        if (role) {
            filter.role = role;
        }
        if (group) {
            filter.group = group;
        }

        const perPage = config.get('itemsPerPage');
        const page = parseInt(req.query.page, 1, false);
        
        const results = await User.paginate(filter, {
            customLabels: {docs: 'data'},
            page,
            limit: perPage
        });
        
        res.send(results);
    },

    show: async(req, res) => {
        const userId = req.params.userId;
        const user = await User.findById(userId).populate('families').exec();

        if (!user) {
            throw new NotFoundError('user', userId);
        }
        res.send(user.toJSON());
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
        const user = await User.findById(userId).populate('families').exec();

        const props = _.pick(req.body, ['name', 'phone', 'role', 'group']);
        const roleChanged = props.role && props.role !== user.role;

        if (roleChanged) {
            if (props.role === 'mother') {
                const count = user.families.length;
                if (count > 1) {
                    throw ValidationError.from('role', props.role, 
                        errors.USER_HAVING_MORE_THAN_ONE_FAMILY, 'Mother can belong to only one family');
                }
            }

            for (const f of user.families) {
                if (f.parent1 && f.parent2) {
                    throw ValidationError.from('role', props.role, errors.ROLE_ALREADY_EXISTS);
                }
            }
        }

        if (req.body.password) {
            const salt = await bcrypt.genSalt();
            props.password = await bcrypt.hash(req.body.password, salt);
        }
        
        const newUser = await User.findByIdAndUpdate(userId, {
            $set: {...props}
        }, { runValidators: true, context: 'query', new: true}).populate('families').exec();
        res.send(newUser.toJSON());
    }
};
