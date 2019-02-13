const Family = require('../models/Family');
const User = require('../models/User');
const Child = require('../models/Child');
const JoinCode = require('../models/JoinCode');
const ValidationError = require('../errors/ValidationError');
const ForbiddenError = require('../errors/ForbiddenError');
const errors = require('../errors/types');

const sequelize = require('../utils/database');
const _ = require('lodash');
const config = require('config');
const {paginate} = require('../utils/utils');
const bcrypt = require('bcrypt');

module.exports = {
    index: async(req, res) => {
        const filter = {};
        const {name, phone, role, group, page} = req.query;
        if (name) {
            filter.name = {$like: `%${name}%`};
        }
        if (phone) {
            filter.phone = {$like: `%${phone}%`}
        }
        if (role) {
            filter.role = role;
        }
        if (group) {
            filter.group = group;
        }

        const perPage = config.get('itemsPerPage');
        const offset = page? (page - 1)*perPage : 0;
        
        const {rows, count} = await User.findAndCount({
            where: filter,
            limit: config.get('itemsPerPage'),
            offset
        });
        res.send(paginate(rows, count, offset, perPage));
    },

    store: async(req, res) => {
        const props = _.pick(req.body, ['name', 'phone', 'role', 'group']);
        const salt = await bcrypt.genSalt();
        props.password = await bcrypt.hash(req.body.password, salt);
        console.log(props);
        

        const user = await User.create(props);
        res.send(user.get({plain: true}));
    },

    update: async(req, res) => {
        const userId = req.params.userId;
        const user = await User.findOne({
            where: {id: userId},
            attributes: {
                include: [[sequelize.fn('COUNT', sequelize.col('families.id')), 'familiesCount']]
            },
            include: [{ model: Family, attributes: [] }]
        });

        const props = _.pick(req.body, ['name', 'phone', 'role', 'group']);
        const roleChanged = props.role && props.role !== user.role;

        if (roleChanged) {
            if (props.role === 'mother' && user.get('familiesCount') > 1) {
                throw ValidationError.from('role', props.role, 
                    errors.USER_HAVING_MORE_THAN_ONE_FAMILY, 'Mother can belong to only one family');
            }

            const families = await user.getFamilies({attributes: ['id']});
            for (const family of families) {
                const tempFamily = await Family.findOne({
                    where: {id: family.id},
                    attributes: [[sequelize.fn('COUNT', sequelize.col('users.id')), 'usersCount']],
                    include: [{ model: User, attributes: [] }]
                });
                
                if (tempFamily.get('usersCount') > 1) {
                    throw ValidationError.from('role', props.role, errors.ROLE_ALREADY_EXISTS);
                }
            }
        }

        if (req.body.password) {
            const salt = await bcrypt.genSalt();
            props.password = await bcrypt.hash(req.body.password, salt);
        }
        await user.update(props);
        res.send(user.get({plain: true}));
    }
};
