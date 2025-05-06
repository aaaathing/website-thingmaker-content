let db=require("./db.js")
let readline=require("readline")
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
function question(str){
	return new Promise(resolve => rl.question(str, resolve))
}
;(async function(){

	let sk = await question('search prefix: ')
	const [files] = await db.bucket.getFiles({prefix:sk, softDeleted:true})
	let i=0
	for(let f of files){
		const {softDeleteTime,name,generation} = f.metadata
		console.log(i+++",", name,", deleted time",softDeleteTime,", generation",generation)
	}

	while(true){
	let f = files[await question("choose one: ")]
	let a = await question("what to do?\n1. restore\n2. show contents\n")
	if(a === "1"){
		f = await f.restore({generation:f.metadata.generation})
		console.log(f)
	}else if(a === "2"){
		console.log((await f.download())[0].toString()) //doesnt work
	}
	}

})()