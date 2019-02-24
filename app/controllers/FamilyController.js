const Family = require('../models/Family');
const User = require('../models/User');
const Child = require('../models/Child');
const NotFoundError = require('../errors/NotFoundError');
const JoinCode = require('../models/JoinCode');
const ValidationError = require('../errors/ValidationError');
const ForbiddenError = require('../errors/ForbiddenError');
const mongoose = require('../utils/database');

const _ = require('lodash');
const config = require('config');
const {timeAfter} = require('../utils/utils');

const {
    generateCode
} = require('../utils/codeGenerators');

module.exports = {
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

        await Family.update({
            _id: familyId
        }, {
            $set: {...props}
        });
        await module.exports.show(req, res);
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
    },
}
