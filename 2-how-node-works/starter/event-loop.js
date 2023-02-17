const fs = require('fs')
const crypto = require('crypto')

const start = Date.now()

setTimeout(() => console.log('Timer 1 finished'), 0)
setImmediate(() => console.log('Immediate 1 fisnihed'))

fs.readFile('test-file.txt', 'utf-8', () => {
	console.log('I/O finished')
	console.log('------------')
	setTimeout(() => console.log('Timer 2 finished'), 0)
	setTimeout(() => console.log('Timer 3 finished'), 3000)
	setImmediate(() => console.log('Immediate 2 fisnihed'))

	process.nextTick(() => console.log('Process.NextTick'))

	crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
		console.log(Date.now() - start, 'password encrypted')
	} )
	crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
		console.log(Date.now() - start, 'password encrypted')
	} )
	crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
		console.log(Date.now() - start, 'password encrypted')
	} )
	crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
		console.log(Date.now() - start, 'password encrypted')
	} )
})

console.log('Helllo ffrom top-level code')
