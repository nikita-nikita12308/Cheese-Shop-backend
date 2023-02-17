const EventEmmiter = require('events')

const myEmitter = new EventEmmiter();

myEmitter.on('newSale', () => {
	console.log('There was a new sale')
})

myEmitter.on('newSale', () => {
	console.log('Costumer name: Jonas')
})

myEmitter.emit('newSale')