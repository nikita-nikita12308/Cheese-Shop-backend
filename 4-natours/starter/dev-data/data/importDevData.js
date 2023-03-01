const fs = require('fs')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const Tour = require('./../../models/tourModel')

dotenv.config({path: './../../config.env'});

const DB = `mongodb+srv://admin:${process.env.DATABASE_PASSWORD}@cluster0.zde3rob.mongodb.net/?retryWrites=true&w=majority`

mongoose.connect(DB).then(() => {
	console.log('mongoDB connected')
})


// read json file

const tours = JSON.parse(fs.readFileSync('./tours-simple.json', 'utf-8'));

// Import data into database

const importData = async () => {
	try{
		await Tour.create(tours)
		console.log('data successfuly loaded')
	}catch(err){
		console.log(err)
	}
	process.exit()
}

// delete all data from colletction

const deleteData = async () => {
	try{
		await Tour.deleteMany()
		console.log('data successfuly deleted')
	}catch(err){
		console.log(err)
	}
	process.exit()
}

console.log(process.argv)
if(process.argv[2] === '--import'){
	importData()
} else if(process.argv[2] === '--delete'){
	deleteData()
}