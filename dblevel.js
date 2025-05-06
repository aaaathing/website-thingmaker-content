const pathMod = require("path"), fs = require("fs")
const {Level} = require('level')
const db = new Level(pathMod.resolve(__dirname,"..","website-db"))
if (!db.supports.permanence) {
  throw new Error('Persistent storage is required')
}
const filePath = pathMod.resolve(__dirname,"..","website-db-files")

module.exports = {
  get:async function(key){
    var value = await db.get(key)
    if(value !== undefined){
      return JSON.parse(value)
    }else{
      return null
    }
  },
  set:async function(key, value, options){
    if(!(options && options.raw)) value = JSON.stringify(value)
    await db.put(key, value)
    return this
  },
  delete:async function(key){
    await db.del(key)
    return this
  },
  list:async function(prefix, values){
    let obj = values ? {} : []
    if(values) throw new Error("list values not implemented")
    for await(let k of db.keys({gte:prefix,lt:prefix+"\xff"})){
      obj.push(k)
    }
    return obj
  },

  setFile:async function(path,value){
    await fs.promises.writeFile(path.join(filePath,path),value)
  },
  getStream:async function(path){
    return fs.createReadStream(path.join(filePath,path))
  },
  setStream:function(path,value){
    value.pipe(fs.createWriteStream(path.join(filePath,path)))
  },
	deleteFile: async function(path){
		await fs.promises.rm(path.join(filePath,path))
	},
  autoDeleteOld:()=>{}//todo
}