let db=require("./dbcloud.js")
const mime = require('mime-types')
const fetch = require('@replit/node-fetch')


// =========== old website server paths ========
router.get("/server/account/*", async (request, response, next) => {
  let username = request.params[0]
  if(username.includes("/")) return next()
	let result = await db.get("user:"+username)
	if(result){
		delete result.ip
		delete result.notifs
		delete result.password
		delete result.subscriptions
		delete result.email
		Object.assign(result, getVotes(result))
	}
	response.json(result)
})
function getVotes(user){
  let votes = 0, voteCount = 0
  if(user && user.votes) for(let i in user.votes){
    votes += user.votes[i]
		voteCount++
  }
	let votePercent = votes/voteCount
  return {votePercent, voteCount, enoughVotes: voteCount>=10 && votePercent>0.7}
}
router.get("/server/pfp/*", async(req,res) => {
  let username = req.url.split("/").pop()
  db.get("user:"+username).then(d => {
    res.redirect(d.pfp)
  }).catch(() => res.send("error"))
})
router.get("/server/pfpLocation/*", async(req,res) => {
  let username = req.url.split("/").pop()
  db.get("user:"+username).then(d => {
    res.send(d.pfp)
  }).catch(() => res.send("error"))
})
router.get("/server/users", (req, res) => {
  db.list("user:").then((users) => {res.json(users) })
})
//get a post by its id
router.get("/server/post/*", (request, res) => {
  let id = request.url.split("/").pop()
  db.get("post:"+id).then(data => {
    res.json(data)
  }).catch(() => res.send(null))
})
//get posts from a user
router.get("/server/posts/*", (req, res) => {
  let username = req.url.split("/").pop()
  db.get("posts").then(r => res.json(r.filter(o => o.username === username)))
})
router.get("/server/posts", (req, res) => {
  db.get("posts").then(r => res.json(r))
})

router.get("/server/compareUser/:user1/:user2",async(req,res) => {
  let user1 = await db.get("user:"+req.params.user1)
  if(!user1) return res.send(req.params.user1+" doesn't exist")
  let user2 = await db.get("user:"+req.params.user2)
  if(!user2) return res.send(req.params.user2+" doesn't exist")
  res.send((user1.ip||[]).filter(value => (user2.ip||[]).includes(value)).length+" similarities")
})

router.get("/images/*",async(req,res) => {
	let id = req.params[0]
  var stream = await db.getStream("images/"+id)
  if(!stream){
		res.status(404).end()
		return
	}
  res.header("Content-Type", mime.lookup(req.params[0]))
  stream.pipe(res)
})
router.get("/around/:what", async(req,res) => {
	fetch(req.params.what).then(res2 => new Promise((resolve, reject) => {
    res2.body.pipe(res);
	})).catch(e => res.send(e.message))
})



//============ from mk website ========
function fixImage(req,o){
	if(o.thumbnail && o.thumbnail.startsWith("/images/")){
		o.thumbnail = ("https://"+req.hostname)+o.thumbnail
	}
}
router.get("/server/maps", async function(req,res){
  let maps = await db.get("maps")
	for(let i in maps) fixImage(req,maps[i])
  res.json(maps)
})
router.get("/server/mapsCategory/:c", async function(req,res){
  let maps = await db.get("mapsCategory:"+req.params.c)
  if(maps) {
		for(let i in maps) fixImage(req,maps[i])
		res.json(maps)
	} else if(mapCategories.includes(req.params.c)) res.json({})
  else res.json(null)
})
router.get("/server/mapsSearch", async function(req,res){
  let q = (req.query.q || "").toLowerCase()
  let r = {}
  let maps = await db.get("maps")
  for(let i in maps){
    if(maps[i].name.toLowerCase().includes(q) || maps[i].description && maps[i].description.toLowerCase().includes(q)){
			fixImage(req,maps[i])
      r[i] = maps[i]
    }
  }
  res.json(r)
})
router.get("/server/mapCategories",(req,res) => {
  res.json(mapCategories)
})
router.get("/server/map/*", async function(req,res){
  var name = req.url.split("/").pop()
  var map = await db.get("map:"+name)
  if(!map){
    return res.status(404).json(null)
  }
	fixImage(req,map)
  map.bytes = map.file ? map.file.length : map.code.length
  res.json(map)
})
router.get("/server/maps/:user", async function(req,res,next){
  if(!req.params.user) return next()
  let maps = await db.get("maps"), userMaps = {}
  for(let i in maps){
    if(maps[i].user === req.params.user) {
			fixImage(req,maps[i])
			userMaps[i] = maps[i]
		}
  }
  res.json(userMaps)
})
router.get("/server/rp/*", async function(req,res){
  var name = req.url.split("/").pop()
  var rp = await db.get("rp:"+name)
  if(!rp){
    return res.status(404).json(null)
  }
	fixImage(req,rp)
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
router.get("/server/wikiPages", async function(req,res){
  res.json(await db.list("wiki/")).map(r => r.replace("wiki/","").replace(/\./g,"/"))
})
router.get("/server/wikiPage/:name(*)", async function(req,res){
  var name = req.params.name, data = await db.get("wiki/"+name.replace(/\//g,"."))
  if(!data){
    return res.json(null)
  }
  delete data.pwd
  res.json(data)
})

console.log('index-old-paths.js has run')