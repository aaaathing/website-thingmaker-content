importScripts("/localforage.js")

self.addEventListener('push', async event => {
  const data = event.data.json();

  if(data.type === "notif"){
    self.registration.showNotification("", {
      body: data.msg,
      actions:data.actions
    });
  }else if(data.type === "resetNotifs"){
    localforage.removeItem("notifs")
  }
  console.log("Message recieved:",data)
});
self.addEventListener("pushsubscriptionchange", async e => {
  localforage.removeItem("notifs")
})
function doAction(a){
  if(a.startsWith("open:")) clients.openWindow(a.replace("open:",""))
  else return false
  return true
}
self.addEventListener('notificationclick', e => {
  if(e.notification.actions.length){
    e.notification.close();
    if(!doAction(e.action)){
      doAction(e.notification.actions[0].action)
    }
  }
})