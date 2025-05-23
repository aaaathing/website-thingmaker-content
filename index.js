const { Client } = require('@replit/object-storage');
const client = new Client();

const express = require('express');
const app = express()
const router = express.Router();
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
app.use(router)
app.listen(8080)


function sanitize(v){
  v = v.replace(/&/g,"&amp;")
  v = v.replace(/</g,"&lt;")
  v = v.replace(/>/g,"&gt;")
  v = v.replace(/"/g,"&quot;")
  v = v.replace(/'/g,"&apos;")
  return v
}