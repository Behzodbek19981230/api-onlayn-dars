const Validator = require('validator')
const isEmpty = require('./isEmpty')

const validateUserLogin = data => {
	data.username = !isEmpty(data.username) ? data.username : ''

	let errors = {}

	
	if (Validator.isEmpty(data.username)) {
		errors.username = 'username field cannot empty'
	}

	if (!Validator.isLength(data.password, { min: 6 })) {
		errors.password = 'Password should be atleast 6 characters'
	}
	if (Validator.isEmpty(data.password)) {
		errors.password = 'Password field cannot empty'
	}

	return {
		errors,
		isValid: isEmpty(errors),
	}
}

module.exports = validateUserLogin
