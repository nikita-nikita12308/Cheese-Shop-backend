const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');
const Product = require('./../../models/productModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

dotenv.config({path: './../../config.env'});

const DB = `mongodb+srv://admin:${process.env.DATABASE_PASSWORD}@cluster0.zde3rob.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(DB).then(() => {
	console.log('mongoDB connected')
});


// read json file

const tours = JSON.parse(fs.readFileSync('./tours.json', 'utf-8'));
const products = JSON.parse(fs.readFileSync('./products.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));
const reviews = JSON.parse(fs.readFileSync('./reviews.json', 'utf-8'));
// Import data into database

const importData = async () => {
	try{
		//await Tour.create(tours);
		await Product.create(products);
		await User.create(users, { validateBeforeSave: false });
		await Review.create(reviews);
		console.log('data successfuly loaded')
	}catch(err){
		console.log(err)
	}
	process.exit()
};

// delete all data from collection

const deleteData = async () => {
	try{
		//await Tour.deleteMany();
		await Product.deleteMany();
		await User.deleteMany();
		await Review.deleteMany();
		console.log('data successfuly deleted')
	}catch(err){
		console.log(err)
	}
	process.exit()
};

console.log(process.argv);
if(process.argv[2] === '--import'){
	importData()
} else if(process.argv[2] === '--delete'){
	deleteData()
}