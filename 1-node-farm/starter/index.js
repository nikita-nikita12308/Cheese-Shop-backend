const fs = require('fs');
const http = require('http')
const url = require('url')


//Files

// Blocking , synchronous way
//const file = fs.readFileSync('./txt/input.txt', 'utf-8')
//const write = (`This is ${file} \n Created at ${Date.now()}`)
//fs.writeFileSync('./txt/input.txt', write)
//console.log(`File written!`)


//Non-Blocking, async way
//fs.readFile('./txt/start.txt','utf-8', (err, data) => {
//	fs.readFile(`./txt/${data}.txt`,'utf-8', (err, data1) => {
//		console.log(data1)
//		fs.readFile('./txt/append.txt','utf-8', (err, data2) => {
//			console.log(data2)
//			fs.writeFile('./txt/final.txt', `${data1}\n${data2}`, 'utf-8', err => {
//				console.log("new file has been written")
//			})
//		})
//	})
//})
//console.log(' will read file')



//SERVER
const replaceTemplate = (temp, product) => {
	let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName)
	output = output.replace(/{%IMAGE%}/g, product.image)
	output = output.replace(/{%PRICE%}/g, product.price)
	output = output.replace(/{%FROM%}/g, product.from)
	output = output.replace(/{%NUTRIENTS%}/g, product.nutrients)
	output = output.replace(/{%QUANTITY%}/g, product.quantity)
	output = output.replace(/{%DESCRIPTION%}/g, product.description)
	output = output.replace(/{%ID%}/g, product.id)

	if(!product.organic) output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic')
	return output;
}


// templates
const tempOverview = fs.readFileSync(`${__dirname}/templates/overview.html`, 'utf-8')
const tempCard = fs.readFileSync(`${__dirname}/templates/card.html`, 'utf-8')
const tempProduct = fs.readFileSync(`${__dirname}/templates/product.html`, 'utf-8')

//Data
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8')
const dataObj = JSON.parse(data)

const server = http.createServer((req,res) => {
	const pathName = req.url

	// Overview Page
	if( pathName === '/' || pathName === '/overview') {
		res.writeHead(200, {'Content-type': 'text/html'})

		const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('')
		const output = tempOverview.replace('{%CARDS%}', cardsHtml)	
		res.end(output)

	// Product Page
	}else if(pathName === '/product'){
		res.end('This is the product')

	// API	
	}else if(pathName === '/api'){
		res.writeHead(200, { 'Content-type': 'application/json'})
		res.end(data);

	// Not found	
	}else{
		res.writeHead(404, {
			'Content-type': 'text/html',
			'my-own-header': 'hello-world'
		})
		res.end('<h1>Page not Found</h1>')
	}
})

server.listen(8000, '127.0.0.1', () => { 
	console.log('Hello brother')
})













