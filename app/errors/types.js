module.exports = {
    UNIQUE_VIOLATION: 'unique violation',
    MISSING_TOKEN: 'MISSING_TOKEN',
    MISSING_REFRESH_TOKEN: 'MISSING_REFRESH_TOKEN',
    INVALID_TOKEN: 'INVALID_TOKEN',
    INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',
    // invalid username or password
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

    // Validation Error
    END_DATE_BEFORE_START_DATE: "END_DATE_BEFORE_START_DATE",

    INVALID_ACTIVATION_CODE: 'INVALID_ACTIVATION_CODE',
    INVALID_JOIN_CODE: 'INVALID_ACTIVATION_CODE',

    ACTION_OF_ANOTHER_USER: 'ACTION_OF_ANOTHER_USER',
    NOT_PARENT_IN_FAMILY: 'NOT_PARENT_IN_FAMILY',
    NOT_PARENT_OF_CHILD: 'NOT_PARENT_OF_CHILD',

    // When parent tries to add activities of day not today
    ACTIVITY_DATE_PASSED: 'ACTIVITY_DATE_PASSED',

    BOTH_PARENTS_EXIST: 'BOTH_PARENTS_EXIST',
    // When father try to join family already having father
    // Or mother try to join family already having mother
    // Or updating role of user
    ROLE_ALREADY_EXISTS: 'ROLE_ALREADY_EXISTS',
    MOTHER_ALREADY_BELONG_TO_FAMILY: 'MOTHER_ALREADY_BELONG_TO_FAMILY',
    USER_HAVING_MORE_THAN_ONE_FAMILY: 'USER_HAVING_MORE_THAN_ONE_FAMILY',
    // trying to remove user from family
    //and family is having one parent who is the user
    REMOVING_THE_ONLY_PARENT_OF_FAMILY: 'REMOVING_THE_ONLY_PARENT_OF_FAMILY'
};