const webPush = require('web-push');
const publicVapidKey = process.env['publicVapidKey']
const privateVapidKey = process.env['privateVapidKey']
webPush.setVapidDetails('mailto:test@example.com', publicVapidKey, privateVapidKey);
function sendNotifTo(msg, subscription, fromUser = null, actions){
  const payload = JSON.stringify({
    type:"notif",
    msg,
    actions
  });

  webPush.sendNotification(subscription, payload)
    .catch(error => {
      console.warn(error)
    });
}

const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const what="Do you have old minekhan worlds or screenshots or other things? see this: https://thingmaker.us.eu.org/old.html"
rl.question("who: ", async function(who) {
	sendNotifTo(what,JSON.parse(who))
})