return
//let db=require("./db.js")
const mime = require('mime-types')
function b64tob(nam,str){
	let split=str.split(",")
	//let b=Buffer.from(split[1],"base64")
	let type= split[0].substring( split[0].indexOf(":")+1, split[0].indexOf(";"))
	let filename =nam+"."+mime.extension(type)
	console.log(filename)
	//db.setFile(filename, b)
	return filename
}

	let all=new Map(),allk=new Map()
async function convert(prefix, sp, ap){
	let l=await db.list(prefix)
	for(let i of l){
		if(i.includes("."))continue
		let mname=i.replace(prefix,sp)
		let v=await db.get(i)
		if(v.startsWith("data:")){
			let f=b64tob(i,v)
			all.set(mname,"/"+f)
			allk.set(mname,f)
		}else all.set(mname,v)

		/*let s = i.replace(prefix,sp)
		let m=await db.get(s)
		m.thumbnail=all.get(mname)
		m.thumbnailKey=allk.get(mname)
		await db.set(s,m)*/
	}
	
	console.log('done')
}
convert("images/mapThumbnail:map:","map:")
.then(async function(){
	let l2=await db.get("maps")
	for(let i in l2){
		let m=l2[i]
		m.thumbnail=all.get(i)
		m.thumbnailKey=allk.get(i)
	}
	await db.set("maps",l2)
})