export const USERS_MESSAGES = {
	VALIDATION_ERROR: 'Validation error',
	NAME_IS_REQUIRED: 'Name is required',
	NAME_MUST_BE_A_STRING: 'Name must be a string',
	NAME_LENGTH_MUST_BE_FROM_5_TO_50: 'Name length must be from 5 to 50',
	EMAIL_ALREADY_EXISTS: 'Email already exists',
	EMAIL_MUST_BE_A_STRING: 'Email must be a string',
	EMAIL_IS_REQUIRED: 'Email is required',
	EMAIL_IS_INVALID: 'Email is invalid',
	EMAIL_LENGTH_MUST_BE_FROM_8_TO_50: 'Email length must be from 8 to 50',
	PASSWORD_IS_REQUIRED: 'Password is required',
	PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
	PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50: 'Password length must be from 8 to 50',
	PASSWORD_MUST_BE_STRONG:
		'Password must be 8-50 characters long and contains at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 symbol',
	CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
	CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
	CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50: 'Confirm password length must be from 8 to 50',
	CONFIRM_PASSWORD_MUST_BE_STRONG:
		'Confirm password must be 8-50 characters long and contains at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 symbol',
	CONFIRM_PASSWORD_MUST_BE_NOT_DIFFERENT_FROM_PASSWORD: 'Confirm password must be not different from password',
	DATE_OF_BIRTH_IS_REQUIRED: 'Date of birth is required',
	DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth must be ISO8601',
	EMAIL_OR_PASSWORD_IS_INCORECT: 'Email or password is incorrect',
	LOGIN_SUCCESS: 'Login success',
	REGISTER_SUCCESS: 'Register success'
} as const
