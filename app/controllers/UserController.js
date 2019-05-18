const Family = require('../models/Family');
const User = require('../models/User');
const Child = require('../models/Child');
const JoinCode = require('../models/JoinCode');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const errors = require('../errors/types');
const mongoose = require('../utils/database');

const _ = require('lodash');
const config = require('config');
const bcrypt = require('bcrypt');
const Fawn = require('fawn');
const {parseInt, timeAfter} = require('../utils/utils');
const {userStorage} = require('../utils/storage');
const types = require('../errors/types');
const {sendPhoneCode} = require('../utils/sms');
const {generateCode} = require('../utils/codeGenerators');

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

    showUserInfo: async(req, res) => {
        const user = await req.user();
        res.send(user.toJSON());
    },

    showByPhone: async(req, res) => {
        const {phone} = req.params;
        const user = await User.findOne({phone}).populate('families').exec();

        if (!user) {
            throw new NotFoundError('user', phone);
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
    },

    setProfilePicture: async(req, res) => {
        const {userId} = req.params;
        const user = await User.findById(userId).exec();
        if (req.file) {
            const fileName = req.file.filename;
            await userStorage.createThumbnail(fileName);
            user.photo = fileName;
            await user.save();
            res.send(user.toJSON());
        } else {
            user.photo = undefined;
            await user.save();
            res.send(user.toJSON());
        }
    },

    destroy: async(req, res) => {
        const {userId} = req.params;
        const user = await User.findById(userId).populate('families').exec();
        for (const family of user.families) {
            if (family.hasParent(userId) && !family.hasBothParents()) {
                throw ValidationError.from('userId', userId, errors.DELETE_ONLY_PARENT_OF_FAMILY);
            }
        }

        const task = new Fawn.Task();
        task.remove('users', {_id: new mongoose.Types.ObjectId(userId)});
        task.update('families', {parent1: new mongoose.Types.ObjectId(userId)}, {
            $unset: {parent1: ""}
        });
        task.update('families', {parent2: new mongoose.Types.ObjectId(userId)}, {
            $unset: {parent2: ""}
        });
        task.update('dayactivities', {parent: new mongoose.Types.ObjectId(userId)}, {
            $unset: {parent: ""}
        });
        await task.run({useMongoose: true});
        res.send();
    },
    
    logout: async(req, res) => {
        const {userId} = req.params;
        await User.update({_id: userId}, {
            $set: { refreshTokens: [] }
        });
        res.send({
            message: 'Logged out from all sessions'
        });
    },

    updateName: async(req, res) => {
        const {userId} = req.params;
        const {name} = req.body;

        const newUser = await User.findByIdAndUpdate(userId, {
            $set: {name}
        }, {new: true}).populate('families').exec();

        res.send(newUser.toJSON());
    },

    updatePassword: async(req, res) => {
        const {userId} = req.params;
        const {password, oldPassword} = req.body;
        const user = await User.findById(userId).select("+password").exec();

        if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
            throw ValidationError.from('oldPassword', null, types.WRONG_PASSWORD);
        }

        const salt = await bcrypt.genSalt();
        const newUser = await User.findByIdAndUpdate(userId, {
            $set: {
                password: await bcrypt.hash(password, salt)
            }
        }, {new: true}).populate('families').exec();

        res.send(newUser.toJSON());
    },

    getPhoneCode: async(req, res) => {
        const {userId} = req.params;
        const {phone} = req.body;

        const tmpUser = await User.findOne({phone}).exec();
        if (tmpUser) {
            throw ValidationError.from('phone', phone, types.UNIQUE_VIOLATION);
        }
        
        const user = await User.findById(userId).select('+phoneCodes').exec();
        const phoneCodeTTL = +config.get('phoneCodeTTL');

        // Ensure that no codes sent since two minutes
        const expectedTime = timeAfter(phoneCodeTTL - 2*60);
        if (user.phoneCodes) {
            for (const code of user.phoneCodes) {
                if (code.expAt > expectedTime) {
                    return res.send({
                        status: "not sent",
                        message: "You can only send message every 2 minutes"
                    });
                }
            }
        }
        
        const code = await generateCode(6);
        user.phoneCodes.push({
            code,
            phone,
            expAt: timeAfter(phoneCodeTTL)
        });

        await user.save();
        await sendPhoneCode(user, code);

        res.send({
            status: "sent"
        });
    },

    updatePhone: async(req, res) => {
        const {userId} = req.params;
        const {code} = req.body;

        const user = await User.findOne({
            _id: userId,
            'phoneCodes.code': code,
            'phoneCodes.expAt': { $gt: new Date() }
        }).select("+phoneCodes").exec();

        const codeObj = user && Array.isArray(user.phoneCodes)
        ? user.phoneCodes.find(c => c.code === code && c.expAt > new Date())
        : null;
        
        if (!user || !codeObj) {
            throw ValidationError.invalidPhoneCode(code);
        } 

        const newUser = await User.findByIdAndUpdate({_id: userId}, {
            $set: {phone: codeObj.phone},
            $unset: {phoneCodes: ''}
        }, {new: true});
        res.send(newUser.toJSON());
    }
};
