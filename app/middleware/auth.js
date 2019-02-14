const { verifyToken } = require('../utils/jwt');
const { isParent } = require('../utils/utils');
const AuthenticationError = require('../errors/AuthenticationError');
const ForbiddenError = require('../errors/ForbiddenError');
const errors = require('../errors/types');

const User = require('../models/User');
const Child = require('../models/Child');
const Family = require('../models/Family');

// Groups: Specify what groups of users are accepted (Pending, Normal, Admin)
// If no groups provided, all users are blocked
// Allow Children: allow children to access route
const checkAuth = (groups, allowChildren) => {
    return async (req, res, next) => {
        const authHeader = req.header('Authorization');
        if (!authHeader || authHeader.length < 8) {
            throw AuthenticationError.missingToken();
        }

        const token = authHeader.substr(7);
        const decoded = await verifyToken(token);
        if (decoded.role === 'father' || decoded.role === 'mother') {
            // Add user object to request, so any function can access it
            // To get user, use req.user()
            const user = await User.findById(decoded._id).exec();
            req.user = async () => user;

            req.userId = decoded._id;
            req.refreshTokenId = decoded.refreshTokenId;

            if (!groups || !groups.length) {
                throw new ForbiddenError();
            }

            const group = user.group;
            if (!groups.includes(group)) {
                throw new ForbiddenError();
            }
        } else {
            const child = await Child.findById(decoded._id).exec();
            req.user = async () => child;

            if (!allowChildren) {
                throw new ForbiddenError();
            }
        }
        next();
    }
}

const checkRefreshToken = async (req, res, next) => {
    if (!req.body || !req.body.refreshToken) {
        throw AuthenticationError.missingRefreshToken();
    }

    const refreshToken = req.body.refreshToken;
    let decoded = null;
    try {
        decoded = await verifyToken(refreshToken);
    } catch (err) {
        throw AuthenticationError.invalidRefreshToken();
    }

    // Check if client is parent or child
    if (isParent(decoded)) {
        const user = await User.findById(decoded._id).exec();
        req.user = async () => user;

        const tmpUser = await User.findOne({
            _id: user._id,
            'refreshTokens._id': decoded.refreshTokenId
        }).select('_id').exec();
        
        if (!tmpUser) {
            throw AuthenticationError.invalidRefreshToken();
        }

        req.userId = decoded._id;
        req.refreshTokenId = decoded.refreshTokenId;
    } else {
        const child = await Child.findById(decoded._id);
        req.user = async () => child;

        const tmpChild = Child.findOne({
            _id: child._id,
            'refreshTokens._id': decoded.refreshTokenId
        }).select('_id').exec();

        if (!tmpChild) {
            throw AuthenticationError.invalidRefreshToken();
        }

        req.userId = decoded._id;
        req.refreshTokenId = decoded.refreshTokenId;
    }
    next();
}

// Checks that userId (some parameter sent by client) is the same as the current login user
// payload => Specify how user sent (userId) value, may be (params, body or query)
const sameUserId = (allowAdmin = true, payload = 'params') => async (req, res, next) => {
    const user = await req.user();
    if (allowAdmin && user.group === 'admin') {
        next();
    }
    
    if (+req[payload].userId !== user._id) {        
        throw new ForbiddenError(
            errors.ACTION_OF_ANOTHER_USER,
            'You are trying to do action by the name of other user'
        );
    }
    next();
}

// Checks that current user is parent in family that sent as (familyId)
// payload => Specify how user sent (family) value, may be (params, body or query)
const parentInFamily = (allowAdmin = true, payload = 'params') => async (req, res, next) => {
    const user = await req.user();
    if (allowAdmin && user.group === 'admin') {
        next();
    }

    const familyId = req[payload].familyId;
    const family = await Family.findById(familyId).exec();
    if (!family.father.equals(user._id) && !family.mother.equals(user._id)) {
        throw new ForbiddenError(
            errors.NOT_PARENT_IN_FAMILY,
            'You are trying to modify other family'
        );
    }
    next();
}

const parentOfChild = (allowAdmin = true, payload = 'params') => async (req, res, next) => {
    const user = await req.user();
    if (allowAdmin && user.group === 'admin') {
        next();
    }

    const childId = req[payload].childId;
    const family = Family.findOne({
        $and: [
            { $or: [ {father: user._id}, {mother: user._id} ] },
            { children: childId }
        ]
    });
    
    if (!family) {
        throw new ForbiddenError(
            errors.NOT_PARENT_OF_CHILD,
            'You are trying to access child not of you'
        );
    }
    next();
}

module.exports = {
    onlyChildren: checkAuth(null, true),
    onlyPendings: checkAuth(['pending'], false),    
    onlyNormals: checkAuth(['normal'], false),    
    onlyAdmins: checkAuth(['admin'], false),
    normalOrAdmin: checkAuth(['admin', 'normal'], false),
    exceptPendings: checkAuth(['admin', 'normal'], true),
    allowAll: checkAuth(['admin', 'normal', 'pending'], true),
    evenBlocked: checkAuth(['admin', 'normal', 'pending', 'blocked'], true),
    checkRefreshToken,
    sameUserId,
    parentInFamily,
    parentOfChild
}
