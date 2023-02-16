const fs = require('fs');
const http = require('http')
const url = require('url')
const replaceTemplate = require('./modules.js/replaceTemplate')

const slugify = require('slugify')

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


// templates
const tempOverview = fs.readFileSync(`${__dirname}/templates/overview.html`, 'utf-8')
const tempCard = fs.readFileSync(`${__dirname}/templates/card.html`, 'utf-8')
const tempProduct = fs.readFileSync(`${__dirname}/templates/product.html`, 'utf-8')

//Data
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8')
const dataObj = JSON.parse(data)

const slugs = dataObj.map(el => slugify(el.productName, { lower: true}))
console.log(slugs)

const server = http.createServer((req,res) => {
 	
	const { query, pathname} = url.parse(req.url, true)


	// Overview Page
	if( pathname === '/' || pathname === '/overview') {
		res.writeHead(200, {'Content-type': 'text/html'})

		const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('')
		const output = tempOverview.replace('{%CARDS%}', cardsHtml)	
		res.end(output)

	// Product Page
	}else if(pathname === '/product'){
		res.writeHead(200, {'Content-type': 'text/html'})
		const product = dataObj[query.id]
		const output = replaceTemplate(tempProduct, product)
		res.end(output)

	// API	
	}else if(pathname === '/api'){
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
	console.log('Listening to req at port 8000')
})













