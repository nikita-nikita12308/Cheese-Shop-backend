const mongoose = require('mongoose')
const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcryptjs')

// name, email, photo, password, passwordConfirm
const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'User must have a name'],
		trim: true,
		maxlength: [30, 'A user name must have less or equal then 30 characters'],
		minlength: [5, 'A user name must have more or equal then 5 characters']
	},
	email: {
		type: String,
		required: [true, 'User must have email'],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, 'Provide a valid email']
	},
	photo: String,
	password: {
		type: String,
		required: [true, 'User must have a password'],
		minlength: 8
	},
	passwordConfirm: {
		type: String,
		required: [true, 'Please confirm your password'],
		validate: {
			// THIS ONLY WORKS ON SAVE
			validator: function(el) {
				return el === this.password;
			},
		message: 'Passwords are not the same!'
		}
	}
})

userSchema.pre('save', async function(next) {

	// only run this function if password was actually modified
	if(!this.isModified('password')) return next();

	// hash the password with the cost of 12 
	this.password = await bcrypt.hash(this.password, 12);

	// Delete the passwordConfirm
	this.passwordConfirm = undefined;
	next();
})

const User = mongoose.model('User', userSchema);
module.exports = User;