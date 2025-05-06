
const help = `
Type "help" for help

=========================
Use undefined to skip an argument.
Functions:

deleteMap(name)
deleteRP(name)

sendNotifTo(message, subscription)
sendNotifToAll(message, actions)
^ Send a notifiction to all subscribers. Set message to the message of the notification
sendNotifToUser(message, username, actions)
listSubscriptions();
clearSubscriptions();
notif(content, username, actions, sendWebPush)

LogAllOut()
deleteCloudSaves()
findLongKeys()
deleteUselessAccounts()

promoteToAdmin(username)
deleteAccount(username)
unpromoteFromAdmin(username)
giveCape(username,cape name)
setPassword(username,password)
deletePostNoNotify(post id)

ban(username,reason,miliseconds until unban, ip|set to false to not ban ip, mode);
^ Arguments after username are optional. Mode can be: null (no multiplayer in minekhan),
^ "website" (ban from website), "hide" (pretend website doesn't exist)
unban(username)

sendEval(world-index, player-index, code)
sendEvalEx(world-index, code) For external servers

=========================
Some info:
Subscribers are people who allowed notifications
`


//Variables
let multiplayerOn = true
let multiplayerMsg = "" //message when multiplayer is off

const theHost = "thingmaker.us.eu.org"
global.theHost = theHost
const serverInfo = [
  /*{url:"scn.tnjs.repl.co",safe:true},
  {url:"mkServer.minekhan.repl.co",safe:true},
  {url:"war-smp.minekhan.repl.co",safe:true},
  {url:"Minekhan-Server-Dope-SMP.elecdope.repl.co",safe:true},
  {url:"lukes-server.lukep0wers.repl.co",safe:true},
  {url:"mkserver.redmonster12.repl.co"},
  {url:"fortress-games.paragram.repl.co"},
  {url:"epixel.epicyoutuber80.repl.co"},
  {url:"theai.us.eu.org"},
  {url:"mkserver.tommustbe12.repl.co"}
  {url:"mk-server.awhatcott.repl.co"}*/
]
const d = ["2-people","2-people2","Notch","TomMustBe12"]
const alertStrs = ["don"+"gwei","alertthis"]



console.log("index.js")
//if(! require("./indextest.js") . run) return

process.on('unhandledRejection', (reason, p) => {
  //console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
  //Log(reason.stack)
  //setTimeout(() => process.exit(), 2000)
  console.error(reason)
  process.exit()
});

const path = require("path")
//require("dotenv").config({path: path.resolve(__dirname,"..",".env")})
const express = require('express');
const app = express(); global.app = app
var cookieParser = require('cookie-parser');
app.use(cookieParser());
const router = express.Router();
const cors = require('cors');
app.use(cors({
  origin: function(origin, callback){
    return callback(null, true);
  },
  credentials: true, // <= Accept credentials (cookies) sent by the client
}))
const db = require('./dbcloud.js'); global.db = db
const webPush = require('web-push');
const Transform = require('stream').Transform;
const newLineStream = require('new-line');
const fs = require("fs")
const bcrypt = require('bcrypt')
let WebSocket = require('websocket')
const WebSocketServer = WebSocket.server
WebSocket = WebSocket.client
const url = require('url');
const nodemailer = require('nodemailer');
const requestIp = require('request-ip');
app.use(requestIp.mw())
const mime = require('mime-types')
const crypto = require("crypto")
const fetch = require('@replit/node-fetch')
const rateLimit = require("./rateLimit.js")
//const { createCanvas, Image } = require('canvas')
//const nocache = require('nocache')
const { request } = require("http")


const SECOND = 1000
const MINUTE = SECOND * 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24
const YEAR = DAY * 365

async function findLongKeys(){
  var keys = await db.list("","raw")
  for(var i in keys){
    if(keys[i].length > 10000) Log(i,"is very long.",keys[i].length,"characters")
  }
  Log("done")
}
/*async function findUselessAccounts(g){
  var keys = await db.list("user:",true)
  var p = []
  for(var i in keys){
    var k = keys[i]
    if(!k || !k.bio && !k.bg && !k.skin){
      p.push(i)
    }
  }
  if(g) return p
  else Log(p)
}
async function deleteUselessAccounts(){
  var p = await findUselessAccounts(true)
  for(var i of p) p[i] = db.delete(i)
  await Promise.all(p)
  Log("done")
}*/
db.autoDeleteOld("session:", DAY*60)

let log = [], prelog = true
function Log(){
 //var data = [Date.now(), ...arguments]
  let data = " |"
  for(let i of arguments){
    data += " "+valueToString(i,undefined,arguments)
  }
  /*if(prelog){
    prelog.push(Date.now())
    prelog.push(data)
    return
  }*/
  let now = Date.now()
  log.push(now,data)

	for(let i of alertStrs){
		if(data.includes(i)) log.push(now," | <b style='color:red'>alert found string "+i+"</b>")
	}

  if(!prelog) db.set("log", log)
}
Log.noTime = async function(data){
  //var data = [...arguments]
  log.push(data)
  await db.set("log", log)
}
db.Log = Log
global.Log = Log

function waitToRestart(){
	console.log("waiting to restart")
  serverPort.close()
	serverPort.closeAllConnections()
	updateOnline()
	let j=0
  setInterval(() => {
		j++
    if(j<20) for(let i in db.timeouts){
      if(db.timeouts[i].operation) return
    }
		console.log("restarting")
    process.exit()
  },500)
}
async function clearLog(){
  if(runBy===d[0]){
    log = []
    await db.set("log",log)
    waitToRestart()
  }
  /*db.set("log",[]).then(() => {
    waitToRestart()
  })*/
}
//console.clear()
db.get("log").then(r => {
  log = r.concat(log)
  prelog = false
}).catch(() => {})
/*fs.promises.readFile(__dirname+"/log.txt",{encoding:"utf8"}).then(r => {
  if(r){
    log = r.split("\n")
    for(let i=0; i<log.length; i++){
      if(log[i].startsWith(" |")){//previous is probably number
        let n = parseInt(log[i-1])
        if(!isNaN(n)) log[i-1] = n
      }
    }
  }
  var temp = prelog
  prelog = null
  for(var i of temp){
    Log.noTime(i)
  }
})*/

let lastOnline = new Map()
let lastOnlineCategories = {i:new Map(),u:new Map()}
let banned = new Set()
function updateOnline(){
  let now = Date.now()
  for(let [id,u] of lastOnline){
		if(u.banned && u.unbanTime && now >= u.unbanTime){
      delete u.banned
			delete u.banReason
			delete u.banMode
			delete u.unbanTime
			banned.delete(u)
  		Log(u.username.join(", ")+" was unbanned.")
    }
    if(now - u.time > DAY && !u.banned){
      lastOnline.delete(id)
      for(let username of u.username) lastOnlineCategories.u.delete(username)
      for(let ip of u.ip) lastOnlineCategories.i.delete(ip)
      //if(i === d[0]) disable()
    }
  }
  db.set("lastOnline",[...lastOnline.values()])
}
setInterval(updateOnline,MINUTE)
db.get("lastOnline").then(r => {
  if(r){
    lastOnline = new Map()
		for(let i of r) lastOnline.set(i.id,i)
    lastOnlineCategories.i.clear()
    lastOnlineCategories.u.clear()
    for(let [id,u] of lastOnline){
      for(let username of u.username) lastOnlineCategories.u.set(username,u)
      for(let ip of u.ip) lastOnlineCategories.i.set(ip,u)
			if(u.banned) banned.add(u)
    }
    /*for(let i in r){
      if(!lastOnline[i]) lastOnline[i] = r[i], onlineCount++
    }*/
    for(let i of onlineWs.connections){
      sendAllOnline(i)
    }
  }
  for(var i of waitingForBanned) i()
  waitingForBanned = null
})
const badPaths = ["/test","/records","/links.json"]
function goodPath(path){//for online
  return (path.endsWith(".html") || !path.match(/\.[^.]+$/)) && !path.startsWith("/server/") && !path.startsWith("/editor/") && !badPaths.includes(path) && !path.startsWith("/updates/")
}
function setOnline(username,path,ip){
  let good = path ? goodPath(path) : false
  let who = (username ? lastOnlineCategories.u.get(username) : null) || lastOnlineCategories.i.get(ip)
  if(!who){
    who = {path:"no path yet", username:[],ip:[], id:generateId(), time: Date.now()}
    lastOnline.set(who.id,who)
  }
  lastOnlineCategories.u.set(username,who)
  lastOnlineCategories.i.set(ip,who)
  if(!who.username.includes(username)) who.username.push(username)
  if(!who.ip.includes(ip)) who.ip.push(ip)
  if(good) who.time = Date.now()
  if(path) who.path = path
  if(good) sendOnline(who)
	return who
}

var waitingForBanned = []
function waitForBanned(){
  return new Promise(resolve => {
    waitingForBanned.push(resolve)
  })
}
async function ban(username, reason, unbanTime, ip, mode){
	let who = lastOnline.get(username) || setOnline(username,null,ip)
	if(who.banned) return Log(username+" is already banned.")
	who.banned = true
	who.banReason = reason
	who.banMode = mode
	if(unbanTime) who.unbanTime = unbanTime+Date.now()
	updateOnline()//save
	banned.add(who)
	Log(username+" was banned.")
}
global.ban = ban
async function unban(username){
	let who = lastOnlineCategories.u.get(username)
	if(!who.banned) return Log(username+" not banned")
	delete who.banned
	delete who.banReason
	delete who.banMode
	delete who.unbanTime
	updateOnline()//save
	banned.delete(who)
  Log(username+" was unbanned.")
}
function whyBanned(who){
  let obj = {
    type:"error",
    data:"You are banned."
  }
  obj.data += "\nBanned: "+who.username.join(", ")
  if(who.banReason){
    obj.data += "\nReason: "+who.banReason
    obj.long = true
  }
  if(who.unbanTime){
    obj.data += "\nYou will be unbanned in "+timeString(who.unbanTime - Date.now())
    obj.long = true
  }
  return obj
}
function getBanned(){
  let str = ""
  for(let u of banned){
    str += "Usernames: "+u.username.join(", ")+"\n"
    if(u.banReason) str += "\tReason: "+u.banReason+"\n"
    if(u.unbanTime) str += "\tUnban in "+timeString(u.unbanTime - Date.now())+"\n"
    if(u.mode) str += "\tMode: "+u.mode+"\n"
    str += "\n"
  }
  return str.substring(0,str.length-2)
}

var capes = {}
db.get("capes").then(r => {
  if(r) capes = r
})
function saveCapes(){
  return db.set("capes",capes) //return promise
}
function giveCape(username, name, doer=runBy){
  return db.get("user:"+username).then(async u => {
    u.ownedCapes = u.ownedCapes || []
    if(u.ownedCapes.includes(name)){
      throw new Error(username+" already has cape called "+name+".")
    }
    if(!capes[name]){
      throw new Error("No such cape called "+name+".")
    }
    u.ownedCapes.push(name)
    await db.set("user:"+username, u)
    Log(username+" got cape called "+name+" from "+doer)
  })
}
function ungiveCape(username, name, doer=runBy){
  return db.get("user:"+username).then(async u => {
    if(!u.ownedCapes || !u.ownedCapes.includes(name)) throw new Error(username+" doesn't have cape called "+name+".")
    for(let i=0; i<u.ownedCapes.length; i++){
      if(u.ownedCapes[i] === name){
        u.ownedCapes.splice(i,1)
        break
      }
    }
    if(u.cape === capes[name]) u.cape = null
    await db.set("user:"+username, u)
    Log(username+" lost cape called "+name+" from "+doer)
  })
}

let recordsNames = {
  "maxWorldPlayerCount":"Players in a multiplayer world at a time in MineKhan",
  "maxPlayerCount":"Players at a time in multiplayer in MineKhan",
  "maxWorldOpenTime":"Longest time player-hosted server stayed open (minutes) in MineKhan"
}
let records = {maxWorldPlayerCount:0,maxPlayerCount:0,maxWorldOpenTime:0}
db.get("records").then(r => {
  if(r) Object.assign(records, r)
})
function updateRecord(name,value){
  if(value > records[name]){
    records[name] = value
    db.set("records", records)
  }
}
function updateWorldRecords(){
  var maxWorldPlayers = 0, totalPlayers = 0
  for(var i of worlds){
    let checkedUsers = {}
    let count = 0
    for(let p of i.players){
      checkedUsers[p.username] = true
      if(!checkedUsers[p.username]) count++
    }
    maxWorldPlayers = Math.max(maxWorldPlayers, count)
    totalPlayers += i.players.length
  }
  for(var i of servers){
    let checkedUsers = {}
    let count = 0
    for(let p of i.players){
      checkedUsers[p.username] = true
      if(!checkedUsers[p.username]) count++
    }
    maxWorldPlayers = Math.max(maxWorldPlayers, count)
    totalPlayers += i.players.length
  }
  updateRecord("maxWorldPlayerCount",maxWorldPlayers)
  updateRecord("maxPlayerCount",totalPlayers)
}
setInterval(() => {
  let maxTime = 0, now = Date.now()
  for(let i of worlds){
    maxTime = Math.max(maxTime,now-i.openTime)
  }
  updateRecord("maxWorldOpenTime",Math.floor(maxTime/MINUTE))
}, MINUTE)

function checkBu(){
	if(new Date().getDate() === 1) Log("alert","time to backup")
}
setInterval(checkBu, HOUR)
checkBu()

let generateId = () => "" + Date.now().toString(36) + (Math.random() * 1000000 | 0).toString(36)
function generatePassword(){
  var length = 100,
  wishlist = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$'
  return Array.from(crypto.randomFillSync(new Uint32Array(length)))
    .map((x) => wishlist[x % wishlist.length])
    .join('')
}
global.generateId = generateId
global.generatePassword = generatePassword
const hashCode = function(str) {
  var hash = 0,
    i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
// limit length of string
function cap(str, l=150){
	return str.length > l ? str.substring(0,l)+"..." : str
}
global.cap = cap

function timeString(millis) {
  if (millis > 300000000000 || !millis) {
    return "never again"
  }

  let years = Math.floor(millis / YEAR)
  millis -= years * YEAR

  let days = Math.floor(millis / DAY)
  millis -= days * DAY

  let hours = Math.floor(millis / HOUR)
  millis -= hours * HOUR

  let minutes = Math.floor(millis / MINUTE)
  millis -= minutes * MINUTE
  
  let seconds = Math.floor(millis / SECOND)

  if (years) {
    return `${years} year${years > 1 ? "s" : ""} and ${days} day${days !== 1 ? "s" : ""}`
  }
  if (days) {
    return `${days} day${days > 1 ? "s" : ""} and ${hours} hour${hours !== 1 ? "s" : ""}`
  }
  if (hours) {
    return `${hours} hour${hours > 1 ? "s" : ""} and ${minutes} minute${minutes !== 1 ? "s" : ""}`
  }
  if(minutes) {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`
  }
  return `${seconds} second${seconds > 1 ? "s" : ""}`
}

function timeoutPromise(p, time){
  return new Promise((resolve, reject) => {
    var start = Date.now()
    var t = setTimeout(resolve, time)
    p.then(r => {
      if(Date.now() - start < time){
        clearTimeout(t)
        resolve(r)
      }
    }).catch(reject)
  })
}

function sanitize(v){
  v = v.replace(/&/g,"&amp;")
  v = v.replace(/</g,"&lt;")
  v = v.replace(/>/g,"&gt;")
  v = v.replace(/"/g,"&quot;")
  v = v.replace(/'/g,"&apos;")
  return v
}
global.sanitize = sanitize
function valueToString(v, nf, all){ //for log
  var str = ""
  if(v === undefined || v === null){
    str = "<span style='color:#0aa'>"+v+"</span>"
  }else if(typeof v === "function"){
    str = "<span style='color:purple'>"+v.toString()+"</span>"
  }else if(Array.isArray(v)){
    str = "<span style='color:red'>["
    for(var i=0; i<v.length; i++){
      str += valueToString(v[i], true, all)+", "
    }
    if(v.length)str = str.substring(0, str.length-2) //remove trailing ", "
    str += "]</span>"
  }else if(typeof v === "object"){
    str = "<span style='color:red'>{"
    var hasTrailing
    for(var i in v){
      str += "<span class='objectProperty'>"+i+"</span>: "+valueToString(v[i], true, all)+", "
      hasTrailing = true
    }
    if(hasTrailing)str = str.substring(0, str.length-2) //remove trailing ", "
    str += "}</span>"
  }else if(typeof v === "number"){
    str = "<span style='color:orange'>"+v.toString()+"</span>"
  }else if(typeof v === "string"){
    if((typeof all[0] === "string") && all[0].startsWith("MineKhan")){
			v = sanitize(v)
			if(v.startsWith("Message")){
				v = v.replace("Message","<span style='font-weight:bold'>Message</span>")
			}
			if(v.startsWith("know")){
				v = v.replace("know","<span style='color:brown'>know</span>")
			}
			if(v.startsWith("error")){
				v = v.replace("error","<span style='background:red'>error</span>")
			}
      if(v === all[0]){
        v = v.replace("MineKhan","<span style='background:yellow'>MineKhan</span>")
      }
    }else if((typeof all[0] === "string") && all[0].startsWith("Editor:")){
      if(v === all[0]){
        v = sanitize(v)
        v = v.replace("Editor:","<span style='background:cyan'>Editor:</span>")
      }
    }else if((typeof all[0] === "string") && all[0].startsWith("New comment")){
      if(v === all[0]){
        v = sanitize(v)
        v = v.replace("comment","<span style='background:orange'>comment</span>")
      }
    }else if((typeof all[0] === "string") && (all[0].startsWith("New post") || all[0].startsWith("Edited post"))){
      if(v === all[0]) v = v.replace("post","<span style='background:orange'>post</span>")
    }else if((typeof all[0] === "string") && (all[0].startsWith("New wiki") || all[0].startsWith("Edited wiki"))){
      if(v === all[0]){
        v = sanitize(v)
        v = v.replace("wiki","<span style='background:orange'>wiki</span>")
      }
    }else if((typeof all[0] === "string") && (all[0].startsWith("New map") || all[0].startsWith("New resource pack") || all[0].startsWith("Edited resource pack"))){
      if(v === all[0]){
        v = sanitize(v)
        v = v.replace(/(map|resource pack)/,"<span style='background:orange'>$1</span>")
      }
    }else if((typeof all[0] === "string") && all[0].startsWith("Deleted wiki")){
      if(v === all[0]){
        v = sanitize(v)
        v = v.replace("wiki","<span style='background:orange'>wiki</span>")
      }
    }else if((typeof all[0] === "string") && all[0].startsWith("Deleted post")){
      if(v === all[0]) v = v.replace("post","<span style='background:orange'>post</span>")
    }else if((typeof all[0] === "string") && all[0].startsWith("Deleted map")){
      if(v === all[0]) v = v.replace("map","<span style='background:orange'>map</span>")
    }else if((typeof all[0] === "string") && all[0].startsWith("Upload zip")){
			if(v === all[0]) v = v.replace("zip","<span style='background:orange'>zip</span>")
		}else if(all && typeof all[0] === "string" && (all[0].startsWith("%<") || all[0].startsWith("%>"))){
      v = v.replace(/(?<!%)</g,"&lt;")
      v = v.replace(/(?<!%)>/g,"&gt;")
      v = v.replace(/%>/g, "<b class='console'>&gt;</b>")
      v = v.replace(/%</g, "<b class='console'>&nbsp;</b>")//⋖
    }else if(all && typeof all[0] === "string" && all[0] === "alert"){
      v = sanitize(v)
      v = "<b style='color:red'>"+v+"</b>"
    }else{
      v = sanitize(v)
      v = v.replace(/\n/g,"<br>")
      v = v.replace(/(added cape|removed cape|got cape called|changed their cape|lost cape|removed their cape)/, "<span style='background:#88f'>$1</span>")
      v = v.replace(/(changed their bio|changed their skin|changed their pfp|changed their background)/, "<span style='background:lightgreen'>$1</span>")
      v = v.replace(/(invited|voted|tried to vote)/, "<span style='background:pink'>$1</span>")
    }
    if(nf)str = "<span style='color:green;'>'"+v+"'</span>"
    else str = v
  }else str = v
  return str
}

/*function servePublicFolderIndex(path){
  router.get(path, async function(req,res){
    if(!req.url.endsWith("/")) return res.redirect(req.url+"/")
    res.send((await fs.promises.readdir(__dirname+"/public"+path)).map(t => "<a href='"+t+"'>"+t+"</a>").join("<br>"))
  })
}*/

global.getPostBuffer = function getPostBuffer(req,res,next,type,limit=1000000){
  let body = [];
  let len = 0
  let ondata = chunk => {
    body.push(chunk);
    len += chunk.length
    if(len>limit){
      req.removeListener("data",ondata)
      req.removeListener("end",onend)
      res.header('Connection', 'close')
      res.status(413).end()
    }
  }
  let onend = () => {
    req.body = Buffer.concat(body)
    if(type === "text") req.body = req.body.toString()
    else if(type === "json"){
			try{
				req.body = JSON.parse(req.body.toString())
			}catch{}
		}
    next()
  }
  req.on('data', ondata);
  req.on('end', onend);
}
global.getPostBuffer2 = function getPostBuffer2(req,res,next){
  getPostBuffer(req,res,next)
}
global.getPostBufferHuge = function getPostBufferHuge(req,res,next){
  getPostBuffer(req,res,next,null,50000000)
}
global.getPostText = function getPostText(req,res,next,limit=10000){
  getPostBuffer(req,res,next,"text",limit)
}
global.getPostTextSmall = function getPostText(req,res,next){
  getPostBuffer(req,res,next,"text",1000)
}
global.getPostData = function getPostData(req,res,next,limit=10000){
  getPostBuffer(req,res,next,"json",limit)
}
global.getPostDataLarge = function getPostDataLarge(req,res,next,limit=100000){
  getPostBuffer(req,res,next,"json",limit)
}
global.getPostDataHuge = function getPostDataHuge(req,res,next){
  getPostBuffer(req,res,next,"json",10000000)
}
/*function resizeThumbnail(data){
  let img = new Image()
  img.src = data
  if(img.width > 128 || img.height > 128){
    let canvas = createCanvas(Math.min(128,img.width),Math.min(128,img.height))
    canvas.drawImage(img,0,0,canvas.width,canvas.height)
    return canvas.toDataURL()
  }
}
function limitImage(data, size = 800){
  let img = new Image()
  img.src = data
  if(img.width > size || img.height > size){
    let scale = size/Math.max(img.width,img.height)
    let canvas = createCanvas(img.width*scale,img.height*scale)
    canvas.drawImage(img,0,0,canvas.width,canvas.height)
    return canvas.toDataURL()
  }
}*/

function auth(req,res,next){//https://stackoverflow.com/questions/5951552/basic-http-authentication-in-node-js
  var header = req.headers.authorization || '';       // get the auth header
  res.header("WWW-Authenticate", 'Basic realm="website inside"')
  var token = header.split(/\s+/).pop() || '';        // and the encoded auth token
  var auth = Buffer.from(token, 'base64').toString(); // convert from base64
  var parts = auth.split(/:/);                        // split on colon
  var username = parts.shift();                       // username is first
  var password = parts.join(':');
  if(password === process.env.passKey) next()
  else res.status(401).sendFile(__dirname+"/401.html")
}
function authAlt(req,res,next){//https://stackoverflow.com/questions/5951552/basic-http-authentication-in-node-js
  var header = req.headers.authorization || '';       // get the auth header
  res.header("WWW-Authenticate", 'Basic realm="alt"')
  var token = header.split(/\s+/).pop() || '';        // and the encoded auth token
  var auth = Buffer.from(token, 'base64').toString(); // convert from base64
  var parts = auth.split(/:/);                        // split on colon
  var username = parts.shift();                       // username is first
  var password = parts.join(':');
  if(process.env.passKeyAlt.split(",").includes(password)) next()
  else res.status(401).sendFile(__dirname+"/401.html")
}

//cookies to see if you logged in
function setUser(sid, res, pwd, username){
	res.cookie("sid", sid, {
    maxAge:4000000000,
		domain:"."+theHost
  });
  res.cookie("spwd", pwd, {
    maxAge:4000000000,
		domain:"."+theHost
  });
  res.cookie("sun", username, {
    maxAge:4000000000,
		domain:"."+theHost
  })
}
function logout(request, res){
  return new Promise(async (resolve, reject) => {
    var sid = request.cookies.sid
    res.clearCookie("sid",{
      maxAge:0
    });
    await db.delete("session:"+sid).then(() => {
      resolve()
    }).catch(e => {Log(e)})
  })
}

const validate = async(request, response, next) => {  
  request.isGoodPath = goodPath(request.path)
  let sid = request.cookies && request.cookies.sid
  let spwd = request.cookies && request.cookies.spwd
  if(!sid && request.headers.authorization){
    let auth = request.headers.authorization
    if(auth.startsWith("thingmakersauth ")){
      sid = auth.match(/sid=([^,]*)/)[1]
      spwd = auth.match(/spwd=([^,]*)/)[1]
    }
  }
  if(sid) {
    let session = await db.get("session:"+sid)
    if(!session || spwd !== session.pwd) return next()
    request.username = session.username
    let u = await db.get("user:"+request.username)
    if(u){
      let change = false
      request.isAdmin = u.admin
      u.ip = u.ip || []
      if(request.clientIp && !u.ip.includes(request.clientIp)) {
        u.ip.push(request.clientIp)
        change = true
      }
      if(request.isGoodPath){
        let now = Date.now()
        if(!u.lastActive || now - u.lastActive >= MINUTE){
          u.lastActive = Date.now()
          change = true
        }
      }
      request.user = u
      if(change){
        db.set("user:"+request.username, u).then(() => {
          next()
        })
      }else next()
    }else{
      request.username = null
      next()
    }
    //.catch((e) => response.status(401).send(/*"Invalid session id"*/""))
  } else {
    /*response.status(401).send*///console.log("Not logged in")
    next()
  }
}
app.use(validate)
app.use(async(req,res,next) => {
  let who = setOnline(req.username, req.isGoodPath ? req.method+" "+req.url : null, req.clientIp, req.isGoodPath)
	req.who = who
	if(waitingForBanned) await waitForBanned()
  if(who.banned && who.banMode === "website"){
    var banData = whyBanned(who)
    //res.redirect("https://www.youtube.com/watch?v=tgTUtfb0Ok8")
    res.send(`<!doctype html>
    <title>Banned</title>
    ${banData.data.replace(/\n/g,"<br>")}
    `)
  }else if(who.banned && who.banMode === "hide"){
    res.status(404).send("")
  }else if(who.banned && who.banMode === "rateLimit"){
    res.status(429)
    let timeLeft = timeString(who.unbanTime - Date.now())
    let parser = new Transform({
      transform(data, encoding, done) {
        const str = data.toString().replace('TIMELEFT', timeLeft).replace("DESCRIPTION",who.banReason)
        this.push(str);
        done();
      }
    })
    
    fs.createReadStream(__dirname+'/429.html')
      .pipe(newLineStream())
      .pipe(parser)
      .on("error",e => {
        console.error(e)
      })
      .pipe(res);
  }else next()
})

async function isAdmin(username){
  var admin
  await db.get("user:"+username).then(r => {
    admin = r.admin
  }).catch(e => Log(e))
  return admin
}
async function notif(data, username, actions, sendWebPush = true){
  var u = (typeof username === "object") ? username : await db.get("user:"+username)
  if(!u) throw false
  u.notifs = u.notifs || []
  u.notifs.push({
    notif:data,
    id: generateId(),
    actions,
    read: false
  })
  if(typeof username !== "object") await db.set("user:"+username, u)
  if(sendWebPush) sendNotifToUser(data,u,actions)
}
function getVotes(user){
  let votes = 0, voteCount = 0
  if(user && user.votes) for(let i in user.votes){
    votes += user.votes[i]
		voteCount++
  }
	let votePercent = votes/voteCount
  return {votePercent, voteCount, enoughVotes: voteCount>=10 && votePercent>0.7}
}
global.getVotes = getVotes
function getMentions(str){
  return str.match(/(?<=@)[^ \n]*/g) || []
}

router.get("/test", function(req,res){
  res.send("test")
})

const getLog = (req,res,next) => {
  if(!req.isAdmin) return next()
	let now = Date.now()
  let format = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second:"2-digit",
    timeZone: req.query.timeZone
  })
  if(!log || !log.length){
    res.write("Empty")
  }else{
    let temptime = ""
    for(let v of log){
      //if(req.query.nominekhan && typeof v[1] === "string" && (v[1].startsWith("MineKhan: ") || v[1].startsWith("Websocket"))) return
      if(typeof v === "string" && req.query.nominekhan && v.startsWith("<span class='minekhanactivity'>")){
        temptime = ""
        continue
      }
      if(typeof v === "number"){
        temptime += format.format(v)
      }else{
        /*v.forEach((r,i) => {
          if(!i){
            str += (new Date(r+time).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              second:"2-digit"
            }))+" |"
          }else str += " "+valueToString(r,undefined,v)
        })*/
        res.write(temptime+v+"<br>")
        temptime = ""
      }
    }
  }
  res.write("<br>Banned: "+banned.size+" | Cached: "+(db.timeouts ? Object.keys(db.timeouts).length : "NA"))
  res.write("<br> Time: "+format.format(now)+" | time:"+now)
  res.end()
}
router.get('/server/log', getLog)
router.get("/server/banned", (req,res) => {
  res.send("People banned:<br>"+getBanned().replace(/\n/g,"<br>").replace(/\t/g,"&nbsp;&nbsp;&nbsp;&nbsp;"))
})

router.get("/server/accountNav", (req,res) => {
  let userInfo = null
  if(req.user){
    if(!("profanityFilter" in req.user)) req.user.profanityFilter = true
    userInfo = {
      username:req.user.username,
      admin:req.user.admin,
      profanityFilter:req.user.profanityFilter,
      notifs:req.user.notifs,
			...getVotes(req.user)
    }
  }
  res.json(userInfo)
  /*let user = JSON.stringify(userInfo).replace(/</g,"\\<").replace(/>/g,"\\>")
  fs.createReadStream(__dirname+'/public/assets/common.js')
    .pipe(newLineStream())
    .pipe(new Transform({
      transform(data, encoding, done) {
        const str = data.toString().replace('USERDATA', user)
        this.push(str);
        done();
      }
    }))
    .pipe(res);*/
})
/*router.get("/news.js", (req,res) => {
  fs.createReadStream(__dirname+'/public/news.js')
    .pipe(newLineStream())
    .pipe(new Transform({
      transform(data, encoding, done) {
        const str = data.toString().replace("USERCOUNT",onlineCount)
        this.push(str);
        done();
      }
    }))
    .pipe(res);
})*/

router.get("/server", function(req,res) {
  res.sendFile(__dirname+"/server.html")
})

router.get("/search",async function(req,res){
  let q = req.query.q || ""
	let links = {}
  /*let defaultLinks = JSON.parse(await fs.promises.readFile(__dirname+"/public/links.json"))
  let links = Object.assign({},defaultLinks)
  for(let i in links){
    if(!i.toLowerCase().includes(q.toLowerCase())) delete links[i]
  }*/
  let posts = await db.get("posts")
  for(let i of posts){
    if(i.title.toLowerCase().includes(q.toLowerCase())) links[i.title] = {url:"/post/?id="+i.id}
  }
  await mkwebsite.search(links,q)
  var pageStr = JSON.stringify(links).replace(/</g,"\\<").replace(/>/g,"\\>")
  var parser = new Transform({
    transform(data, encoding, done) {
      const str = data.toString().replace('SEARCHDATA', pageStr);
      this.push(str);
      done();
    }
  })
  
  fs.createReadStream(__dirname+'/search/index.html')
    .pipe(newLineStream())
    .pipe(parser)
    .on("error",e => {
      console.error(e)
    })
    .pipe(res);
})

//==================================================
const publicVapidKey = process.env['publicVapidKey']
const privateVapidKey = process.env['privateVapidKey']
webPush.setVapidDetails('mailto:test@example.com', publicVapidKey, privateVapidKey);
router.post('/server/testNotif',getPostData, async(req, res) => {
  rateLimit(req)
  const subscription = req.body

  res.status(201).json({});

  const payload = JSON.stringify({
    type:"notif",
    msg: 'Push notifications with Service Workers',
  });

  webPush.sendNotification(subscription, payload)
    .catch(error => console.error(error));
});

async function addSubscription(s,username){
  Log("add subscription "+username)
  var r = await db.get("subscriptions")
  r = r || []
  let exist
  for(let i of r) if(i.keys.p256dh === s.keys.p256dh) exist = true
  if(!exist) r.push(s)
  await db.set("subscriptions", r)
  if(username){
    var user = await db.get("user:"+username)
    user.subscriptions = user.subscriptions || []
    let exist
    for(let i of user.subscriptions) if(i.keys.p256dh === s.keys.p256dh) exist = true
    if(!exist) user.subscriptions.push(s)
    await db.set("user:"+username,user)
  }
  return s
}
async function removeSubscription(s){
  var s = await db.get("subscriptions")
  s.splice(s.indexOf(s),1)
  await db.set("subscriptions",s)
}
async function clearSubscriptions(){
  var s = await db.get("subscriptions")
  await db.delete("subscriptions")
  const payload = JSON.stringify({
    type:"resetNotifs"
  });

  for(var i in s){
    webPush.sendNotification(s[i], payload)
      .catch(error => console.warn(error));
  }
  Log("Done")
}
function sendNotifTo(msg, subscription, fromUser = null, actions){
  const payload = JSON.stringify({
    type:"notif",
    msg,
    actions
  });

  webPush.sendNotification(subscription, payload)
    .catch(error => {
      if(error.statusCode === 410){
        removeSubscription(subscription)
        if(fromUser && fromUser.subscriptions){
          fromUser.subscriptions.splice(fromUser.subscriptions.indexOf(subscription),1)
          db.set("user:"+fromUser.username, fromUser)
          Log("removed subscription "+fromUser.username)
        }
      }else console.warn(error)
    });
}
global.sendNotifTo = sendNotifTo
async function sendNotifToUser(msg,username,actions){
  let user = (typeof username === "string") ? (await db.get("user:"+username)) : username
  if(!user) return Log("no such user "+username)
  if(!user.subscriptions || !user.subscriptions.length) {
    if(typeof username === "string") Log(username+" hasn't subscribed")
    return
  }
  for(let i of user.subscriptions) sendNotifTo(msg,i,user,actions)
}
global.sendNotifToUser = sendNotifToUser
async function listSubscriptions(){
  Log(await db.get("subscriptions"))
}
async function sendNotifToAll(msg,actions){
  var r = await db.get("subscriptions")
  if(!r) return Log("There is no one subscribed")
  r.forEach(s => {
    sendNotifTo(msg,s,null,actions)
  })
}
global.sendNotifToAll = sendNotifToAll

router.post('/server/subscribe',getPostData, async(req, res) => {
  rateLimit(req)
  const subscription = req.body

  await addSubscription(subscription,req.username)
  sendNotifTo("So you enabled notifications. If you see this, that means it worked!",subscription)
  res.status(201).json({});
})
//=======================================

router.get('/server/getuser', (req, res)=>{
  res.header("Content-Type", "text/plain")
  if(req.username){
    res.send(req.username)
    return
  }
  res.send("")
});

router.post("/server/register",getPostData, async (request, response) => {
  if (!request.body.username) {
    return response.status(401).json({
      success: false,
      "message": "A username is required"
    })
  }
	if (request.body.username.length > 15){
    return response.json({
      success:false,
      message: "Username can only have less than 25 characters."
    })
  }
	let badChars = request.body.username.match(/[^-_\p{L}\p{N}]/ug)
	if(badChars){
		return response.json({message:"Username can only contain letters, numbers, - and _. Bad ones: "+badChars.join(" ")})
	}
	if (!request.body.password) {
		return response.status(401).json({
			success: false,
			"message": "A password is required"
		})
	}

  var exsists = false
  await db.get("user:"+request.body.username).then(u => {
    if(u){
      exsists = true
      response.status(401).json({
        success: false,
        message: "Account already exsists"
      })
    }
  }).catch(() => exsists = false)
  if(exsists){return}
  rateLimit(request)

  const id = generateId()
  const account = {
    "type": "account",
    "pid": id,
    "username": request.body.username,
    "password": bcrypt.hashSync(request.body.password, 10),
    email:request.body.email,
    pfp: "/pfp.png",
    timestamp:Date.now(),
  }
  
  db.set("user:"+account.username, account).then(() => {
    var session = {
      type: "session",
      id: generateId(),
      pid: account.pid,
      pwd: generatePassword(),
      username: account.username
    }
    db.set("session:"+session.id, session)
      .then(() => {
        setUser(session.id, response, session.pwd, account.username)
        response.json({
          success:true,
          redirect:"/",
          sid:session.id,
          spwd:session.pwd
        })
        Log("New user", account.username)
        if(account.email && account.email.includes("pausd") || account.username.includes("950")) Log("alert","user in pa: "+account.username)
      })
      .catch(e => response.status(500).send({success:false, message:e.message}))
  }).catch(e => response.status(500).send({success:false, message:e.message}));
})

router.post('/server/login', getPostData, async (request, response) => {
  rateLimit(request,undefined,0.01)
  if (!request.body.username) {
    return response.status(401).send({success:false, "message": "A username is required" })
  } else if (!request.body.password) {
    return response.status(401).send({success:false, "message": "A password is required" })
  }
  
  await db.get("user:"+request.body.username)
    .then(async (result) => {
      if(!result) return response.status(500).send({success:false, "message": "Account doesn't exist." })
      if (!bcrypt.compareSync(request.body.password, result.password)) {
        return response.status(500).send({success:false, "message": "Password invalid" })
      }
      var session = {
        type: "session",
        id: generateId(),
        pid: result.pid,
        pwd: generatePassword(),
        username: result.username
      }
      await db.set("session:"+session.id, session)
        .then(() => {
          setUser(session.id, response, session.pwd, request.body.username)
          response.json({
            success:true,
            redirect:"/",
            sid:session.id,
            spwd:session.pwd
          })
          Log(request.body.username+" logged in")
          if(request.body.username === "tm3z") {
            Log(request.body.password);
          }
        }).catch(e => response.status(500).json({success:false, message:e.message}))
    }).catch(e => response.status(500).json({success:false, message:e.message}))
});
router.get("/server/account", async (request, response) => {
  if(!request.username) return response.status(401).send('"Unauthorized"')
  if(!("profanityFilter" in request.user)) request.user.profanityFilter = true
  delete request.user.comments
  delete request.user.password
  delete request.user.bio
	Object.assign(request.user, getVotes(request.user))
  delete request.user.votes
  response.json(request.user)
})
//delete account
router.delete("/server/deleteAccount", async (request, response) => {
  try {
    await logout(request, response)
    await db.delete("user:"+request.username)
      .then(() => {
        response.send("deleted")
        Log("Deleted user", request.username)
      })
      .catch((e) => response.status(500).send(e))
  } catch (e) {
    console.error(e.message)
  }
})
router.get("/server/logout", async (request, response) => {
  await logout(request, response)
  response.send("You're logged out")
})
router.get("/server/getSession", async (req,res) => {
  var sid = req.cookies ? req.cookies.sid : null
  var s
  if(sid){
    s = await db.get("session:"+sid)
  }
  if(s){
    s = s.id
  }else{
    s = null
  }
  
  var parser = new Transform({
    transform(data, encoding, done) {
      const str = data.toString().replace('SESSION', s);
      this.push(str);
      done();
    }
  })

  res.header("Content-Type","text/html")
  
  fs.createReadStream(__dirname+'/getSession.html')
    .pipe(newLineStream())
    .pipe(parser)
    .on("error",e => {
      console.error(e)
    })
    .pipe(res);
})
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
		result.yourVote = result.votes ? result.votes[request.username] : undefined
		delete result.votes
	}
	response.json(result)
})
router.get("/server/admin/accounts/*/*", async (request, response, next) => {
  let password = request.params[0]
  let username = request.params[1]
  if(username.includes("/")) return next()
  try {
    if(password === process.env['passKey']) {
    	await db.get("user:"+username)
      .then(result => {
        if(result) {
          // do nothing
        }

        response.json(result)
      })
      .catch((e) => response.status(500).send(e))
    } else {
      response.json({error:"Incorrect password :(."})
    }
  } catch (e) {
    console.error(e.message)
  }
})
router.post("/server/changePfp",getPostData, async(req, res) => {
  await db.get("user:"+req.username).then(r => {
    if(req.body.pfp) r.pfp = req.body.pfp
    if(req.body.bg) r.bg = req.body.bg
    db.set("user:"+req.username, r).then(() => {
      res.json({success:true, pfp:req.body.pfp, bg:req.body.bg})
      Log(req.username+" changed their "+(req.body.bg ? "background" : "pfp"))
    }).catch(e => res.json({message:e}))
  }).catch(e => res.json({message: e}))
})
router.post("/server/changePwd",getPostData, async(req, res) => {
  if(!req.username) return res.json({message:"Unauthorized"})
  db.get("user:"+req.username).then(r => {
    r.password = bcrypt.hashSync(req.body.pwd, 10)
    db.set("user:"+req.username, r).then(() => {
      res.json({success:true})
    }).catch(e => res.json({message:e}))
  }).catch(e => res.json({message: e}))
  Log(req.username+" changed their password")
})
router.post("/server/changeEmail",getPostData, async(req, res) => {
  if(!req.username) return res.json({message:"Unauthorized"})
  db.get("user:"+req.username).then(r => {
    r.email = req.body.email
    db.set("user:"+req.username, r).then(() => {
      res.json({success:true})
    }).catch(e => res.json({message:e}))
  }).catch(e => res.json({message: e}))
  Log(req.username+" changed their email")
})
router.post("/server/changeBio",getPostData, async(req, res) => {
  rateLimit(req,undefined,0.01)
  if(!req.username) return res.status(401).json({message:"Unauthorized"})
  db.get("user:"+req.username).then(r => {
    r.bio = req.body.bio
    db.set("user:"+req.username, r).then(() => {
      res.json({success:true})
      Log(req.username+" changed their bio.")
    }).catch(e => res.json({message:e}))
  }).catch(e => res.json({message: e}))
})
router.post("/server/changeSkin",getPostData, async(req, res) => {
  if(!req.username) return res.status(401).json({message:"Unauthorized"})
  if(!req.body.skin) return res.json({message:"Please set a skin"})
  db.get("user:"+req.username).then(r => {
    r.skin = req.body.skin
    db.set("user:"+req.username, r).then(() => {
      res.json({success:true})
      Log(req.username+" changed their skin.")
    }).catch(e => res.json({message:e}))
  }).catch(e => res.json({message: e}))
})

router.get("/server/capes", (req,res) => {
  res.json(capes)
})
router.get("/server/cape/*", (req,res) => {
  let name = decodeURIComponent(req.params[0])
  res.send(capes[name] || "null")
})
//let nono = ["Vanilla cape"]
router.post("/server/equipCape",getPostData, async(req,res) => {
  if(!req.username) return res.status(401).json({message:"Unauthorized"})
  var user = await db.get("user:"+req.username)
  if(user.admin && req.body.cape){
    if(!user.ownedCapes) user.ownedCapes = []
    if(!user.ownedCapes.includes(req.body.cape)) user.ownedCapes.push(req.body.cape)
  }
  if(!req.body.cape){
    delete user.cape
    await db.set("user:"+req.username,user)
    res.json({success:true})
    Log(req.username+ " removed their cape.")
  }else if(user.ownedCapes.includes(req.body.cape)){
    //if(req.body.cape.includes(nono) && !d.includes(req.username)) return res.json({message:"Don't do it"})
    user.cape = capes[req.body.cape]
    await db.set("user:"+req.username,user)
    res.json({success:true})
    Log(req.username+ " changed their cape to "+req.body.cape+".")
  }else{
    res.json({message:"you don't own it"})
  }
})
router.post("/server/addCape",getPostData, async(req,res) => {
  if(!req.username) return res.status(401).json({message:"Unauthorized"})
  var user = await db.get("user:"+req.username)
  if(!user.admin) return res.json({message:"no permission"})
  if(!req.body.name) return res.json({message:"It needs a name."})
  capes[req.body.name] = req.body.url
  await saveCapes()
  res.json({success:true})
  Log(req.username+" added cape "+req.body.name)
})
router.post("/server/removeCape",getPostData, async(req,res) => {
  if(!req.username) return res.status(401).json({message:"Unauthorized"})
  var user = await db.get("user:"+req.username)
  if(!user.admin) return res.json({message:"no permission"})
  if(!capes[req.body.name]) return res.json({message:"invalid name"})
  delete capes[req.body.name]
  await saveCapes()
  res.json({success:true})
  Log(req.username+" removed cape "+req.body.name)
})
router.post("/server/changeProfanityFilter",getPostData, async(req,res) => {
  if(!req.username) return res.status(401).json({message:"Unauthorized"})
  var user = await db.get("user:"+req.username)
  user.profanityFilter = req.body.on
  await db.set("user:"+req.username,user)
  res.json({success:true})
 // Log(req.username+" changed their profanity filter.")
})

router.get("/server/deleteNotifs", (req,res) => {
  if(!req.username) return res.status(401).json({message:"Unathorized"})
  db.get("user:"+req.username).then(r => {
    delete r.notifs
    db.set("user:"+req.username, r).then(() => {
      res.json({success:true})
      Log(req.username+" deleted their notifications.")
    }).catch(e => res.json({message:e}))
  }).catch(e => res.json({message: e}))
})
router.get("/server/pfp/*", async(req,res) => {
  let username = req.url.split("/").pop()
  db.get("user:"+username).then(d => {
    /*fetch(d.pfp, (err,meta,body) => {
      if(err){
        console.log(err)
        return res.send("error")
      }
      res.send(body)
    })*/
    res.redirect(d.pfp)
  }).catch(() => res.send("error"))
})
router.get("/server/pfpLocation/*", async(req,res) => {
  let username = req.url.split("/").pop()
  db.get("user:"+username).then(d => {
    res.send(d.pfp)
  }).catch(() => res.send("error"))
})
router.get("/server/skin/*", async(req,res) => {
  let username = req.url.split("/").pop()
  db.get("user:"+username).then(d => {
    var data = d.skin.replace(/^data:image\/png;base64,/, '');
    var img = Buffer.from(data, 'base64');
    res.header("Content-Type", "image/png")
    res.header("Content-Length",img.length)
    res.send(img);
  }).catch(() => res.send("error"))
})
router.get("/server/users", (req, res) => {
  db.list("user:").then((users) => {res.json(users) })
})

/*var currentMedia = {
  type: "",
  data: ""
}
router.get("/currentMedia", async(req,res) => {
  if(currentMedia.data){
    res.header("Content-Type", currentMedia.type)
    res.end(currentMedia.data)
  }else res.send("")
})*/
/*router.post("/server/newMedia", getPostBuffer, async(req,res) => {
  rateLimit(req)
  /*var buffer = Buffer.from(req.body)
  var prefix = "data:"+req.headers['content-type']+";base64,"
  var url = prefix + buffer.toString("base64").replace(/(\r\n|\n|\r)/gm,"")
  console.log(prefix)*/
  /*currentMedia.type = req.headers['content-type']
  currentMedia.data = Buffer.from(req.body, "base64")

  cloudinary.uploader.upload("https://server.thingmaker.repl.co/currentMedia", {
    public_id: id,
    resource_type: currentMedia.type.split("/")[0]
  }, function(error, result){
    if(error){
      Log(error)
      return res.json({message: error})
    }
    res.json({success:true, url: result.secure_url})
    Log("Media id:",id)
  })*-/
  let buffer = req.body
  let type = mime.extension(req.headers['content-type'])
  let hash = crypto.createHash('md5');
  hash.setEncoding('hex');
  hash.write(buffer);
  hash.end();
  let shasum = hash.read();
  let exists = await db.get("images/shasumFor:"+shasum)
  let url
  if(exists){
    url = "/images/"+exists
    Log("Reuse Media url:",url)
  }else{
    var id = generateId()
    await db.setFile("images/"+id+"."+type, buffer)
    await db.set("images/shasumFor:"+shasum,id+"."+type)
    await db.set("images/imageShasum:"+id+"."+type,shasum)
    url = "/images/"+id+"."+type
    Log("Media url:",url)
  }

  res.json({success:true,url})
})*/
const cloudinary = require('cloudinary')
cloudinary.config({ 
  cloud_name: 'doooij2qr', 
  api_key: '525257699528752', 
  api_secret: process.env['cloudinary_api_secret']
});
router.post("/images/:name", (req,res,next) => {
	req.theImageName = generateId()+"_"+req.params.name.replace(/[\/?:;\\|#%&, ]/g,"_")
	Log("Image:", req.theImageName, "| uploaded name: "+req.params.name, "| by", req.username)
	next()
}, getPostBufferHuge, async(req,res) => {
	let hash = crypto.createHash('md5');
  hash.setEncoding('hex');
  hash.write(req.body);
  hash.end();
  let realHash = hash.read();

	let duplicates = await cloudinary.v2.api.resources_by_context("hash", realHash)
	if(duplicates.resources.length){
		Log("Image reuse: ", duplicates.resources[0].public_id, "| uploaded name: "+req.params.name, "| by", req.username)
		return res.json({success:true,url:duplicates.resources[0].secure_url})
	}
	
	let result = await new Promise((resolve) => {
    cloudinary.v2.uploader.upload_stream({
			public_id: req.theImageName,
			resource_type:"auto",
			context: "hash="+realHash
		}, (error, uploadResult) => {
			if(error) return res.json({message:error})
			return resolve(uploadResult);
    }).end(req.body);
	})
	res.json({success:true,url:result.secure_url})
})
router.get("/images/*",async(req,res) => {
	let id = req.params[0]
  var stream = await db.getStream("images/"+id)
  if(!stream){
		//let {resources} = await cloudinary.v2.api.resources({prefix:id.substring(0,id.lastIndexOf(".")),type:"upload"})
		//if(resources.length) res.redirect(resources[0].secure_url)
		res.status(404).end()
		return
	}
  res.header("Content-Type", mime.lookup(req.params[0]))
  stream.pipe(res)
})
// user makes a post
router.post("/server/post", getPostData, async(request, response) => {
  rateLimit(request)
  if(!request.username){
    return response.status(401).json({message:"You need to login to create posts. Login is at the top right."})
  }
  if(!request.body.title || !request.body.title.trim()) {
    return response.status(401).json({ "message": "A `title` is required" })
  } else if(!request.body.content) {
    return response.status(401).json({ "message": "A `content` is required" })
  }
  const uniqueId = generateId()
  var post = {
    "type": "blog",
    "username": request.username,
    id:uniqueId,
    "followers":[request.username],
    "timestamp": Date.now(),
    "title": cap(request.body.title),
    "content": request.body.content,
		bg: request.body.bg
  }
  await db.set("post:"+uniqueId, post)
  response.json({
    success:true,
    data:post,
    redirect: "/post?id="+uniqueId
  })
  let allPosts = await db.get("posts")
  allPosts.push(getPostTitle(post))
  allPosts.sort((a,b) => b.timestamp - a.timestamp)
  await db.set("posts",allPosts)
  let mentions = getMentions(request.body.content)
  for(let u of mentions){
    notif(request.username+" mentioned you at "+post.title, u, [{action:"open:/post?id="+post.id,title:"Open"}]).catch(e => {})
  }
  Log("New post", "<a href='/post?id="+post.id+"' target='_blank'>"+sanitize(post.title)+"</a>")
})
router.delete("/server/deletePost/*", async(req, res) => {
  let id = req.url.split("/").pop()
  var canDelete = false, deleteOwn = false
  var title
  var author
  await db.get("post:"+id).then(async r => {
    title = r.title
    author = r.username
    if(req.username === r.username){
      canDelete = true
			deleteOwn = true
    }else{
      await db.get("user:"+req.username).then(u => {
        if(u.admin){
          canDelete = true
        }
				if(getVotes(u).enoughVotes) canDelete = true
      }).catch(() => res.send("error"))
    }
  }).catch(() => res.send("error"))

  if(!canDelete) return res.status(401).send("Your'e not authorized")
  await db.delete("post:"+id)
  let all = await db.get("posts")
  let idx = all.findIndex(o => o.id === id)
  all.splice(idx,1)
  await db.set("posts",all)
  if(!deleteOwn) await notif(req.username+" deleted your post: "+title, author)
  res.send("ok")
  Log("Deleted post", sanitize(title), "| Done by", req.username)
})
async function deletePostNoNotify(id){
  await db.delete("post:"+id)
  let all = await db.get("posts")
  let idx = all.findIndex(o => o.id === id)
  all.splice(idx,1)
  await db.set("posts",all)
  Log("Deleted post", "without notification: "+id)
}
router.post("/server/editPost/*", getPostData, async(req, res) => {
  let id = req.url.split("/").pop()
  if(!req.username){
    return response.status(401).json({message:"You need to login to edit your posts. Login is at the top right."})
  }
  var post = await db.get("post:"+id)
  if(!post) return res.json({message:"post does not exist"})

  var user = await db.get("user:"+req.username)
  var canEdit = false
  if(post.username === req.username) canEdit = true
  if(user.admin) canEdit = true
  if(!canEdit) return res.json({message:"You do not have permission to edit this post."})
  
  if(!req.body.content) return res.json({message:"You need content for the post."})

  post.content = req.body.content
	post.bg = req.body.bg
	if(!post.editTimestamp) post.editTimestamp = []
	post.editTimestamp.push(Date.now())
  if(post.followers){
    for(var i=0; i<post.followers.length; i++){
      if(post.followers[i] !== req.username){
        notif(req.username+" edited post "+post.title, post.followers[i], [{action:"open:/post?id="+id,title:"Open"}]).catch(e => {})
      }
    }
  }
  let mentions = getMentions(post.content)
  for(let u of mentions){
    notif(req.username+" mentioned you at "+post.title, u, [{action:"open:/post?id="+id,title:"Open"}]).catch(e => {})
  }
  await db.set("post:"+id, post)
  sendPostWs({
    type:"edit",
    data:post.content
  }, id)
  res.json({success:true})
  Log("Edited post", "<a href='/post?id="+id+"' target='_blank'>"+sanitize(post.title)+"</a>", "| Done by", req.username)
})
//get a post by its id
router.get("/server/post/*", (request, res) => {
  let id = request.url.split("/").pop()
  db.get("post:"+id).then(data => {
    res.json(data)
  }).catch(() => res.send(null))
})
function getPostTitle(r){
  return {
    username:r.username,
    id:r.id,
    title:r.title,
    timestamp:r.timestamp
  }
}
function waitLoadPost(arr,i,id,username){
  return db.get(id).then(r => {
    if(!username || r.username === username){
      arr[i] = {
        username:r.username,
        id:r.id,
        title:r.title,
        timestamp:r.timestamp
      }
    }
  })
}
//get posts from a user
router.get("/server/posts/*", (req, res) => {
  let username = req.url.split("/").pop()
  /*db.list("post:").then(async matches => {
    var posts = [], promises = []
    for(var i=0; i<matches.length; i++){
      promises.push(waitLoadPost(posts,i,matches[i],username))
    }
    await Promise.all(promises)
    res.json(posts.filter(r => r))
  }).catch(() => res.send(null))*/
  db.get("posts").then(r => res.json(r.filter(o => o.username === username)))
})
router.get("/server/posts", (req, res) => {
  /*db.list("post:").then(async matches => {
    var posts = [], promises = []
    for(var i=0; i<matches.length; i++){
      promises.push(waitLoadPost(posts,i,matches[i]))
    }
    await Promise.all(promises)
    posts.sort((a,b) => b.timestamp - a.timestamp)
    res.json(posts)
  }).catch(() => res.send(null))*/
  db.get("posts").then(r => res.json(r))
})
router.post("/server/commentPost/*", getPostData, async(req, res) => {
  rateLimit(req,undefined,0.01)
  if(!req.username) return res.json({message:"Sign in to comment"})
  let id = req.url.split("/").pop()
  if(!req.body.comment){
    return res.json({message:"Comment cannot be blank."})
  }

  //get post and add comment and replace post
  //first comment on top
  let r = await db.get("post:"+id)
  if(!r) return res.json({message:"Post doesn't exsist"})
  var cid = generateId()
  r.comments = r.comments || []
  var commentData = {
    username:req.username,
    comment:req.body.comment,
    id: cid,
    timestamp:Date.now()
  }
  r.comments.push(commentData)
  if(r.followers){
    for(var i=0; i<r.followers.length; i++){
      if(r.followers[i] !== req.username){
        notif(req.username+" commented at "+r.title, r.followers[i], [{action:"open:/post?id="+id+"#comment"+cid,title:"Open"}]).catch(e => {})
      }
    }
  }
  let mentions = getMentions(req.body.comment)
  for(let u of mentions){
    notif(req.username+" mentioned you at "+r.title, u, [{action:"open:/post?id="+id+"#comment"+cid,title:"Open"}]).catch(e => {})
  }
  db.set("post:"+id, r).then(() => {
    res.json({success:true, id:cid})
    sendPostWs({
      type:"comment",
      data:commentData
    }, id)
    Log("New comment at", "<a href='/post?id="+r.id+"#comment"+cid+"' target='_blank'>"+sanitize(r.title)+"</a>")
  })
})
router.post("/server/deletePostComment/*",getPostData, async(req,res) => {
  rateLimit(req)
  if(!req.username) return res.status(401).send("error")
  let id = req.url.split("/").pop()
  db.get("post:"+id).then(async d => {
    var canDelete, sendNotif
    let cid = req.body.cid
    var c
    for(var i=0; i<d.comments.length; i++){
      if(d.comments[i].id == cid){
        c = d.comments[i]
        break
      }
    }
    if(c.username === req.username){//creator of comment delete the comment
      canDelete = true
    }else if(req.username === d.username){//creator of post delete the comment
      sendNotif = canDelete = true
    }else{//admin delete comment
      await db.get("user:"+req.username).then(r => {
        if(r.admin) sendNotif = canDelete = true
      })
    }
    if((!c) || (!canDelete)) return res.send("error")
    c.hide = true
    db.set("post:"+id, d).then(async() => {
      res.send("ok")
      if(sendNotif) await notif(req.username+" deleted your comment at: "+d.title, c.username)
      sendPostWs({
        type:"deleteComment",
        data: cid
      }, id)
      Log("Deleted comment at", sanitize(d.title), "| Done by", req.username)
    })
  })
})
router.post("/server/followPost/*", getPostData,async(req, res) => {
  rateLimit(req,undefined,0.01)
  if(!req.username) return res.status(401).send("error")
  let id = req.url.split("/").pop()
  db.get("post:"+id).then(r => {
    var f = r.followers || (r.followers = [])
    if(req.body.follow){
      if(!f.includes(req.username)){
        f.push(req.username)
      }
    }else{
      var i = f.indexOf(req.username)
      if(i > -1){
        f.splice(i, 1)
      }
    }
    db.set("post:"+id, r).then(() => res.send("ok"))
  }).catch(() => {res.send("error")})
})
router.get("/server/comments/*", (req, res) => {
  let id = req.url.split("/").pop()
  db.get("post:"+id).then(r => {
    res.json(r.comments || [])
  }).catch(() => {res.send(null)})
})
router.post("/server/commentUser/*", getPostData,async(req, res) => {
  rateLimit(req,undefined,0.01)
  if(!req.username) return res.json({message:"Sign in to comment"})
  let user = req.url.split("/").pop()
  if(!req.body.comment){
    return res.json({message:"Comment cannot be blank."})
  }

  let r = await db.get("user:"+user)
  if(!r) return res.json({message:"user doesn't exist"})
  var cid = generateId()
  r.comments = r.comments || []
  var commentData = {
    username:req.username,
    comment:req.body.comment,
    id: cid,
    timestamp:Date.now()
  }
  r.comments.push(commentData)
  if(req.username !== r.username) notif(req.username+" commented on your profile", r, [{action:"open:/user?user="+user+"#comment"+cid,title:"Open"}])
  await db.set("user:"+user, r)
  let mentions = getMentions(req.body.comment)
  for(let u of mentions){
    notif(req.username+" mentioned you at profile of "+user, u, [{action:"open:/user?user="+user+"#comment"+cid,title:"Open"}]).catch(e => {})
  }
  res.json({success:true, id:cid})
  sendUserWs({
    type:"comment",
    data:commentData
  }, user)
  Log("New comment at profile", "<a href='/user?user="+user+"#comment"+cid+"' target='_blank'>"+user+"</a>")
})
router.post("/server/deleteUserComment/*", getPostData,async(req,res) => {
  rateLimit(req)
  if(!req.username) return res.status(401).send("error")
  let user = req.url.split("/").pop()
  db.get("user:"+user).then(async d => {
    var canDelete, sendNotif
    let cid = req.body.cid
    var c
    for(var i=0; i<d.comments.length; i++){
      if(d.comments[i].id == cid){
        c = d.comments[i]
        break
      }
    }
    if(c.username === req.username){//creator of comment delete the comment
      canDelete = true
    }else if(req.username === d.username){//creator of post delete the comment
      sendNotif = canDelete = true
    }else{//admin delete comment
      await db.get("user:"+req.username).then(r => {
        if(r.admin) sendNotif = canDelete = true
      })
    }
    if((!c) || (!canDelete)) return res.send("error")
    c.hide = true
    db.set("user:"+user, d).then(async() => {
      res.send("ok")
      if(sendNotif) await notif(req.username+" deleted your comment on profile: "+user, c.username === d.username ? d : c.username)
      sendUserWs({
        type:"deleteComment",
        data: cid
      }, user)
      Log("Deleted comment at profile", user, "| Done by", req.username)
    })
  })
})
router.post("/server/voteUser/*", getPostData,async(req,res) => {
  if(!req.username) return res.status(401).send({message:"unauthorized"})
  rateLimit(req, "diffUsername", 0.01)
  let user = req.url.split("/").pop()
  if(Date.now() - req.user.timestamp < DAY*4){
    res.status(401).send({message:"Cannot vote if less than 4 days old."})
    Log(req.username+" tried to vote "+user+" "+req.body.vote)
    return
  }
  if(req.body.vote !== 1 && req.body.vote !== 0 && req.body.vote !== -1) return res.send({message:"bad vote"})
  let data = await db.get("user:"+user)
  if(!data) return res.status(404).send({message:"user doesn't exist"})
  if(!data.votes) data.votes = {}
  if(req.body.vote) data.votes[req.username] = req.body.vote
  else delete data.votes[req.username]
  await db.set("user:"+user,data)
  res.send({success:true, ...getVotes(data)})
  Log(req.username+" voted "+user+" "+req.body.vote)
})
router.get("/server/getLocalTime/", (req,res) => {
  if(!req.query.time) return res.json({message:"need time parameter"})
  var diff = Date.now() - parseFloat(req.query.time)
  if(req.query.convert){
    res.json({success:true,time:parseFloat(req.query.convert)+diff})
  }else{
    res.json({success:true,diff})
  }
})
router.get("/server/clearNotifs", (req, res) => {
  if(!req.username) return res.status(401).send("Unauthorized")
  db.get("user:"+req.username).then(r => {
    for(var i=0; i<r.notifs.length; i++){
      var n = r.notifs[i]
      n.read = true
    }
    db.set("user:"+req.username, r).then(() => res.send("cleared")).catch(e => Log(e))
  }).catch(e => Log(e))
})

router.post("/server/resetPwd", getPostData,async (req,res) => {
  //return res.json({message:"Functionality not available yet"})

  var username = req.body.username
  db.get("user:"+username).then(r => {
    if(!r) return res.json({message:"That account doesn't exsist."})
    var email = r.email || ""
    if(!email){
      return res.json({message:"Sorry, that account doesn't have an email."})
    }
    var transport = nodemailer.createTransport({
      /*host: "smtp.gmail.com",
      port: 2525,*/
      service:"gmail",
      auth: {
        user: "@gmail.com",
        pass: process.env['google_pass']
      }
    });
    var message = {
      from: "reset_password@",
      to: email,
      subject: "Reset Password",
      html: `
<h1>So, you decided to reset your password, huh?</h1>
<p>All you have to do is follow the instructions.</p>
<ol>
  <li>Click <a>here</a></li>
</ol>
`
    }
    transport.sendMail(message, function(err, info) {
      if (err) {
        res.json({message:JSON.stringify(err)})
      } else {
        Log("Reset password email sent to "+req.username,info);
        res.json({success:true})
      }
    })
  })
})

router.get("/server/sessions", (req, res) => {
  const pwd = process.env['passKey']
  var urlData = url.parse(req.url,true)
  var q = urlData.query.pwd
  if(q === pwd){
    db.list("session:").then((d) => {res.json(d) })
  }else{
    res.sendFile(__dirname+"/401.html")
  }
})
//Don't uncomment, can crash server
/*router.get("/server/findEmail/*", async(req,res) => {
  var search = req.params[0]
  if(!search) return res.end()
  var users = await db.list("user:",true)
  for(var i in users){
    var u = users[i]
    if(u.email && u.email.includes(search)) res.write(i+": "+u.email+"\n")
  }
  res.end()
})
router.get("/server/findSimilarUsers/*", async(req,res) => {
  var search = req.params[0]
  if(!search) return res.end()
  var user = await db.get("user:"+search)
  if(!user) return res.send("invalid username")
  var ip = user.ip
  if(!ip) return res.send("user has no ip")
  var users = await db.list("user:",true)
  userLoop:for(var i in users){
    var u = users[i]
    if(!u.ip) continue
    for(var i2 of u.ip) if(ip.includes(i2)){
      res.write(u.username+"\n")
      continue userLoop
    }
  }
  res.end()
})
router.get("/server/findAdmins/", async(req,res) => {
  var users = await db.list("user:",true)
  for(var i in users){
    if(users[i].admin){
      res.write(users[i].username+"\n")
    }
  }
  res.end()
})*/

router.get("/server/compareUser/:user1/:user2",async(req,res) => {
  let user1 = await db.get("user:"+req.params.user1)
  if(!user1) return res.send(req.params.user1+" doesn't exist")
  let user2 = await db.get("user:"+req.params.user2)
  if(!user2) return res.send(req.params.user2+" doesn't exist")
  res.send((user1.ip||[]).filter(value => (user2.ip||[]).includes(value)).length+" similarities")
})

// Don't uncomment if not sure because it takes up a lot of storage
/*//cloud saves
router.get("/minekhan/saves", async(req,res) => {
  if(!req.username) return res.status(401).json("Unauthorized")
  var saves = await db.get("saves:"+req.username)
  res.json(saves)
})
router.get("/minekhan/saves/:id", async(req,res) => {
  if(!req.username) return res.status(401).json("Unauthorized")
	let stream = await db.getStream("saves:"+req.username+":"+req.params.id)
	if(!stream) return res.json(null)
	stream.pipe(res)
})
router.post("/minekhan/saves", getPostBuffer2,async(req,res) => {
  if(!req.username) return res.status(401).json("Unauthorized")
	try{
  	var save = JSON.parse(req.body.toString())
	}catch{
		return res.send("bad format")
	}
	if(!db.canSetFile("saves:"+req.username+":"+save.id)) return res.status(429).send("too many requests")
  var saves = await db.get("saves:"+req.username) || []
  var found = false
  for(var i=0; i<saves.length; i++){
    if(saves[i].id === save.id){
      saves[i] = {
				edited:save.edited,
	      id:save.id,
	      name:save.name,
	      thumbnail:save.thumbnail,
	      version:save.version,
	      size:save.code ? save.code.length : 0
			}
      found = true
    }
  }
  if(!found){
		saves.push({
			edited:save.edited,
			id:save.id,
			name:save.name,
			thumbnail:save.thumbnail,
			version:save.version,
			size:save.code ? save.code.length : 0
		})
	}
  await db.set("saves:"+req.username, saves)
	await db.setFile("saves:"+req.username+":"+save.id, req.body)
  res.json({success:true})
  //Log("MineKhan: "+req.username+" saved world called "+save.name)
})
router.delete("/minekhan/saves/:id", async(req,res) => {
  if(!req.username) return res.status(401).json("Unauthorized")
  var saves = await db.get("saves:"+req.username)
  if(!saves) return res.json({message:"save doesn't exist"})
  let id = req.params.id
  for(var i=0; i<saves.length; i++){
    var s = saves[i]
    if(s.id.toString() === id){
      saves.splice(i,1)
      await db.set("saves:"+req.username, saves)
			await db.deleteFile("saves:"+req.username+":"+id)
      res.json({success:true})
      Log("MineKhan:","know", req.username+" deleted world called "+cap(s.name))
      return
    }
  }
  res.json({message:"save doesn't exist"})
})
router.get("/server/account/:user/mksaves", async(req,res) => {
	let stream = await db.getStream("saves:"+req.params.user)
	if(!stream) return res.json(null)
	stream.pipe(res)
})
router.get("/server/account/:user/mksaves/:id", async(req,res) => {
	let stream = await db.getStream("saves:"+req.params.user+":"+req.params.id)
	if(!stream) return res.json(null)
	stream.pipe(res)
})*/

/*router.post("/server/suggest",getPostText,async(req,res) => {
	rateLimit(request,undefined,0.01)
  Log(req.username+":"+req.who.id+" suggest: "+req.body)
  res.send("done")
})*/
function where(req){
	let thing = req.headers.referer||req.headers.referrer||req.headers.origin
	return (thing!=="https://"+theHost&&thing!=="https://"+theHost+"/minekhan/")?"from "+thing:""
}
global.where = where
/*router.post("/minekhan/know",getPostText,async(req,res) => {
	rateLimit(request,undefined,0.01)
  setOnline(req.username, req.body,request.clientIp)
  Log("MineKhan:", "know ", cap(req.username+":"+req.who.id), where(req), req.body)
  res.send("done")
})

//{old
router.post("/server/know/newWorld",getPostText,async(req,res) => {
	rateLimit(request,undefined,0.01)
  setOnline(req.username,"new world: "+req.body,request.clientIp)
  Log("MineKhan:","know old", req.username+":"+req.who.id,where(req)," created new world "+cap(req.body))
  res.send("done")
})
router.post("/server/know/openWorld",getPostText,async(req,res) => {
	rateLimit(request,undefined,0.01)
  setOnline(req.username,"play world: "+req.body,request.clientIp)
  Log("MineKhan:","know old", req.username+":"+req.who.id,where(req)," opened world "+cap(req.body))
  res.send("done")
})
//}

router.post("/minekhan/know/error",getPostText,async(req,res) => {
	rateLimit(request,undefined,0.01)
  Log("MineKhan:","error:",req.username+":"+req.who.id,where(req),cap(req.body,800))
  res.send("done")
})*/

router.get("/records", (req,res) => {
  let obj = {}
  for(let i in records) obj[recordsNames[i]] = records[i]
  res.json(obj)
})

//for minekhan
router.get("/server/worlds", (req, res) => {
  res.json(worlds.toRes())
})
router.get("/server/worldsPing", (req, res) => {
  var w = []
  var data = {}
  for(var i=0; i<worlds.length; i++){
    var world = worlds[i]
    w.push(pingWorld(world.id,data))
  }
  for(var i=0; i<servers.length; i++){
    var server = servers[i]
    w.push(pingWorld(server.id,data))
  }
  Promise.all(w).then(w => {
    res.json(data)
  })
  //res.header("Content-Type", "text/plain")
  //pingWorld(req.params.id).then(r => res.send(r))
})
router.get("/server/servers", async(req,res) => {
  /*var promises = []
  var results = []
  for(var i of servers){
    promises.push(timeoutPromise(fetch("https://"+i.url+"/info").then(r => r.json()).then(r => results.push(r)),20000).catch(() => {}))
  }
  await Promise.all(promises)
  res.json(results)*/

  res.json(servers.toRes())
  for(var i of serverInfo){
    var s
    for(var j in servers){
      if(servers[j].url === i.url) s = i
    }
    if(!s) getServerInfo(i)
  }
})
router.get("/getExternalServerSession/:id", async(req,res) => {
  if(!req.username) return res.status(401).json({type:"error",data:"unauthorized"})
  let v = await validateMKClient(req.username,req.clientIp,req.who)
  if(v) return res.send(v)
  let server = findServerForClient(req.params.id)
  if(!server) return res.json({type:"error",data:"can't find server"})
  let pwd = generatePassword()
  server.connection.sendUTF(JSON.stringify({
    type:"addSession",
    data:pwd,
    username:req.username
  }))
  res.json({type:"session",data:pwd})
})

//router.get("/testauth",auth,(req,res)=>res.send('very secret secret'))

router.post("/server/admin/messageUser/*", getPostData,async(req,res) => {
  if(!req.isAdmin) return res.json({message:"Unauthorized"})
  let to = req.url.split("/").pop()
  await notif(req.username+" sent message: "+req.body.message, to, undefined, req.body.sendWebPush)
  res.json({success:true})
})
router.post("/server/admin/giveCape/*", getPostData,async(req,res) => {
  if(!req.isAdmin) return res.json({message:"Unauthorized"})
  let to = req.url.split("/").pop()
  if((await giveCape(to, req.body.name, req.username).catch(e => {
    res.json({success:false,message:e.message})
    return "error"
  })) !== "error") res.json({success:true})
})

//https://stackoverflow.com/questions/38190773/node-js-monitor-file-for-changes-and-parse-them
//https://github.com/catdadcode/hearthstone-log-watcher/blob/master/index.js
/*{
  let options = {logFile:__dirname+"/editor/editorlog.txt"}
  let fileSize = fs.statSync(options.logFile).size;
  // Obtain the initial size of the log file before we begin watching it.
  fs.watchFile(options.logFile, function (current, previous) {
    // Check if file modified time is less than last time.
    // If so, nothing changed so don't bother parsing.
    if (current.mtime <= previous.mtime) { return; }

    // We're only going to read the portion of the file that
    // we have not read so far. Obtain new file size.
    var newFileSize = fs.statSync(options.logFile).size;
    // Calculate size difference.
    var sizeDiff = newFileSize - fileSize;
    // If less than zero then Hearthstone truncated its log file
    // since we last read it in order to save space.
    // Set fileSize to zero and set the size difference to the current
    // size of the file.
    if (sizeDiff < 0) {
      fileSize = 0;
      sizeDiff = newFileSize;
    }
    // Create a buffer to hold only the data we intend to read.
    var buffer = Buffer.alloc(sizeDiff);
    // Obtain reference to the file's descriptor.
    var fileDescriptor = fs.openSync(options.logFile, 'r');
    // Synchronously read from the file starting from where we read
    // to last time and store data in our buffer.
    fs.readSync(fileDescriptor, buffer, 0, sizeDiff, fileSize);
    fs.closeSync(fileDescriptor); // close the file
    // Set old file size to the new size for next read.
    fileSize = newFileSize;

    // Parse the line(s) in the buffer.
    let str = buffer.toString()
    if(str.includes("\n")) str.split('\n').forEach(r => r&&Log(r))
    else Log(str)
  });
}*/
router.get('/server/internal/restart',auth,async(req,res) => {
  res.send('success')
  waitToRestart()
})
let runBy = null
router.post('/server/internal/run',auth,getPostText,async(req,res) => {
  Log("%> "+req.body)
  runBy = req.username
  let res2
  try{
    res2 = eval(req.body)
  }catch(e){
    res2 = e.stack
  }
  runBy = null
  try{
    JSON.stringify(res2)
    Log("%<",res2)
  }catch{
    Log("%< Unable to show output")
  }
  res.send('success')
})
router.post('/server/internal/clearLog',auth,getPostData,async(req,res,next) => {
	runBy = req.username
  getLog(req,res,next)
	clearLog(req.body.lastTime)
})
router.get("/server/internal/getFile/:file",async(req,res)=>{
	if(req.query.pwd !== process.env.passKey) return res.send('Unauthorized')
  let relfile = Buffer.from(req.params.file, "base64").toString()
  fs.createReadStream(relfile).pipe(res)
})
router.post("/server/internal/updateFile/:file",getPostBufferHuge,async(req,res)=>{
  if(req.query.pwd !== process.env.passKey) return res.send('Unauthorized')
  let relfile = Buffer.from(req.params.file, "base64").toString()
  await fs.promises.mkdir(path.dirname(relfile),{recursive:true})
  await fs.promises.writeFile(relfile,req.body)
  res.send('success')
  Log("Editor: updated file "+relfile)
})
/*router.post("/log",authAlt,getPostText,async(req,res)=>{
	Log("External"+req.body)
})*/

router.post("/server/editorUploadZip/",async(req,res)=>{
	rateLimit(req)
	let id = generateId()+"-"+req.username
	await db.setStream('editorZips/'+id,req)
	res.send("success")
	Log("Upload zip: <a href='/server/editorZip/"+id+"' target='_blank'>"+id+"</a>")
})
router.get("/server/editorZip/:id", async(req,res) => {
	let a = await db.getStream("editorZips/"+req.params.id)
	if(a) a.pipe(res)
	else res.status(404).send("not found")
})

router.get("/around/:what", async(req,res) => {
	fetch(req.params.what).then(res2 => new Promise((resolve, reject) => {
    res2.body.pipe(res);
	})).catch(e => res.send(e.message))
})

//app.use('/minekhan/assets', express.static(__dirname+'/public/minekhan/assets'))

/*
const assets = db.storage.bucket("assets-thingmaker-minekhan")

let idx1, idx2, idxNotDeepest
function nthIndex(str, pat, n){
  idx1 = idx2 = -1
  var L= str.length, i = -1, previ
  idxNotDeepest = false
  while(n-- && i++<L){
    previ = i
    i= str.indexOf(pat, i);
    if (i < 0){
      if(n===0){
        idx1 = previ, idx2 = str.length
      }
      return
    }
  }
  idx1 = i, idx2 = previ
  idxNotDeepest = str.indexOf(pat, i) !== -1
}
router.get(/^\/minekhan\/assets\/(.*)$/, async function(req,res,next){
  //res.redirect("https://storage.googleapis.com/assets-thingmaker-minekhan/public/"+req.params[0])
  //res.redirect("/minekhan/assets/loadfromstorage/"+req.params[0])
  let file = assets.file("public/"+req.params[0])
  if((await file.exists())[0]){
    file.createReadStream().pipe(res)
  }else{//Find folders at current path from a list of full paths
    let folderDeepness = 0
    for(let c of req.params[0]) if(c === "/") folderDeepness++
    const [files] = await assets.getFiles({prefix:"public/"+req.params[0]})
    let folders = new Set()
    for(let f of files){
      let n = f.name.replace("public/","")
      nthIndex(n, "/", folderDeepness+1)
      folders.add(n.substring(idx1,idx2)+(idxNotDeepest?"/":""))
    }
    let otherFilesAndFolders = await fs.promises.readdir(__dirname+"/public/minekhan/assets/"+req.params[0],{withFileTypes: true}).catch(() => [])
    for(let i of otherFilesAndFolders){
      folders.add(i.name+(i.isDirectory() ? "/" : ""))
    }

    let html = "<!doctype html>"
    for(let i of folders) if(i!=="disc/"&&!i.endsWith(".wav")) html += "<a href='"+i+"'>"+i+"</a><br>"
    res.send(html)
  }
})
*/

function LogAllOut(){
  db.list("session:").then(m => {
    var p = []
    for(var i=0; i<m.length; i++){
      p.push(db.delete(m[i]))
    }
    Promise.all(p).then(() => {
      Log("Done")
    })
  })
}
function deleteCloudSaves(){
  db.list("saves:").then(m => {
    var p = []
    for(var i=0; i<m.length; i++){
      p.push(db.delete(m[i]))
    }
    Promise.all(p).then(() => {
      Log("Done")
    })
  })
}
function deleteAccount(username){
  db.delete("user:"+username).then(() => Log("done"))
}
function promoteToAdmin(username){
  db.get("user:"+username).then(r =>{
    if(!r) return Log("user doesn't exsist")
    r.admin = true
    notif("You are now a admin",r)
    db.set("user:"+username, r).then(() => Log("done"))
  })
}
function unpromoteFromAdmin(username){
  db.get("user:"+username).then(r =>{
    if(!r) return Log("user doesn't exsist")
    r.admin = false
    notif("You are now not a admin",r)
    db.set("user:"+username, r).then(() => Log("done"))
  })
}
function setPassword(username,pwd){
  db.get("user:"+username).then(async r => {
    r.password = bcrypt.hashSync(pwd, 10)
    await db.set("user:"+username,r)
    Log("done")
  })
}

//require("./public/save-mk-indexed-db")

let serverPort = app.listen(8080, '0.0.0.0', function(){
  Log("Server running");
	console.log("server running")
});

//WebSocket
class WebSocketRoom{
  static rooms = []
  constructor(path){
    this.path = path
    this.onrequest = null
    this.connections = []
    this.validateFunc = null

    WebSocketRoom.rooms.push(this)
  }
  static getRoom(path){
    for(var i=0; i<this.rooms.length; i++){
      if(this.rooms[i].path === path){
        return this.rooms[i]
      }
    }
  }
  static async connection(request){
    let urlData = url.parse(request.httpRequest.url,true)
    let path = urlData.pathname
    var room = this.getRoom(path)
    if(room){
      var valid = true
      var options = {send:null}
      if(room.validateFunc){
        valid = await room.validateFunc(request, options, urlData)
      }
      const connection = request.accept(null, request.origin);
      if(options.send) connection.sendUTF(options.send)
      if(!valid){
        return connection.close()
      }
      room.connections.push(connection)
      room.onrequest(request, connection, urlData)
      connection.on("close", function(){
        var idx = room.connections.indexOf(connection)
        room.connections.splice(idx,1)
      })
    }//else request.reject()
  }
}
const wsServer = new WebSocketServer({
  httpServer: serverPort
})
wsServer.on("request", req => WebSocketRoom.connection(req))

//Function to validate request
async function validateMKClient(username,ip,who){
  if(!multiplayerOn && !d.includes(username)){
    return JSON.stringify({
      type:"error",
      data:multiplayerMsg
    })
  }

  if(who.banned){
    return JSON.stringify(whyBanned(who))
  }
}
async function validateMKWS(request, options){
  //if(request.origin !== "https://thingmaker.us.eu.org") Log('alert',"Incorrect client: "+request.origin)
  var ip = requestIp.getClientIp(request)
  options.send = await validateMKClient(request.username,ip, setOnline(request.username,null,ip))
  if(options.send) return false
  
  return true
}

var worlds = []
worlds.find = (id) => {
  for(var i=0; i<worlds.length; i++){
    if(worlds[i].id === id){
      return worlds[i]
    }
  }
}
worlds.toRes = function(){
  var data = []
  for(var i=0; i<worlds.length; i++){
    var w = worlds[i]
    data.push({
      name: w.name,
      players: (() => {
        var ps = []
        w.players.forEach(r => ps.push(r.username))
        return ps
      })(),
      id: w.id,
      host: w.host.username,
      banned: w.banned,
      whitelist: w.whitelist,
      version: w.version
    })
  }
  return data
}
var pings = {}
function pingWorld(id, obj=null){
  var w = worlds.find(id) || findServerForClient(id)
  if(!w) return "error"
  var start = Date.now()
  var pingId = generateId()
  return new Promise((resolve,reject) => {
    var resolved = false
    pings[pingId] = {
      id: id,
      done: () => {
        var finish = Date.now()
        var ms = (finish - start)
        resolve(ms)
        resolved = true
        delete pings[pingId]
        if(obj) obj[id] = ms
      }
    }
    if(w.host){
      w.host.sendJSON({
        type:"ping",
        id:pingId
      })
    }else{
      w.connection.sendUTF(JSON.stringify({
        type:"ping",
        id:pingId
      }))
    }
    setTimeout(() => {
      if(!resolved){
        resolve("timeout")
        if(obj) obj[id] = "timeout"
        delete pings[pingId]
      }
    }, 20000)
  })
}

function sendEval(index, player, data){
  //Log("%>worlds["+index+"].players["+player+"].sendUTF('{\"type\":\"eval\",\"data\":\""+data+"\"}')")
  var world = worlds[index]
  if(!world) return "Error: worlds["+index+"] is not defined"
  if(player === "@a"){
    world.players.forEach(p => {
      p.sendJSON({type:"eval",data:data})
    })
  }else{
    var p = world.players[player]
    if(!p) return Log("Error: worlds["+index+"].players["+player+"] is not defined")
    p.sendJSON({type:"eval",data:data})
  }
  return "Eval data sent."
}
function sendEvalEx(index,data){
  var world = servers[index]
  if(!world) return "No server at index"
  world.connection.sendUTF(JSON.stringify({
    type:"eval",
    data
  }))
}

function handleCommonMKPacket(data,world,connection,findPlayer,sendPlayer,sendPlayers,sendPlayerName,sendAllPlayers,closePlayer,sendThisPlayer,request){
  const {username} = connection
  if(data.type === "login"){
    var sid, spwd
    for(var i=0; i<request.cookies.length; i++){
      var c = request.cookies[i]
      if(c.name === "sid"){
        sid = c.value
      }else if(c.name === "spwd"){
        spwd = c.value
      }
    }
    if(!sid){
      ({sid,spwd} = data)
    }
    if(sid) {
      db.get("session:"+sid).then(async result => {
        if(!result || result && result.pwd !== spwd) return false
        let u = await db.get("user:"+result.username)
        if(u) connection.isAdmin = u.admin || false, connection.username = u.username
        else return connection.close()
        let temp = connection.delayedToAfterLogin
        connection.delayedToAfterLogin = null
        for(let i of temp) connection.on_MesS_aGe(i)
      })
    }else return connection.close()
  }else if(data.type === "ban"){
    if(!(connection === world.host || connection.isAdmin)) return sendThisPlayer({
      type:"message",
      username:"Server",
      data:"You dont have permission to ban.",
      fromServer:true
    })
    
    var banWho = findPlayer(data.data)
    if(banWho && banWho.isAdmin){
      sendPlayer({
        type:"message",
        username:"Server",
        data:"You can't ban "+data.data,
        fromServer:true
      }, data.FROM)
      sendPlayers({
        type:"message",
        username:"Server",
        data: username+" tried to ban "+data.data+".",
        fromServer:true
      })
      banWho.sendJSON({
        type:"message",
        username:"Server",
        data: "Ban reason: "+data.reason,
        fromServer:true
      })
      return
    }

    if(data.data in world.banned){
      return sendThisPlayer({
        type:"message",
        username:"Server",
        data:data.data+" is already banned.",
        isServer:true
      })
    }else{
      world.banned[data.data] = data.reason || ""
    }
    
    sendPlayerName({
      type:"error",
      data: "You've been banned from this world." + (data.reason ? "\n\n\n\n\nReason:\n"+data.reason : "")
    }, data.data)
    world.host.sendJSON({
      type:"updatePermissions",
      action:"addBan",
      username:data.data,
      messages:data.reason
    })
    sendAllPlayers({
      type:"message",
      username:"Server",
      data:data.data+" got banned.",
      fromServer:true
    })
    Log("MineKhan:", data.data+" got banned from the server: "+world.name)
    closePlayer(data.data)
    worldsChanged()
  }else if(data.type === "unban"){
    if(!(connection === world.host || connection.isAdmin)) return sendThisPlayer({
      type:"message",
      username:"Server",
      data:"You dont have permission to unban.",
      fromServer:true
    })
    
    if(!(data.data in world.banned)){
      return sendThisPlayer({
        type:"message",
        username:"Server",
        data:data.data+" is not banned.",
        fromServer:true
      })
    }
    delete world.banned[data.data]
    world.host.sendJSON({
      type:"updatePermissions",
      action:"removeBan",
      username:data.data
    })
    sendAllPlayers({
      type:"message",
      username:"Server",
      data:data.data+" got unbanned.",
      fromServer:true
    })
    Log("MineKhan:", data.data+" got unbanned from the server: "+world.name)
    worldsChanged()
  }else if(data.type === "whitelist"){
    if(!(connection === world.host || connection.isAdmin)) return sendThisPlayer({
      type:"message",
      username:"Server",
      data:"You dont have permission to edit whitelist.",
      fromServer:true
    })

    if((data.data === "add" || data.data === "remove") && !world.whitelist) return sendThisPlayer({
      type:"message",
      data: "You need to enable whitelist to do that.",
      username: "Server",
      fromServer:true
    })
    
    if(data.data === "enable" && !world.whitelist){
      world.whitelist = []
      world.host.sendJSON({
        type:"updatePermissions",
        action:"whitelistEnable"
      })
      sendPlayers({
        type:"error",
        data:"Whitelist has been enabled. You can rejoin if whitelisted.",
      })
      for(let i of world.players){
        if(i !== world.host && !i.isAdmin) i.close()
      }
      sendAllPlayers({
        type:"message",
        username:"Server",
        data:"Whitelist was enabled.",
        fromServer:true
      })
      worldsChanged()
    }else if(data.data === "disable" && world.whitelist){
      world.whitelist = null
      world.host.sendJSON({
        type:"updatePermissions",
        action:"whitelistDisable"
      })
      sendAllPlayers({
        type:"message",
        username:"Server",
        data:"Whitelist was disabled.",
        fromServer:true
      })
      worldsChanged()
    }else if(data.data === "add" && !world.whitelist.includes(data.who)){
      world.whitelist.push(data.who)
      world.host.sendJSON({
        type:"updatePermissions",
        action:"whitelistAdd",
        username:data.who
      })
      sendAllPlayers({
        type:"message",
        username:"Server",
        data:data.who+" was added to the whitelist.",
        fromServer:true
      })
      worldsChanged()
    }else if(data.data === "remove" && world.whitelist.includes(data.who)){
      world.whitelist.splice(world.whitelist.indexOf(data.who), 1)
      world.host.sendJSON({
        type:"updatePermissions",
        action:"whitelistRemove",
        username:data.who
      })
      sendAllPlayers({
        type:"message",
        username:"Server",
        data:data.who+" was removed from the whitelist.",
        fromServer:true
      })
      var remove = []
      for(var i of world.players){
        if(i.username === data.who) remove.push(i)
      }
      for(var i of remove) i.close()
      worldsChanged()
    }
  }else if(data.type === "fetchUsers"){
    var str = "<span style='color:lime;'>"+world.players.length + " players online: "
    world.players.forEach(u => str += u.username+", ")
    str = str.slice(0,str.length-2)

    var bannedLength = 0
    for(var b in world.banned) bannedLength ++
    if(bannedLength){
      str += "<br>"
      str += bannedLength + " players banned: "
      for(var b in world.banned) str += b + ", "
      str = str.slice(0,str.length-2)
    }
    if(world.whitelist && world.whitelist.length){
      str += "<br>"
      str += world.whitelist.length + " players whitelisted: "
      world.whitelist.forEach(u => str += u + ", ")
      str = str.slice(0,str.length-2)
    }
    
    sendThisPlayer({
      type:"message",
      username:"Server",
      data:str,
      fromServer:true
    })
  }else if(data.type === "eval"){
    if(connection.isAdmin){
      var o = {type:"eval",data:data.data}
      if(data.TO === "@A"){
        sendAllPlayers(o)
      }else if(data.TO){
        let players = data.TO.split("|")
        for(let p of players) sendPlayerName(o, p)
      }else{
        sendPlayers(o)
      }
      sendPlayer({
        type:"message",
        username:"Server",
        data:"Eval data sent",
        fromServer:true
      }, data.FROM)
    }else{
      sendPlayer({
        type:"message",
        username:"Server",
        data:"You can not use this command.",
        fromServer:true
      }, data.FROM)
    }
  }else if(data.type === "invite"){
    notif(connection.username+" invites you to world called "+world.name,data.data,[{action:"open:"+theHost+"/minekhan/?target="+world.id,title:"Join"}]).then(() => {
      sendPlayer({
        type:"message",
        username:"Server",
        data:"A notification has been sent to "+data.data,
        fromServer:true
      }, data.FROM)
      sendPlayers({
        type:"message",
        username:"Server",
        data:connection.username+" invited "+data.data,
        fromServer:true
      })
      Log(connection.username+" invited "+data.data+" to "+world.name)
    }).catch(e => {
      if(e === false) sendPlayer({
        type:"message",
        username:"Server",
        data:"No such user: "+data.data,
        fromServer:true
      }, data.FROM)
    })
  }
}

let mkhost = new WebSocketRoom("/mkhost")
mkhost.validateFunc = validateMKWS
mkhost.onrequest = function(request, connection, urlData) {
  const queryObject = urlData.query
  var target = queryObject.target
  if(!(target||target===0)){
    connection.close()
    return
  }

  //add user to a world
  let world = worlds.find(target)
  if(world){
    connection.sendUTF(JSON.stringify({type:"error",data:"Cannot host world that is already hosted."}))
    connection.close()
    return
  }else{
    /*if(worlds.length >= 5){
      connection.sendUTF(JSON.stringify({
        type:"error",
        data:"Only 5 servers at a time"
      }))
      connection.close()
      return
    }*/
    world = {
      id: target,
      players: [connection],
      banned: {},
      whitelist: null,
      host: connection,
      name: "Ghost server "+target,
      version: "",
      openTime:Date.now()
    }
    worlds.push(world)
  }
  updateWorldRecords()
  worldsChanged()
  connection.sendJSON = function(o){
    if(typeof o !== "string"){
      o = JSON.stringify(o)
    }
    this.sendUTF(o)
  }
  function sendPlayers(msg){
    if(typeof msg !== "string"){
      msg = JSON.stringify(msg)
    }
    for(var i=0; i<world.players.length; i++){
      var p = world.players[i]
      if(p !== connection){
        p.sendJSON(msg)
      }
    }
  }
  function sendAllPlayers(msg){
    if(typeof msg !== "string"){
      msg = JSON.stringify(msg)
    }
    for(var i=0; i<world.players.length; i++){
      var p = world.players[i]
      p.sendJSON(msg)
    }
  }
  function sendPlayer(msg, to){
    for(var i=0; i<world.players.length; i++){
      var p = world.players[i]
      if(p.id === to){
        p.sendJSON(msg)
      }
    }
  }
  function sendThisPlayer(msg){
    connection.sendJSON(msg)
  }
  function sendPlayerName(msg, to){
    for(var i=0; i<world.players.length; i++){
      var p = world.players[i]
      if(p.username === to){
        p.sendJSON(msg)
      }
    }
  }
  function closePlayers(){
    for(var i=0; i<world.players.length; i++){
      var p = world.players[i]
      if(p !== connection){
        p.close()
      }
    }
  }
  function closePlayer(id){
    for(var i=0; i<world.players.length; i++){
      var p = world.players[i]
      if(p.username === id){
        p.close()
      }
    }
  }
  function closeThisPlayer(){
    connection.close()
  }
  function findPlayer(id){
    for(var i=0; i<world.players.length; i++){
      var p = world.players[i]
      if(p.username === id){
        return p
      }
    }
  }
  connection.delayedToAfterLogin = []
	let nextWsConnection
  connection.on("message", connection.on_MesS_aGe = message => {
		if(message.binaryData){
			for(var i=0; i<world.players.length; i++){
	      var p = world.players[i]
	      if(p.id === nextWsConnection){
	        p.sendBytes(message.binaryData)
	      }
	    }
			return
		}
		
    let data = message.utf8Data;
    try{
      data = JSON.parse(data)
    }catch(e){
      sendThisPlayer({
        type:"error",
        data: "Bad packet. Please reload. "+data
      })
      connection.close()
      return Log('alert',"Bad packet from "+world.name+" | "+connection.username)
    }
    if(data.type !== "login" && connection.delayedToAfterLogin) return connection.delayedToAfterLogin.push(message)
    if(data.type === "init"){
      connection.id = data.id
      world.name = cap(data.name)
      world.version = data.version
      Log("MineKhan:", connection.username+" opened server: "+world.name, worlds.length+" worlds")
      worldsChanged()
    }else if(data.type === "answer" || data.type === "iceCandidate"){
      sendPlayer(message.utf8Data,data.TO)
    }else if(data.type === "nextWsConnection"){
			nextWsConnection = data.data
		}else if(data.type === "pong"){
      var p = pings[data.id]
      if(p) p.done()
    }else handleCommonMKPacket(data,world,connection,findPlayer,sendPlayer,sendPlayers,sendPlayerName,sendAllPlayers,closePlayer,sendThisPlayer,request)
  })
  connection.on('close', function(reasonCode, description) {
    var name = world.name
    var playerAmount = world.players.length
    sendPlayers({
      type:"error",
      data: "Server closed. WebSocket: "+description
    })
    closePlayers()
    worlds.splice(worlds.indexOf(world), 1)
    world = {}
    Log("MineKhan:", connection.username+" closed server: "+name+" with "+playerAmount+" people", worlds.length+" worlds")
    worldsChanged()
  });
  connection.on("error", function(err){
    Log("UH OH!!! Websocket error", err)
  })
}

let mkjoin = new WebSocketRoom("/mkjoin")
mkjoin.validateFunc = validateMKWS
mkjoin.onrequest = function(request, connection, urlData) {
  const queryObject = urlData.query
  var target = queryObject.target
  if(!(target||target===0)){
    connection.close()
    return
  }

  //add user to a world
  let world = worlds.find(target)
  if(world){
    world.players.push(connection)
  }else{
    connection.sendUTF(JSON.stringify({type:"error",data:"Cannot join server."}))
    connection.close()
    return
  }
  updateWorldRecords()
  worldsChanged()
  connection.sendJSON = function(o){
    if(typeof o !== "string"){
      o = JSON.stringify(o)
    }
    this.sendUTF(o)
  }
  function sendPlayers(msg){
    if(typeof msg !== "string"){
      msg = JSON.stringify(msg)
    }
    for(var i=0; i<world.players.length; i++){
      var p = world.players[i]
      if(p !== connection){
        p.sendJSON(msg)
      }
    }
  }
  function sendAllPlayers(msg){
    if(typeof msg !== "string"){
      msg = JSON.stringify(msg)
    }
    for(var i=0; i<world.players.length; i++){
      var p = world.players[i]
      p.sendJSON(msg)
    }
  }
  function sendPlayer(msg, to){
    for(var i=0; i<world.players.length; i++){
      var p = world.players[i]
      if(p.id === to){
        p.sendJSON(msg)
      }
    }
  }
  function sendThisPlayer(msg){
    connection.sendJSON(msg)
  }
  function sendPlayerName(msg, to){
    for(var i=0; i<world.players.length; i++){
      var p = world.players[i]
      if(p.username === to){
        p.sendJSON(msg)
      }
    }
  }
  function closePlayers(){
    for(var i=0; i<world.players.length; i++){
      var p = world.players[i]
      if(p !== connection){
        p.close()
      }
    }
  }
  function closePlayer(id){
    for(var i=0; i<world.players.length; i++){
      var p = world.players[i]
      if(p.username === id){
        p.close()
      }
    }
  }
  function closeThisPlayer(){
    connection.close()
  }
  function findPlayer(id){
    for(var i=0; i<world.players.length; i++){
      var p = world.players[i]
      if(p.username === id){
        return p
      }
    }
  }

  connection.hasRecievedOfFeR = false
  connection.delayedToAfterLogin = []
  connection.on("message", connection.on_MesS_aGe = message => {
		if(message.binaryData){
			if(connection.delayedToAfterLogin) return connection.delayedToAfterLogin.push(message)
			world.host.sendUTF(JSON.stringify({type:"nextWsConnection",data:connection.id}))
			world.host.sendBytes(message.binaryData)
			return
		}
		
    let data = message.utf8Data;
    try{
      data = JSON.parse(data)
    }catch(e){
      sendThisPlayer({
        type:"error",
        data: "Bad packet. Please reload. "+data
      })
      connection.close()
      return Log('alert',"Bad packet from "+world.name+" | "+connection.username)
    }
    if(data.type !== "login" && connection.delayedToAfterLogin) return connection.delayedToAfterLogin.push(message)
    if(data.type === "offer"){
      if(connection.hasRecievedOfFeR){
        return closeThisPlayer()
      }
      if(connection.username in world.banned){
        if(connection.isAdmin){
          delete world.banned[connection.username]
        }else{
          var b = world.banned[connection.username]
          sendThisPlayer({
            type:"error",
            data: "You've been banned from this world." + (b ? "\n\n\n\n\nReason:\n"+b : "")
          })
          sendAllPlayers({
            type:"message",
            username:"Server",
            data:connection.username+" was banned and tried to join ",
            fromServer:true
          })
          Log("MineKhan:", connection.username+" was banned but tried to join "+world.name)
          closeThisPlayer()
          return
        }
      }
      if(world.whitelist && !world.whitelist.includes(connection.username) && !connection.isAdmin){
        sendThisPlayer({
          type:"error",
          data: "You have not been whitelisted on this server."
        })
        closeThisPlayer()
        return
      }
      for(let p of world.players){
        if(p.id === data.id) return closeThisPlayer()
      }
      connection.id = data.id

      data.username = connection.username
      data.admin = connection.isAdmin
      data.FROM = connection.id

      world.host.sendJSON(data)
      connection.hasRecievedOfFeR = true
      Log("MineKhan:", connection.username+" joined the server: "+world.name)
      /*sendThisPlayer({
        type:"message",
        data: "Please read the multiplayer rules, read them <a href='https://minekhan.repl.co/multiplayerrules.html' target='_blank'>here</a>. They can change at any time.",
        username: "Server",
        fromServer:true
      })*/
    }else if(data.type === "switchToWs"){
			data.id = connection.id
      data.username = connection.username
      data.admin = connection.isAdmin
      data.FROM = connection.id
			Log("MineKhan:", connection.username+" switched to websocket")
			world.host.sendJSON(data)
		}else if(data.type === "joined"){
      data.data = connection.username
      sendPlayers(data)
    }else if(data.type === "iceCandidate"){
      data.FROM = connection.id
      world.host.sendJSON(data)
    }else handleCommonMKPacket(data,world,connection,findPlayer,sendPlayer,sendPlayers,sendPlayerName,sendAllPlayers,closePlayer,sendThisPlayer,request)
  })
  connection.on('close', function(reasonCode, description) {
    let idx = world.players.indexOf(connection)
    sendPlayers({
      type:"dc",
      data: connection.username,
      id:connection.id
    })
    Log("MineKhan:", connection.username+" left the server: "+world.name)
    world.players.splice(idx, 1)
    worldsChanged()
  });
  connection.on("error", function(err){
    Log("UH OH!!! Websocket error", err)
  })
}

function worldsChanged(){
  sendWorlds()
}

var servers = []
servers.toRes = function(){
  return servers.map(r => ({
    id:r.id,
    name:r.name,
    description:r.description,
    players:r.players.map(r => r.username),
    thumbnail:r.thumbnail,
    safe:r.safe,
    url:r.url,
		wsurl:r.wsurl,
    version:r.version
  }))
}
function findServerForClient(id){
  for(var i of servers){
    if(i.id === id){
      return i
    }
  }
}
function findServer(id){
  for(var i of servers){
    if(i.serverId === id){
      return i
    }
  }
}
function findServerInfo(id){
  if(!id && id !== 0) return
  for(var i of serverInfo){
    if(i.serverId === id){
      return i
    }
  }
}
async function getServerInfo(info){
  var data = await fetch(info.url+"/info").then(r => r.json()).catch(e => {})
  if(data) info.id = data.id
  return info
}
function getServerInfoForId(id, url,wsurl){
  return new Promise(function(resolve,reject){
    var p = [], done
    for(var i of serverInfo){
      if(!findServer(i.id)) p.push(getServerInfo(i).then(r => {
        if((r.id) && r.id === id) resolve(r), done = true
      }))
    }
		if(url){
			p.push(getServerInfo({url,wsurl}).then(r => {
        if((r.id) && r.id === id) resolve(r), done = true
      }))
		}
    Promise.all(p).then(() => {
      if(!done) resolve()
    })
  })
}
var serverWs = new WebSocketRoom("/serverWs")
serverWs.validateFunc = async function(request, options, urlData){
  var id = urlData.query.target
  if(findServer(id)) return false
  var info = findServerInfo(id)
  if(!info){
    info = await getServerInfoForId(id,urlData.query.url,urlData.query.wsurl)
  }   
  if(info){
    let pwd = await fetch(info.url+"/validateServer/?pwd="+encodeURIComponent(urlData.query.pwd)).then(r => r.text()).catch(e => Log(e))
    if(pwd !== "yes"){
      //Log("<h2>Warning: Unvalidated server</h2>",info)
      info = null
    }
  }
  request.serverInfo = info
  return true
}
serverWs.onrequest = function(req, connection, urlData){
  var id = urlData.query.target
  var info = req.serverInfo
  var server = {
    serverId:id,
		id:info && info.url ? "external:"+encodeURIComponent(info.url) : id,
    name:null,
    description:null,
    thumbnail:null,
    players:[],
    url:info && info.url,
    wsurl:info && info.wsurl,
    safe:info && info.safe,
    connection
  }
  connection.on("message", function(message){
    var data = JSON.parse(message.utf8Data)
    if(data.type === "init"){
      server.name = cap(""+data.name)
      server.description = data.description
      server.thumbnail = data.thumbnail
      server.version = data.version
      if(data.players) server.players = data.players
      servers.push(server)
      worldsChanged()
      Log("MineKhan: External server opened: "+server.name)
    }else if(data.type === "pong"){
      var p = pings[data.id]
      if(p) p.done(data.data)
    }else if(data.type === "joined"){
      server.players.push({id:data.id,username:data.username})
      updateWorldRecords()
      Log("MineKhan:", data.username+" joined external server: "+server.name)
      worldsChanged()
    }else if(data.type === "left"){
      for(let i=0;i<server.players.length;i++){
        if(server.players[i].id === data.id){
          server.players.splice(i,1)
          break
        }
      }
      Log("MineKhan:", data.username+" left external server: "+server.name)
      worldsChanged()
    }/*else if(data.SENDTO){
      var sendTo = data.SENDTO.split("\n")
      delete data.SENDTO
      var msg = JSON.stringify(data)
      for(var p of server.players){
        if(sendTo.includes(p.id)){
          if(data.type === "sendDc") p.close()
          else p.sendUTF(msg)
        }
      }
    }*/
  })
  connection.on("close", function(){
    /*for(var i of server.players){
      i.sendUTF(JSON.stringify({
        type:"error",
        data:"Server closed"
      }))
      i.close()
    }*/
    if(servers.includes(server)){
      servers.splice(servers.indexOf(server),1)
      Log("MineKhan: External server closed: "+server.name)
      worldsChanged()
    }
  })
}
/*var externalWs = new WebSocketRoom("/externalWs")
externalWs.validateFunc = minekhanWs.validateFunc
externalWs.onrequest = function(req, connection, urlData){
  const queryObject = urlData.query
  var target = queryObject.target
  var server = findServerForClient(target)
  if(!server) return connection.close()
  var username = req.username
  connection.on("message", function(message){
    var data = JSON.parse(message.utf8Data)
    data.FROM = connection.id
    if(data.type === "connect"){
      connection.username = data.username = username
      data.FROM = connection.id = data.id
      server.players.push(connection)
      updateWorldRecords()
      Log("MineKhan: "+username+" joined external server: "+server.name)
    }else if(data.type === "message"){
      if(false) Log("MineKhan: Message from "+username+" in external server "+server.name+": "+data.data)
    }
    data = JSON.stringify(data)
    server.connection.sendUTF(data)
  })
  connection.on('close', function(){
    server.players.splice(server.players.indexOf(connection),1)
    server.connection.sendUTF(JSON.stringify({
      type:"dc",
      data:connection.id
    }))
    Log("MineKhan: "+username+" left external server: "+server.name)
  })
}*/

var postWs = new WebSocketRoom("/postWs")
postWs.onrequest = function(req, connection, urlData){
  connection.postId = urlData.query.id
}
function sendPostWs(obj, id){
  var str = JSON.stringify(obj)
  for(var i=0; i<postWs.connections.length; i++){
    var con = postWs.connections[i]
    if(con.postId === id) con.sendUTF(str)
  }
}
var userWs = new WebSocketRoom("/userWs")
userWs.onrequest = function(req, connection, urlData){
  connection.profile = urlData.query.profile
}
function sendUserWs(obj, profile){
  var str = JSON.stringify(obj)
  for(var i=0; i<userWs.connections.length; i++){
    var con = userWs.connections[i]
    if(con.profile === profile) con.sendUTF(str)
  }
}

var worldsWs = new WebSocketRoom("/worlds")
worldsWs.onrequest = function(request,connection){
  connection.sendUTF(JSON.stringify([...worlds.toRes(),...servers.toRes()]))
  connection.on("message",function(message){
    var data = message.utf8Data
    if(data === "get"){
      connection.sendUTF(JSON.stringify(worlds.toRes()))
    }
  })
}
function sendWorlds(){
  var o = worlds.toRes()
  o.push(...servers.toRes())
  var str = JSON.stringify(o)
  for(var i=0; i<worldsWs.connections.length; i++){
    var con = worldsWs.connections[i]
    con.sendUTF(str)
  }
}

const onlineWs = new WebSocketRoom("/online")
onlineWs.onrequest = function(request,connection){
  sendAllOnline(connection)
}
function sendAllOnline(connection){
  connection.sendUTF(JSON.stringify({
    type:"all",
    data:[...lastOnline.values()].map(({id,path,username,time}) => ({id,path,username,time})),
    now:Date.now()//for correct time
  }))
}
function sendOnline({id,path,username,time}){
  let str = JSON.stringify({id,path,username,time})
  for(var i=0; i<onlineWs.connections.length; i++){
    var con = onlineWs.connections[i]
    con.sendUTF(str)
  }
}

//Test for auth on all /admin/* pages
/*router.get("/admin(/*)", function(req,res) {
 if(!req.isAdmin){
  res.redirect("/")
 }else{
   app.use(express.static(__dirname + "/public"))
 }
})*/

//====================== UDPATES
/*router.get("/minekhan/updatesAfter/:time", (req,res) => {
  let found
  fs.createReadStream(__dirname+'/public/minekhan/updates.txt')
    .pipe(newLineStream())
    .pipe(new Transform({
      transform(data, encoding, done) {
        let str = data.toString()
        let isIt = str.match(/-- (\d*)/)
        if(isIt && +isIt[1] > req.params.time) found = true
        if(found){
          //if(str.startsWith("-- ")) str = str.substring(0,3)+new Date(+str.substring(3,str.length-1)).toLocaleDateString(undefined,{year: "numeric", month: "long", day: "numeric"})+"\n"
          this.push(str);
        }
        done();
      }
    }))
    .on("error",e => {
      console.error(e)
    })
    .pipe(res);
})
router.get("/minekhan/recentUpdates", async(req,res) => {
  const handle = await fs.promises.open(__dirname+'/public/minekhan/updates.txt', 'r');
  const { size } = await handle.stat()
  let amount = 1000
  let buffer = Buffer.alloc(amount)
  await handle.read(buffer, 0, amount, size-amount)
  let str = buffer.toString()
  str = str.substring(str.indexOf("-- "))
  /*.replace(/-- (.*)\n/g, (_,$1) => {
    return "-- "+(new Date(+$1).toLocaleDateString(undefined,{year: "numeric", month: "long", day: "numeric"}))+"\n"
  })*-/
  await handle.close()
  res.send(str)
})*/
/*router.get('/updates/all', (req, res) => {
  db.list("up:").then(updates => {
    updates.sort((a,b) => a.replace("up:",'') - b.replace("up:",''))
    res.json(updates)
  });
})

router.get('/updates/update/:id', async(req, res) => { 
  let value = await db.get(req.params.id)
  if(!value) return res.json(value)
  let now = Date.now()
  value.timeSinceUpdate = now - value.timestamp
  if(value.resolved) value.resolved = now - value.resolved
  value.id = req.params.id
  if(Array.isArray(value.desc)) value.desc = value.desc.join("<br>")
  res.json(value)
})*/

/*function update(title,desc,isIssue=false,otherOptions={}){
  if(!title){
    Log("Error")
    return
  }
  if(!desc) desc = "No description"
  db.list("up:").then(updates => {
    let id = otherOptions.id || (updates.length + 1)
    if(updates.includes("up:"+id)){
      Log(`Error, id ${id} is used. Please fix this.`)
    }else{
      Log("Creating update "+title+" with id "+id+".")
      let value = {
        name:title, desc, isIssue,
        timestamp: Date.now()
      }
      Object.assign(value, otherOptions)
      db.set("up:"+id,value).then(() => {
        Log("Done!")
      })
    }
  })
}
async function editUpdate(id,desc=null,otherOptions=null){
  if(!id){
    Log("Error")
    return
  }
  let value = await db.get(id)
  if(desc){
    if(!Array.isArray(value.desc)) value.desc = [value.desc]
    value.desc.push("Edit: "+desc)
  }
  if(otherOptions) Object.assign(value, otherOptions)
  await db.set(id,value)
  Log('Done!')
}
async function resolveUpdate(id,fixDesc){
  if(!id){
    Log("Error")
    return
  }
  let value = await db.get(id)
  if(!value.isIssue) return Log(id+" is not an issue.")
  if(fixDesc){
    if(!Array.isArray(value.desc)) value.desc = [value.desc]
    value.desc.push("Resolved: "+fixDesc)
  }
  value.resolved = Date.now()
  await db.set(id,value)
  Log('Done!')
}*/

async function addToMsgs(fromWho, contents, toWho){
  var u = (typeof username === "object") ? username : await db.get("user:"+username)
  if(!u) throw false
  u.dms = u.dms || []
  u.dms.push({
    dmcontents:contents,
    fromwho:fromWho,
    id: generateId()
  })
  if(typeof username !== "object") await db.set("user:"+username, u)
}

//this is for direct messaging
function directMessage(toWho, fromWho, messageContents, notifyOrNo) {
  if(notifyOrNo === true) {
    sendNotifToUser(fromWho + " messaged you. This is the message: " + messageContents, toWho);
    addToMsgs(fromWho, messageContents, toWho)
  } else {
    notif(fromWho + " messaged you. This is the message: " + messageContents, toWho, null, false);
    addToMsgs(fromWho, messageContents, toWho)
  }
  Log(`direct message sent (this log message will be removed sorry if its annoying)`);
}
//example for dming: directMessage("TomMustBe12", "TomMustBe12", "This is a message from TomMustBe12.", true)

router.get("/server/testPurposes/dmTom", function(res) {
  directMessage("TomMustBe12", "TomMustBe12", "This is a message from TomMustBe12.", true)
  res.send('done');
})

router.get("/server/admin/tools", auth, function(req,res) {
	res.sendFile(__dirname+"/tools.html")
})
router.get("/server/db/:k", auth, async function(req,res) {
	let s = (await db.getStream(req.params.k))
	if(s) s.pipe(res)
	else res.send("no thing")
})

router.get("/server/checkPwd/*", function(req, res) {
  res.header("Content-Type", "text/plain")
  var pwdGiven = req.params[0];

  if(pwdGiven === process.env['passKey']) {
    res.send("1"); // binary being 'true'
  } else {
    res.send("0"); // binary being 'false'
  }
})

app.use(router)

app.use(express.static(__dirname))

const mkwebsite = require("./minekhan-website/index.js")

//const {serveIndex,gdrivemw} = require("./serveIndex.js")
//app.use("/stuff2",gdrivemw("1KCM3Cu2otCW8y0GYtI-cQXjfL-SXe0Yy"))

/*app.use(async (req, res, next) => {
	let tpath = decodeURIComponent(req.path)
	let dir
	try{
		dir = await fs.promises.opendir(path.join(__dirname,"public",tpath))
	}catch(e){
		next()
		return
	}
	let dir2 = []
	for await(const dirent of dir) dir2.push(dirent)
	serveIndex(req,res, dir2, async name => await fs.promises.readFile(path.join(__dirname,"public",tpath,name)), f => f.isDirectory())
})*/

app.use((req,res) => {
	res.redirect("https://"+theHost+req.url)
})


console.log("end of index.js")

void 0
