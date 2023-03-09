const dotenv = require('dotenv')

process.on('uncaughtException', err => {
	console.log(err.name, err.message)
	console.log('Uncaught Exception ! Shuting down.....')
	process.exit(1)
})

const mongoose = require('mongoose')

dotenv.config({path: './config.env'});
const express = require('express');

const app = require('./app')

const DB = `mongodb+srv://admin:${process.env.DATABASE_PASSWORD}@cluster0.zde3rob.mongodb.net/?retryWrites=true&w=majority`

mongoose.connect(DB).then(() => {
	console.log('mongoDB connected')
})

const port = process.env.PORT || 3000

const server = app.listen(port, () => {
	console.log('---------------------------')
	console.log(`App running on port ${port}`)
});


process.on('unhandledRejection', err => {
	console.log(err.name, err.message)
	console.log('Unhandled Rejection ! Shuting down.....')
	server.close(() => {
			process.exit(1)
		})
})