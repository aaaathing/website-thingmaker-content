async function serveIndex(req,res, dir,read,isDirectory){
	let path = decodeURIComponent(req.path)
	//let dir = list
	let index = {}
	for(let d of dir){
		if(d.name === "index.json") index = JSON.parse(await read("index.json"))
	}
	res.write("<style>a>*{vertical-align:middle;}.item{display:inline-block;width:16px;height:16px;box-sizing:border-box;}.file{border:1px solid black;background:white;}.folder{background:linear-gradient(0,yellow,brown);}</style>")
	res.write("<h1>Index of "+sanitize(path)+"</h1><hr>")
	let list = []
	for(const dirent of dir){
		let folder = isDirectory(dirent)
		let ii = index[dirent.name]
		list.push({name:dirent.name, str: "<tr><td><a href='"+sanitize(dirent.name)+(folder?"/":"")+"'><div class='item "+(folder?"folder":"file")+"'></div> <span>"+sanitize(dirent.name)+"</span></a></td><td>"+(ii&&ii.created||"")+"</td><td>"+(ii&&ii.lastModified||"")+"</td></tr>" })
		if(!folder && dirent.name.toLowerCase().startsWith("readme")){
			res.write("<h2>"+sanitize(dirent.name)+"</h2>"+await read(dirent.name)+"<hr>")
		}
	}
	res.write("<table><thead><tr><th>Name</th><th>Created</th><th>Last modified</th></tr></thead><tbody>")
	let now = Date.now()
	list.sort((a,b) => (index[b.name]&&index[b.name].created?Date.parse(index[b.name].created):now) - (index[a.name]&&index[a.name].created?Date.parse(index[a.name].created):now))
	for(let i of list){
		res.write(i.str)
	}
	res.write("</tbody></table>")
	res.end()
}
module.exports.serveIndex = serveIndex


const {GoogleAuth} = require('google-auth-library');
const {google} = require('googleapis');
const fs=require("fs")
const path=require("path")

let service
if(process.env["gdriveServiceacc"]){
	const auth = new GoogleAuth({
	  scopes: 'https://www.googleapis.com/auth/drive',
	  credentials:JSON.parse(process.env["gdriveServiceacc"])
	});
	service = google.drive({version: 'v3', auth});
}

function pipeAsync(from,to){
	return new Promise(resolve => {
		from.on("end",resolve).pipe(to)
	})
}



// node -e "require('./serveIndex.js').gdrivemw('18HU-fesCi44znWRH7rQ8Z8cxqspifId_','replit-objstore-6cdbe550-1c93-4f51-8778-7a52f0cd3367',0)"
/*module.exports.gdrivemw = async function(folderId, bucket, fetchInterval = 1000*60*60*24){
	let storage = require("./db.js").storage
	bucket = storage.bucket(bucket)
	if(await bucket.file(folderId+".lastFetch").exists()[0]){
		setTimeout(fetchAgain, fetchInterval-(Date.now()-(+(await bucket.file(folderId+"/lastFetch").download())[0].toString())) )
	}else fetchAgain()
	async function fetchAgain(){
		doFolder(folderId,folderId)
		await bucket.file(folderId+".lastFetch").save(Date.now()+"")
	}
	async function doFolder(folderId,path){
		let drvfiles = folderId ? (await service.files.list({
			q:"parents='"+folderId+"'",
			fields:"files(id,mimeType,name,shortcutDetails,modifiedTime)"
		})).data.files : [] //should be sorted
		let lc = drvfiles.values()
		let localFile = bucket.file(path)
		let localfiles = (await localFile.exists())[0] ? JSON.parse((await localFile.download())[0].toString()) : []
		let ll = localfiles.values()
		let fc = lc.next(), fl = ll.next()
		console.log(drvfiles,localfiles)
		while(!fc.done || !fl.done){
			if(fc.done || !fl.done && fc.value.name > fl.value.name){
				console.log("del", fl.value.name)
				if(fc.mimeType === "application/vnd.google-apps.folder") doFolder(null,path+"/"+fl.value.name)
				else await bucket.file(path+"/"+fl.value.name)
				fl = ll.next()
			}else if(fl.done || fc.value.name < fl.value.name){
				console.log('new', fc.value.name)
				if(fc.mimeType === "application/vnd.google-apps.folder") doFolder(fc.value.id, path+"/"+fc.value.name)
				else await pipeAsync((await service.files.get({ fileId: fc.value.id, alt: 'media', }, { responseType: "stream" })).data, bucket.file(path+"/"+fc.value.name).createWriteStream())
				fc = lc.next()
			}else{
				if(fc.mimeType === "application/vnd.google-apps.folder") doFolder(fc.value.id, path+"/"+fc.value.name)
				else if(fc.value.modifiedTime !== fl.value.modifiedTime){
					console.log('upt',fc.value.name, ct, fl.value.mtimeMs)
					await pipeAsync((await service.files.get({ fileId: fc.value.id, alt: 'media', }, { responseType: "stream" })).data, bucket.file(path+"/"+fc.value.name).createWriteStream())
				}//else console.log('same',fc.value.name)
				fc = lc.next(), fl = ll.next()
			}
		}
		await localFile.save(JSON.stringify(drvfiles))
	}
}*/

/*module.exports.gdrivemw = function(folderId){
	const cache = new Map()
	return async function(req,res,next){
		if(!service) return res.send("no access")
		let now = Date.now()
		try{
		let cur = {id:folderId, mimeType:"application/vnd.google-apps.folder"}
		let pathpart = ""
		for(let p of req.url.split("/")){
			if(!p) continue
			pathpart += p+"/"
			//if(cache.get(pathpart)){
			//	if(now-cache.get(pathpart).time<1000*60*60){
			//		cur = cache.get(pathpart).stuff
			//		continue
			//	}else cache.delete(pathpart)
			//}
			let l = (await service.files.list({
				q:"parents='"+cur.id+"' and name="+JSON.stringify(decodeURIComponent(p)),
				fields:"files(id,mimeType,name,shortcutDetails)"
			}))
			if(!l.data.files.length) return next()
			cur = l.data.files[0]
			if(cur.shortcutDetails){
				cur.id = cur.shortcutDetails.targetId
				cur.mimeType = cur.shortcutDetails.targetMimeType
			}
			//cache.set(pathpart, {time:now,stuff:cur})
		}
		if(cur.mimeType === "application/vnd.google-apps.folder"){
			let l = (await service.files.list({
				q:"parents='"+cur.id+"'",
				fields:"files(id,mimeType,name,shortcutDetails)"
			}))

			serveIndex(req,res, l.data.files, async name => (await service.files.list({ q:"parents='"+cur.id+"' and name="+JSON.stringify(name) })).data, f => (f.shortcutDetails&&f.shortcutDetails.targetMimeType||f.mimeType) === "application/vnd.google-apps.folder")
		}else{
			const file = await service.files.get({
		    fileId: cur.id,
		    alt: 'media',
		  }, { responseType: "stream" });
			file.data.pipe(res)
		}
		}catch(e){console.error(e);res.status(500).send(e.message)}
	}
}*/