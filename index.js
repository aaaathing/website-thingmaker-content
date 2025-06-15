const { Client } = require('@replit/object-storage');
const client = new Client();

const express = require('express');
const app = express()
const cors = require('cors');
app.use(cors({
  origin: function(origin, callback){
    return callback(null, true);
  },
  credentials: true, // <= Accept credentials (cookies) sent by the client
}))
const router = express.Router();
const requestIp = require('request-ip');
const path = require('path');
app.use((req,res,next)=>{
	if(req.path.startsWith("/server/pfp"))
		return next()
	let orig = req.get("origin")||req.get("host"), ref = req.get('Referrer')
	console.log(requestIp.getClientIp(req),"|",req.method+" "+req.path,"| referrer:", ref,"|", ref===orig?"":"origin: "+orig)
	next()
})

function sanitize(v){
  v = v.replace(/&/g,"&amp;")
  v = v.replace(/</g,"&lt;")
  v = v.replace(/>/g,"&gt;")
  v = v.replace(/"/g,"&quot;")
  v = v.replace(/'/g,"&apos;")
  return v
}

router.get("/saves/:u", async(req,res)=>{
	const { ok, value, error } = await client.downloadAsText('saves:'+req.params.u+'.json');
	if (!ok) {
	  return res.send("not ok "+error)
	}

	res.write("<!doctype html> <button onclick='for(let i of document.getElementsByTagName(\"a\"))i.click()'>Download all</button><br>")
	for(let i of JSON.parse(value)){
		res.write("<a href='/saves/"+req.params.u+"/"+i.id+"' download='"+sanitize(i.name)+".minekhan'><img src='"+i.thumbnail+"'>"+i.name+"</a><br>")
	}
	res.end()
})
router.get("/saves/:u/:id", async(req,res)=>{
	const stream = await client.downloadAsStream('saves:'+req.params.u+':'+req.params.id);
	stream.on('error',e=>{res.write(e+"");res.end()})
	stream.pipe(res)
})

global.router=router
app.use(express.static(__dirname+"/public"))
app.use("/minekhan-website", express.static(__dirname+"/minekhan-website/public"))
router.get("/websitecontent/common.js", (req,res)=>{
	res.sendFile(__dirname+"/public/assets/common-websitecontent.js")
})
require("./index-old-paths.js")


app.use(router)
app.use((req,res,next) => {
	if(req.url.startsWith("/server/")) next()
	else res.redirect("https://thingmaker.us.eu.org"+req.url)
})
app.listen(8080)