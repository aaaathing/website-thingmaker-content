const start = 0
const fs = require("fs").promises
const fss = require("fs")
const {Storage} = require('@google-cloud/storage');

const readline = require("readline");
const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
});

rl.question("password: ", async function(pwd) {
	const storage = new Storage({
		credentials:{
			audience: "replit",
			subject_token_type: "access_token",
			token_url: "https://d92c1ce3-c860-4c01-889d-59187041fb3a-00-cs3big0s2ji1.riker.replit.dev:3001/"+pwd+"/token",
			type: "external_account",
			credential_source: {
				url: "https://d92c1ce3-c860-4c01-889d-59187041fb3a-00-cs3big0s2ji1.riker.replit.dev:3001/"+pwd+"/credential",
				format: {
					type: "json",
					subject_token_field_name: "access_token"
				}
			},
			universe_domain: "googleapis.com"
		},
		projectId:""
	});
	const db=require("./dblmdb.js")
	const bucket = storage.bucket("replit-objstore-dfc036d2-f315-4a87-877d-ec3cea3d75ed")
	let allf = (await bucket.getFiles())[0].filter(r => !r.name.startsWith('saves:')&&!r.name.startsWith('session:'))
	let it=start
	for(let i=start;i<allf.length;i++){
		let file=allf[i]
		if(file.name.endsWith(".json")){
			try{
			db.set(file.name.slice(0,-5), JSON.parse((await file.download())[0]))
			}catch(e){console.error(e)}
		}else if(!file.name.endsWith('/')){
			await db.setStream(file.name, file.createReadStream())
		}
		it++
		if(!(it&63)) console.log(it+" / "+allf.length)
	}
	console.log("done")
})
