var ldb = require("./olddb.js")
var db = require("./db.js")
ldb.list("",true).then(r => {
  var a = []
  for(var i in r) a.push(i)
  var i = 0
  async function n(){
    await db.set(a[i],r[a[i]])
    console.log(i+"/"+a.length)
    i++
    if(i>a.length) return console.log('done')
    setTimeout(n,50)
  }
  n()
})