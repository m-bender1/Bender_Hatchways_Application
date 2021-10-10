"use strict"
/* 
	Matthew Bender
	October 2021
	Hatchways Assessment, back-end script 
*/
const express = require("express")
const app = express()
var path = require("path")
// load the add-in xmlhttprequest and create XMLHttpRequest object
let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
const port = 3000

app.use("/", express.static("public"))
//server default page on http://localhost:3000/
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname + "/public/index.html"))
})

app.get("/data", function (req, res) {
	let prom = new Promise(function (resolve, reject) {
		var httpReq = new XMLHttpRequest()

		httpReq.open("GET", "https://api.hatchways.io/assessment/students")
		httpReq.onload = () => {
			httpReq.status === 200 ? resolve(httpReq.responseText) : reject(httpReq.statusText)
		}
		httpReq.send()
	})

	prom.then(
		function (promiseResponse) {
			res.send(promiseResponse)
		},
		function (error) {
			console.error(error)
		}
	)
})

app.listen(port, function () {
	console.log("Server is running on port " + port)
})
