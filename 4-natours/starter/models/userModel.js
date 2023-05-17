const crypto = require('crypto');
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
	role: {
		type: String,
		enum: ['user', 'guide', 'lead-guide', 'admin'],
		default: 'user'
	},
	password: {
		type: String,
		required: [true, 'User must have a password'],
		minlength: 8,
		select: false
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
	},
	passwordChangedAt: { type: Date },
	passwordResetToken: String,
	passwordResetExpires: Date,
	active: {
		type: Boolean,
		default: true,
		select: false
	}
});

userSchema.pre('save', async function(next) {

	// only run this function if password was actually modified
	if(!this.isModified('password')) return next();

	// hash the password with the cost of 12
	this.password = await bcrypt.hash(this.password, 12);

	// Delete the passwordConfirm
	this.passwordConfirm = undefined;
	next();
});

userSchema.pre('save', function(next) {
	if(!this.isModified('password') || this.isNew ) return next();
	this.passwordChangedAt = Date.now() - 1000 ;
	next();
});
userSchema.pre(/^find/, function(next) {
	// this points to the current query
	this.find({ active: { $ne: false }});
	next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};


userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
	if(this.passwordChangedAt) {
		const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
		return JWTTimestamp < changedTimestamp; // 100 < 200 
	}

	// false mean - not change
	return false;
};

userSchema.methods.createPasswordResetToken = function() {
	const resetToken = crypto.randomBytes(32).toString('hex');
	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	console.log({resetToken}, this.passwordResetToken);

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
	return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;