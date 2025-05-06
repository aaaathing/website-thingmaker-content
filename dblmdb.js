const pathMod = require("path"), fs = require("fs")
let db = require("lmdb").open({
	path: pathMod.resolve(__dirname,"..","website-db"),
	compression: false,
	encoding:"msgpack",
	cache:false,
	pageSize:8192, // You may want to consider setting this to 8,192 for databases larger than available memory (and moreso if you have range queries) or 4,096 for databases that can mostly cache in memory.
});
const filePath = pathMod.resolve(__dirname,"..","website-db-files")

  // check for ones after May 1, 2025, 1 AM, if moving back to replit object storage

function esc(s){
  return s.replace(/\p{Lu}|ˆ/gu, (x) => "ˆ"+x.toLowerCase())
}
function unesc(s){
  return s.replace(/ˆ(.)/gu, (_,x) => x.toUpperCase())
}

function pipeAsync(from,to){
	return new Promise(resolve => {
		from.on("end",resolve).pipe(to)
	})
}
module.exports = {
  get:async function(key){
    let value = db.get(key) // synchronous
		return value === undefined ? null : value
  },
  set:async function(key, value, options){
		if(options && options.raw) throw new Error("set raw not implemented")
    await Promise.all([ db.put(key, value), db.put("!modified:"+key, Date.now()) ])
    return this
  },
  delete:async function(key){
    await Promise.all([ db.remove(key), db.remove("!modified:"+key) ])
    return this
  },
  list:async function(prefix, values){
    let obj = values ? {} : []
    if(values) throw new Error("list values not implemented")
    for await(let k of db.getKeys({start:prefix,end:prefix+"\xff"})){
      obj.push(k)
    }
    return obj
  },

  setFile:async function(path,value){
    path = pathMod.join(filePath,esc(path))
    await fs.promises.mkdir(pathMod.dirname(path),{recursive:true})
    await fs.promises.writeFile(path,value)
  },
  getStream:async function(path){
    return fs.createReadStream(pathMod.join(filePath,esc(path)))
  },
  setStream:async function(path,value){
    path = pathMod.join(filePath,esc(path))
    await fs.promises.mkdir(pathMod.dirname(path),{recursive:true})
    await pipeAsync(value, fs.createWriteStream(path))
  },
	deleteFile: async function(path){
		await fs.promises.rm(pathMod.join(filePath,esc(path)))
	},
  autoDeleteOld:function(prefix,timelen){
    function doBegin(){
      doNext(prefix)
    }
    let me = this
    async function doNext(nextQuery){
      let nextNextQuery
      for await(let name of db.getKeys({start:nextQuery,end:prefix+"\xff",limit:100})){
        if(name.startsWith(prefix) && (Date.now() - new Date(db.get("!modified:"+name)).getTime()) > timelen){
          await me.delete(name)
          await me.delete("!modified:"+name)
        }
        last = name
      }
      await sleep(1000*60*60)
      if(nextNextQuery){
        doNext(nextNextQuery)
      }else{
        doBegin()
      }
    }
    doBegin()
  }
}
