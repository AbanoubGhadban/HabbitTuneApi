const Family = require('./Family');
const User = require('./User');
const Child = require('./Child');
const RegistrationToken = require('./RegistrationToken');
const ActivationCode = require('./ActivationCode');
const JoinCode = require('./JoinCode');
const ChildLoginCode = require('./ChildLoginCode');
const RefreshToken = require('./RefreshToken');

// Child Relationships
Child.hasMany(ChildLoginCode, {
    foreignKey: {
        name: 'childId',
        allowNull: false
    },
    as: 'ChildLoginCodes',
    onDelete: 'CASCADE'    
});

Child.hasMany(RegistrationToken, {
    constraints: false,
    foreignKey: 'clientId',
    scope: {
        clientType: 'child'
    },
    as: 'RegistrationTokens'
});

Child.hasMany(RefreshToken, {
    constraints: false,
    foreignKey: 'clientId',
    scope: {
        clientType: 'child'
    },
    as: 'RefreshTokens'
});


// Family Relationships
Family.hasMany(Child, {
    foreignKey: {
        name: 'familyId',
        allowNull: false
    },
    onDelete: 'CASCADE'
});
Family.hasMany(JoinCode, {
    foreignKey: {
        name: 'familyId',
        allowNull: false
    },
    as: 'JoinCodes',
    onDelete: 'CASCADE'
});


// RegistrationToken Relationships
RegistrationToken.belongsTo(User, {
    constraints: false,
    foreignKey: 'clientId',
    as: 'user'
});

RegistrationToken.belongsTo(Child, {
    constraints: false,
    foreignKey: 'clientId',
    as: 'child'
});


// User Relationships
User.belongsToMany(Family, {through: 'user_family'});
User.hasMany(ActivationCode, {
    foreignKey: {
        name: 'userId',
        allowNull: false
    },
    as: 'ActivationCodes',
    onDelete: 'CASCADE'
});

User.hasMany(RegistrationToken, {
    constraints: false,
    foreignKey: 'clientId',
    scope: {
        clientType: 'user'
    },
    as: 'RegistrationTokens'
});

User.hasMany(RefreshToken, {
    constraints: false,
    foreignKey: 'clientId',
    scope: {
        clientType: 'user'
    },
    as: 'RefreshTokens'
})
