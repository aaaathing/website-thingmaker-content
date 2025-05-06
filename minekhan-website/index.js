const websiteBase = "/minekhan-website"

const zlib = require('zlib');
const express = require('express');
const router = express.Router();
const Transform = require('stream').Transform;
const newLineStream = require('new-line');
const mime = require('mime-types')
const fs = require("fs")

async function adjustThumbnail(data,name){
	if(data.thumbnail && data.thumbnail.startsWith("data:")){
		let split = data.thumbnail.split(",")
		let b = Buffer.from(split[1],"base64")
		let type = split[0].substring(split[0].indexOf(":")+1, split[0].indexOf(";"))
		let fname = name+"."+mime.extension(type)
		await db.setFile("images/"+fname, b)
		data.thumbnail = "/images/"+fname
		data.thumbnailKey = "images/"+fname //in db
	}
}
async function deleteMap(name){
  let map = await db.get("map:"+name)
  if(!map) return Log("Map doesn't exist: "+name)
  await db.delete("map:"+name)
  if(map.thumnailKey) await db.delete(map.thumbnailKey)
  let all = await db.get("maps")
  delete all["map:"+name]
  await db.set("maps",all)
  if(mapCategories.includes(map.category)){
    let all = await db.get("mapsCategory:"+map.category)
    delete all["map:"+name]
    await db.set("mapsCategory:"+map.category,all)
  }
  Log("Deleted map "+name)
}
global.deleteMap = deleteMap
async function deleteRP(name){
  let map = await db.get("rp:"+name)
  if(!map) return Log("Resource pack doesn't exist: "+name)
  await db.delete("rp:"+name)
  if(map.thumnailKey) await db.delete(map.thumbnailKey)
  let all = await db.get("maps")
  delete all["rp:"+name]
  await db.set("maps",all)
  Log("Deleted resource pack "+name)
}
global.deleteRP = deleteRP

function getMapTitle(m){
  m = Object.assign({},m)
  m.bytes = m.file ? m.file.length : m.code.length
  delete m.code
  delete m.file
  //if(m.thumbnail) m.thumbnail = "/server/mapThumbnail/"+m.name
  return m
}
function getRPTitle(m){
  m = Object.assign({},m)
  m.bytes = m.file.length
  delete m.file
  //if(m.thumbnail) m.thumbnail = "/server/rpThumbnail/"+m.name
  return m
}
router.get("/server/maps", async function(req,res){
  /*var maps = await db.list("map:",true)
  for(var m in maps){
    maps[m].bytes = maps[m].file ? maps[m].file.length : maps[m].code.length
    delete maps[m].code
    delete maps[m].file
    if(maps[m].thumbnail) maps[m].thumbnail = "/server/mapThumbnail/"+maps[m].name
  }*/
  let maps = await db.get("maps")
  res.json(maps)
})
router.get("/server/mapsCategory/:c", async function(req,res){
  let maps = await db.get("mapsCategory:"+req.params.c)
  if(maps) res.json(maps)
  else if(mapCategories.includes(req.params.c)) res.json({})
  else res.json(null)
})
router.get("/server/mapsSearch", async function(req,res){
  let q = (req.query.q || "").toLowerCase()
  let r = {}
  let maps = await db.get("maps")
  for(let i in maps){
    if(maps[i].name.toLowerCase().includes(q) || maps[i].description && maps[i].description.toLowerCase().includes(q)){
      r[i] = maps[i]
    }
  }
  res.json(r)
})
/*router.get('/server/mapThumbnail/*',async function(req,res){
  var name = req.url.split("/").pop()
  var thumbnail = await db.get("images/mapThumbnail:map:"+name)
  if(!thumbnail){
    return res.status(404).send()
  }
  if(thumbnail.startsWith("data:")){
    let base64ContentArray = thumbnail.split(",")
    // base64 content cannot contain whitespaces but nevertheless skip if there are!
    let mimeType = base64ContentArray[0].match(/[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/)[0]
    // base64 encoded data - pure
    let base64Data = base64ContentArray[1]
    res.header("Content-Type", mimeType)
    res.end(Buffer.from(base64Data, "base64"))
  }else res.redirect(thumbnail)
})
router.get('/server/rpThumbnail/*',async function(req,res){
  var name = req.url.split("/").pop()
  var thumbnail = await db.get("images/rpThumbnail:rp:"+name)
  if(!thumbnail){
    return res.status(404).send()
  }
  if(thumbnail.startsWith("data:")){
    let base64ContentArray = thumbnail.split(",")
    // base64 content cannot contain whitespaces but nevertheless skip if there are!
    let mimeType = base64ContentArray[0].match(/[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/)[0]
    // base64 encoded data - pure
    let base64Data = base64ContentArray[1]
    res.header("Content-Type", mimeType)
    res.end(Buffer.from(base64Data, "base64"))
  }else res.redirect(thumbnail)
})*/
const mapCategories = ["build","parkour","redstone","game"]
/*run when new category added:
db.get('maps').then(async r=>{
let cs={}
for(let i of mapCategories){
cs[i]=await db.get('mapsCategory:'+i)||{}
}
const re={house:"build",creative:"build",surviv:"game",town:"build",roleplay:"game",pvp:"game",fighting:"game",abstract:"build"}
for(let i in r){
let j=r[i]
let c
if(j.category){
const ca=j.category.toLowerCase()
for(let i in re){
if(i.includes(ca)||ca.includes(i))c=re[i]
}
for(let i of mapCategories){
if(i.includes(ca)||ca.includes(i))c=i
}
}
if(c){
let all=cs[c]
all["map:"+j.name]=j
}
}
for(let i of mapCategories){
await db.set('mapsCategory:'+i,cs[i])
}
Log('done')
})
*/
router.get("/server/mapCategories",(req,res) => {
  res.json(mapCategories)
})
router.post("/server/map", getPostDataHuge,async function(req, res){
  rateLimit(req)
  if(!req.body.name){
    return res.json({message:"It needs a name."})
  }
  var codeOrFile = (req.body.code ? 1 : 0) + (req.body.file ? 1 : 0)
  if(codeOrFile !== 1){
    return res.json({message:codeOrFile === 0 ? "It needs a code or a file." : "It can only have a code or a file."})
  }
	if(req.body.name.length > 100){
		return res.json({message:"Name too long"})
	}
  if(req.body.name.match(/[^-_\p{L}\p{N}]/ug)){
    return res.json({message:"Name can only contain: letters, numbers, - and _"})
  }
  var map = await db.get("map:"+req.body.name)
  if(map){
    return res.json({message:"That name is already taken."})
  }
  map = {
    name: req.body.name,
    user: req.username || null,
    description: req.body.description || null,
    code: req.body.code,
    category: mapCategories.includes(req.body.category) ? req.body.category : null,
    created: Date.now(),
    id: generateId(),
    file: req.body.file || null,
    thumbnail: req.body.thumbnail
  }
  await adjustThumbnail(map,"mapThumbnail:map:"+map.name) //await db.set("images/mapThumbnail:map:"+map.name, req.body.thumbnail)
  await db.set("map:"+map.name, map)
  let all = await db.get("maps")
  all["map:"+map.name] = getMapTitle(map)
  all = Object.fromEntries(
    Object.entries(all).sort((a,b) => b[1].created - a[1].created)
  );
  await db.set("maps",all)
  if(mapCategories.includes(req.body.category)){
    let all = await db.get("mapsCategory:"+req.body.category) || {}
    all["map:"+map.name] = getMapTitle(map)
    all = Object.fromEntries(
      Object.entries(all).sort((a,b) => b[1].created - a[1].created)
    );
    await db.set("mapsCategory:"+req.body.category,all)
  }
  await sendNotifToAll("There is a new map called: "+map.name+". Go check it out at https://"+theHost+"/maps/map/?map="+map.name)
  res.send({success:true})
  Log("New map called",map.name)
})
router.get("/server/map/*", async function(req,res){
  var name = req.url.split("/").pop()
  var map = await db.get("map:"+name)
  if(!map){
    return res.status(404).json(null)
  }
  //if(map.thumbnail) map.thumbnail = "/server/mapThumbnail/"+map.name
  map.bytes = map.file ? map.file.length : map.code.length
  res.json(map)
})
function waitLoadMap(id,list,user){
  return db.get(id).then(r => {
    if(!r) return console.error("invalid map "+id)
    if(user && user !== r.user) return
    r.bytes = r.file ? r.file.length : r.code.length
    delete r.code
    delete r.file
    list[id] = r
  })
}
router.get("/server/maps/:user", async function(req,res,next){
  if(!req.params.user) return next()
  /*var mapList = await db.list("map:"), promises = [], maps = {}
  for(var m of mapList){
    promises.push(waitLoadMap(m,maps,req.params.user))
  }
  await Promise.all(promises)*/
  let maps = await db.get("maps"), userMaps = {}
  for(let i in maps){
    if(maps[i].user === req.params.user) userMaps[i] = maps[i]
  }
  res.json(userMaps)
})
router.delete("/server/deleteMap/:map", async function(req,res,next){
  var map = await db.get("map:"+req.params.map)
  if(!map) return res.json({message:"map does not exist"})
  if(req.username !== map.user) return res.json({message:"Unauthorized"})
  await deleteMap(req.params.map)
  res.json({success:true})
})

router.post("/server/rp", getPostDataLarge, async function(req, res){
  rateLimit(req)
  if(!req.body.name){
    return res.json({message:"It needs a name."})
  }
  if(!req.body.file) return res.json({message:"File needed"})
	
	if(req.body.name.length > 100){
		return res.json({message:"Name too long"})
	}
  if(req.body.name.match(/[^-_\p{L}\p{N}]/ug)){
    return res.json({message:"Name can only contain: letters, numbers, - and _"})
  }
  var rp = await db.get("rp:"+req.body.name)
  if(rp){
    return res.json({message:"That name is already taken."})
  }
  try{
    JSON.parse(req.body.file)
  }catch(e){
    return res.json({message:"Invalid JSON. "+e.message})
  }
  rp = {
    name: req.body.name,
    user: req.username || null,
    description: req.body.description || null,
    created: Date.now(),
    id: generateId(),
    file: req.body.file || null,
    thumbnail: req.body.thumbnail
  }
  await adjustThumbnail(rp,"rpThumbnail:rp:"+rp.name) //await db.set("images/rpThumbnail:rp:"+rp.name, req.body.thumbnail)
  await db.set("rp:"+rp.name, rp)
  let all = await db.get("maps")
  all["rp:"+rp.name] = getRPTitle(rp)
  all = Object.fromEntries(
    Object.entries(all).sort((a,b) => b[1].created - a[1].created)
  );
  await db.set("maps",all)
  await sendNotifToAll("There is a new resource pack called: "+rp.name+". Go check it out at https://"+theHost+"/maps/rp/?rp="+rp.name)
  res.send({success:true})
  Log("New resource pack called",rp.name)
})
router.post("/server/editrp/:name", getPostData,async function(req, res){
  rateLimit(req)
  if(!req.body.file) return res.json({message:"File needed"})
  let rp = await db.get("rp:"+req.params.name)
  if(!rp) return res.json({message:"No resource pack"})
  if(req.username !== rp.user) return res.status(401).send({message:"unauthorized"})
  rp.file = req.body.file
  if(req.body.description) rp.description = req.body.description
  await db.set("rp:"+req.params.name, rp)
  if(req.body.thumbnail){
		if(rp.thumbnailKey){
			await db.delete(rp.thumbnailKey)
			rp.thumbnailKey = undefined
		}
		rp.thumbnail = req.body.thumbnail
		await adjustThumbnail(rp,"rpThumbnail:rp:"+rp.name)
	}
  let all = await db.get("maps")
  all["rp:"+rp.name] = getRPTitle(rp)
  await db.set("maps",all)
  res.send({success:true})
  Log("Edited resource pack called",rp.name)
})
router.get("/server/rp/*", async function(req,res){
  var name = req.url.split("/").pop()
  var rp = await db.get("rp:"+name)
  if(!rp){
    return res.status(404).json(null)
  }
  //if(rp.thumbnail) rp.thumbnail = "/server/rpThumbnail/"+rp.name
  rp.bytes = rp.file.length
  delete rp.file
  res.json(rp)
})
router.get("/rp/*", async function(req,res){
  var name = req.url.split("/").pop()
  var rp = await db.get("rp:"+name)
  res.header("Content-Type", "application/json")
  if(!rp){
    return res.status(404).send("null")
  }
  res.send(rp.file)
})

/*async function getWikiPages(){
  let pages = {}
  let requiredPages = await fs.promises.readdir(__dirname+"/public/wiki/required/")
  for(let i of requiredPages){
    pages[i] = {name:i.replace(/\.txt$/,""),required:true,content:await fs.promises.readFile(__dirname+"/public/wiki/required/"+i,"utf-8")}
  }
  var otherPages = await db.list("wiki:",true)
  for(var i in otherPages){
    delete otherPages[i].pwd
    pages[i] = otherPages[i]
  }
  return pages
}*/
async function getWikiPageTitles(){
  //let pages = {}
  /*let requiredPages = await fs.promises.readdir(__dirname+"/public/wiki/required/")
  for(let i of requiredPages){
    pages[i] = {name:i.replace(/\.txt$/,""),required:true}
  }
  var otherPages = await db.list("wiki:")
  for(var i of otherPages){
    pages[i] = {name:i.replace('wiki:','')}
  }*/
  return (await db.list("wiki/")).map(r => r.replace("wiki/","").replace(/\./g,"/"))
}
async function getWikiPage(name){
  try{
    return await db.get("wiki/"+name.replace(/\//g,"."))
  }catch{
    return null
  }
}
router.get("/server/wikiPages", async function(req,res){
  res.json(await getWikiPageTitles())
})
/*router.get("/server/wikiPagesData", async function(req,res){
  res.json(await getWikiPages())
})
router.get("/server/wikiPageList", async function(req,res){
  let pages = await fs.promises.readdir(__dirname+"/public/wiki/required/")
  pages.push(...await db.list("wiki:"))
  res.json(pages)
})*/

router.get(websiteBase+"/wiki/page/:name(*)", async function(req,res){
  var name = req.params.name, page = await getWikiPage(name)
  if(!page){
    return res.status(404).sendFile(__dirname+"/public/wiki/404/index.html")
  }
  delete page.pwd
  delete page.previous
  var pageStr = JSON.stringify(page).replace(/</g,"\\<").replace(/>/g,"\\>")
  var parser = new Transform({
    transform(data, encoding, done) {
      const str = data.toString().replace('PAGEDATA', pageStr)
      this.push(str);
      done();
    }
  })
  
  fs.createReadStream(__dirname+'/public/wiki/wikiPage.html')
    .pipe(newLineStream())
    .pipe(parser)
    .on("error",e => {
      console.error(e)
    })
    .pipe(res);
  //res.sendFile(__dirname+"/wikiPage.html")
})

router.get(websiteBase+"/wiki", (req,res) => {
  res.redirect(websiteBase+"/wiki/page/Home")
})
/*router.get("/wiki/required-page/*", async function(req,res){
  var name = req.params[0]
  let path = __dirname+"/public/wiki/required/"+name
  var page = await fs.promises.readFile(path+".txt", { encoding: 'utf8' }).catch(e => null)
  if(!page){
    return res.status(404).sendFile(__dirname+"/public/wiki/404/index.html")
  }
  let pageData = {content:page,name}
  let pageStr = JSON.stringify(pageData).replace(/</g,"\\<").replace(/>/g,"\\>")
  var parser = new Transform({
    transform(data, encoding, done) {
      const str = data.toString().replace('PAGEDATA', pageStr);
      this.push(str);
      done();
    }
  })
  
  fs.createReadStream(__dirname+'/public/wiki/requiredWikiPage.html')
    .pipe(newLineStream())
    .pipe(parser)
    .on("error",e => {
      console.error(e)
    })
    .pipe(res);
  //res.sendFile(__dirname+"/wikiPage.html")
})*/

router.get("/server/wikiPage/:name(*)", async function(req,res){
  var name = req.params.name, data = await getWikiPage(name)
  if(!data){
    return res.json(null)
  }
  delete data.pwd
  res.json(data)
})
router.post("/server/wikiPage", getPostData,async function(req,res){
  rateLimit(req)
  if(!req.isAdmin && !getVotes(req.user).enoughVotes) return res.json({message:"You need 10 or more votes to make a wiki page."})
  if(!req.body.name){
    return res.json({message:"It needs a name"})
  }
  /*if(!req.body.content){
    return res.json({message:"It needs content"})
  }*/
  /*if(!req.body.pwd){
    return res.json({message:"You need to provide a password for deleting and stuff."})
  }*/
	if(req.body.name.length > 100){
		return res.json({message:"Name too long"})
	}
  if(req.body.name.match(/[^-_\p{L}\p{N}]/ug)){
    return res.json({message:"Name can only contain: letters, numbers, - and _"})
  }
  const exist = !!db.get("wiki/"+req.body.name.replace(/\//g,"."))
  if(exist) return res.json({message:"That name is already taken"})
  page = {
    name: req.body.name,
    user: req.username || null,
    content: "what goes here???",
    pwd: req.body.pwd,
    created: Date.now()
  }
  db.set("wiki/"+req.body.name.replace(/\//g,"."), page)
  res.json({success:true})
  Log("New wiki page called","<a href='"+websiteBase+"/wiki/page/"+sanitize(page.name)+"' target='_blank'>"+sanitize(page.name)+"</a>")
})

router.get(websiteBase+"/wiki/edit/:name(*)", async function(req,res){
  var name = req.params.name, page = await getWikiPage(name)
  if(!page){
    return res.status(404).sendFile(__dirname+"/public/wiki/404/index.html")
  }
  delete page.pwd
  var pageStr = JSON.stringify(page).replace(/</g,"\\<").replace(/>/g,"\\>")
  var parser = new Transform({
    transform(data, encoding, done) {
      const str = data.toString().replace('PAGEDATA', pageStr)
      this.push(str);
      done();
    }
  })
  
  fs.createReadStream(__dirname+'/public/wiki/editWikiPage.html')
    .pipe(newLineStream())
    .pipe(parser)
    .on("error",e => {
      console.error(e)
    })
    .pipe(res);
})
router.get(websiteBase+"/wiki/previousVersions/:name(*)", async function(req,res){
  var name = req.params.name, page = await getWikiPage(name)
  if(!page){
    return res.status(404).sendFile(__dirname+"/public/wiki/404/index.html")
  }
  if(!page){
    return res.status(404).sendFile(__dirname+"/public/wiki/404/index.html")
  }
  delete page.pwd
  var pageStr = JSON.stringify(page).replace(/</g,"\\<").replace(/>/g,"\\>")
  var parser = new Transform({
    transform(data, encoding, done) {
      const str = data.toString().replace('PAGEDATA', pageStr)
      this.push(str);
      done();
    }
  })
  
  fs.createReadStream(__dirname+'/public/wiki/viewPreviousWikiPageVersion.html')
    .pipe(newLineStream())
    .pipe(parser)
    .on("error",e => {
      console.error(e)
    })
    .pipe(res);
})
router.post("/server/editWikiPage/:name(*)",getPostData, async function(req,res){
  rateLimit(req)
  if(!req.username || !req.isAdmin && !getVotes(req.user).enoughVotes) return res.json({message:"You need 10 or more votes to edit a wiki page."})
  //var pwd = process.env['passKey']
  var name = req.params.name, page = await getWikiPage(name)
  if(!page){
    return res.json({message:"Page doesn't exsist"})
  }
  if(req.body.content === page.content){
    return res.json({message:"Change the content first."})
  }
  page.previous = page.previous || []
  const deflated = zlib.gzipSync(page.content).toString('base64')
  page.previous.push(deflated)
  page.content = req.body.content
  let authors = page.user ? page.user.split(", ") : []
  if(req.username && !authors.includes(req.username)) authors.push(req.username)
  page.user = authors.join(", ")
  db.set("wiki/"+name.replace(/\//g,"."), page)
  res.json({success:true})
  Log("Edited wiki page called","<a href='"+websiteBase+"/wiki/page/"+sanitize(page.name)+"' target='_blank'>"+sanitize(page.name)+"</a>")
})

router.post("/server/deleteWikiPage/:name(*)",getPostData, async function(req,res){
  rateLimit(req)
  var name = req.params.name
  var pwd = process.env['passKey']
  let page = await getWikiPage(name)
  if(req.isAdmin || req.body.pwd === pwd || page.pwd && req.body.pwd === page.pwd){
    await db.delete("wiki/"+name.replace(/\//g,"."))
    res.json({success:true})
    Log("Deleted wiki page called "+sanitize(page.name))
  }else{
    res.json({message:"", noAccess:true})
  }
})

router.post("/server/commentOnWikiPage/:name(*)",getPostData, async function(req,res){
  rateLimit(req,undefined,0.01)
  var name = req.params.name
  if(!req.body.content){
    return res.json({message:"<b style='color:red;'>Comment cannot be blank.</b>"})
  }
  var page = await getWikiPage(name)
  if(!page){
    return res.send({message:"Page doesn't exsist."})
  }
  if(!page.comments){
    page.comments = []
  }
  page.comments.push({
    user: req.username || null,
    content:req.body.content,
    created: Date.now(),
    id: generateId()
  })
  await db.set("wiki/"+name.replace(/\//g,"."), page)
  res.json({success:true})
  Log("New comment at wiki page called","<a href='"+websiteBase+"/wiki/page/"+page.name+"' target='_blank'>"+sanitize(page.name)+"</a>")
})

router.post("/server/deleteCommentOnWikiPage/:name(*)",getPostData, async function(req,res){
  rateLimit(req)
  var name = req.params.name
  if(!req.body.id){
    return res.json({message:"Invalid request"})
  }
  var page = await getWikiPage(name)
  if(!page){
    return res.json({message:"Page doesn't exsist"})
  }

  var pwd = process.env['passKey']
  if(req.isAdmin || req.body.pwd === pwd || req.body.pwd === page.pwd){
    // continue
  }else{
    return res.json({message:"You don't have access", noAccess:true})
  }

  var c = page.comments, i
  for(i=0; i<c.length; i++){
    if(c[i].id === req.body.id){
      break
    }
  }
  c.splice(i,1)
  await db.set("wiki/"+name.replace(/\//g,"."), page)
  res.json({success:true})
  Log("Deleted comment at wiki page called",sanitize(name))
})
router.get(websiteBase+"/wiki/search",async function(req,res){
  let q = req.query.q || ""
  let pages = []
  let wikiPages = await getWikiPageTitles()
  for(let i of wikiPages){
    let name = i.replace(/_/g," ")
    if(name.toLowerCase().includes(q.toLowerCase())) pages.push(i)
  }
  var pageStr = JSON.stringify(pages).replace(/</g,"\\<").replace(/>/g,"\\>")
  var parser = new Transform({
    transform(data, encoding, done) {
      const str = data.toString().replace('SEARCHDAtA', pageStr);
      this.push(str);
      done();
    }
  })
  
  fs.createReadStream(__dirname+'/public/wiki/search/index.html')
    .pipe(newLineStream())
    .pipe(parser)
    .on("error",e => {
      console.error(e)
    })
    .pipe(res);
})

app.use(router)
app.use(websiteBase, express.static(__dirname + "/public"))

module.exports.search = async function(links,q){
	let maps = await db.get("maps")
  for(let i in maps){
    let name = maps[i].name.replace(/_/g," ")
    if(name.toLowerCase().includes(q.toLowerCase()) || (maps[i].description || "").toLowerCase().includes(q.toLowerCase())) links[name] = {url:"/maps/map/?map="+maps[i].name,description:maps[i].description}
  }
  let wikiPages = await getWikiPageTitles()
  for(let i of wikiPages){
    let name = i.replace(/_/g," ")
    if(name.toLowerCase().includes(q.toLowerCase())) links[i] = {url:"/wiki/page/"+i}
  }
}