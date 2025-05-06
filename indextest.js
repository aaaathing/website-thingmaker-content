let arg=process.argv[2]
if(arg==="runall") {module.exports.run=true;return}


if(arg==="static"){
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors({
  origin: "*",
}))
app.use(express.static(__dirname + "/public"))
app.listen(80)
return
}


require("./editor/updatefiles.js")


/*function wait(x){return new Promise(r=>setTimeout(r,x))}
var unzipper = require('unzipper');
;(async function(){
  console.log((await db.list()).length)
})()*/
/*let i=0
db.getStream('users.zip')
.pipe(unzipper.Parse())
.on('entry', function (entry) {
  var fileName = entry.path;
  var type = entry.type; // 'Directory' or 'File'

  if (/\/$/.test(fileName)) {
    console.log('[DIR]', fileName, type);
    return;
  }
  //console.log(fileName)
  //process.exit()
  db.setStream(fileName,entry)
  i++
  if(!(i&64))console.log(i,fileName)
}).on("finish",console.log)*/