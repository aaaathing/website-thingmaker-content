let fs=require("fs")

let index
try{
	index = fs.readFileSync(process.argv[2]+"/index.json", "utf-8")
}catch{}
index = index ? JSON.parse(index) : {}
let files=fs.readdirSync(process.argv[2])
let readline=require("readline")
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
function question(str){
	return new Promise(resolve => rl.question(str, resolve))
}
if(process.argv[3] === "auto"){
	for(let f of files){
		let s
		try{
		s = fs.readFileSync(process.argv[2]+"/"+f, "utf-8")
		}catch{continue}
		let c = [...s.matchAll(/<!--\s*(.*?)\s*-->|\/\/\s*(.*?)\n/g)].map(r => r[1]||r[2]).filter(r => Date.parse(r.substring(0,20)))
		index[f] = {
			created:c[0],
			lastModified:c[1]
		}
	}
	done()
}else (async function() {
for(let f of files){
	let o = index[f] || {}
	if(index[f])continue
	let a=await question(f+" created? ")
	if(a) o.created = a
	else continue
	a=await question(f+" last modified? ")
	if(a) o.lastModified = a
	index[f] = o
}
	done()
})()
function done(){
	index = Object.fromEntries(Object.entries(index).sort((a,b) => Date.parse(b[1].created)-Date.parse(a[1].created)))
	fs.writeFileSync(process.argv[2]+"/index.json", JSON.stringify(index,null,"\t"))
	
	console.log("done")
}