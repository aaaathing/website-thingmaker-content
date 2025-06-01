const serverBase = "" // url

window.doLiveContent = false

addBanner("This is the old version of the website. The posts and accounts and things were shut down. These won't changed much anymore, and might be gone eventually. 😥","#FFA372")

// some things used to be in main website /assets/common.js

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/*
const publicVapidKey = 'BC97-wjdng136e_0JIJV3CHzcPKzfJsaCMscJrkoB1GMuyOJY8AvJg70WmGY5io5mPUEaBEbHrizKUvqqFagd5g';

async function subscribe() {
  if(!swRegister) return Swal.fire({
    title:"Wait!",
    text: 'Please wait for service worker to register.',
    icon: 'error',
  })
  if(subscription) return Swal.fire({
    title:"Wait!",
    text: 'You already subscribed.',
    icon: 'error',
  })
	let swRegistered = await swRegister
  subscription = await swRegistered.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
  })
  await fetch(serverBase+'/server/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
async function sameSubscribe(){
  if(!subscription) return console.error("no subscription")
  await fetch(serverBase+'/server/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

let subscription
if(swRegister) swRegister.then(r => {
  windowLoadedForPush++
  mentionNotifications()
})
*/
/*let windowLoadedForPush = 0
localforageScript.addEventListener("load", function(){
  windowLoadedForPush++
  mentionNotifications()
});
async function mentionNotifications(){
  if(windowLoadedForPush !== 3) return console.log("not mention notifs "+windowLoadedForPush)
  if(!userInfo) return
  console.log("mention notifs")
  if(await localforage.getItem("noNotifs")) return
  if (await localforage.getItem("notifs")) {
    subscription = await (await swRegister).pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    })
  }else{
    Swal.fire({
      title:"Notifcations!",
      text:"Please consider allowing notifications, to get notified of new things, and other notifications if you are logged in!",
      toast: true,
      denyButtonText:"No thank you!",
      confirmButtonText:"Yes please!",
      showConfirmButton:true,
      showDenyButton:true,
      position: 'top-right',
    }).then(async result => {
      if (result.isConfirmed) {
        await localforage.setItem("notifs", "true")
        await subscribe()
      }else if(result.isDenied){
        await localforage.setItem("noNotifs", "true")
      }
    })
  }  
}*/

//================LOGGEDIN==============
function findUnread(n){
  var a = 0
  for(var i=0; i<n.length; i++){
    if(!n[i].read) a++
  }
  if(a > 0) return a
}

fetch(serverBase+"/server/accountNav").then(r => r.json()).then(r => {
document.getElementById("userNav").style.display = ""
userInfo = r || null
var loggedInEl = document.getElementById("loggedIn")
var notifs = document.getElementById("notifs")
notifs.style.display = "none"
var logged = userInfo && userInfo.username
if(loggedInEl && logged){
  var usernameEl = document.querySelector("#usernameDropdown .dropdown-name")
  if(usernameEl){
    loggedInEl.style.display = "none"
    document.getElementById("usernameDropdown").style.display = ""
    usernameEl.innerHTML = logged
    usernameEl.href = "/account"
    document.querySelector("#usernameDropdown-profile").href="/user?user="+escape(logged)
  }else{
    loggedInEl.innerHTML = logged
    loggedInEl.href = "/account"
  }
  notifs.style.display = ""
  if(userInfo.notifs){
    var amount = findUnread(userInfo.notifs)
    notifs.innerHTML += amount ? (" ("+amount+")") : ""
  }
  if(userInfo.admin){
    document.querySelector("#adminNav").innerHTML = `
<a href="/admin/users.html">Users</a>
<a href="/admin/log.html">Log</a>
`
  }
  windowLoadedForPush++
  mentionNotifications()
}
}).catch(function(e){
  addBanner("Something went wrong when fetching: "+e, "var(--red)")
  throw e
})


function enableUserPopup(el,user){
  var hoveringEl = false, hoveringPopup = false
  el.addEventListener("mouseover", function(e){
    hoveringEl = true
    var popup = el.previousElementSibling
    if(popup && popup.classList.contains("popup")) return
    popup = document.createElement("div")
    popup.className = "popup"
    var popupContent = document.createElement("span")
    popup.appendChild(popupContent)
    popupContent.innerHTML = `<h3 class="skeletonText" style="width:200px;">&nbsp;</h3><br><span class="skeletonText" style="width:300px;">&nbsp;</span><br><span class="skeletonText" style="width:100px;">&nbsp;</span>`
    el.parentNode.insertBefore(popup, el);
    popup.addEventListener("mouseover", function(e){
      hoveringPopup = true
    })
    popup.addEventListener("mouseout", function(e){
      hoveringPopup = false
      setTimeout(function(){
        if(!hoveringPopup && !hoveringEl){
          popup.remove()
        }
      },1000)
    })
    fetch(serverBase+`/server/account/${user}`).then(r => r.json()).then(r => {
      if(!r){
        return popupContent.innerHTML = "User doesn't exist: "+user
      }
      popupContent.innerHTML = `${r.bg ? '<div class="bg"></div>' : ''}
      <div class="userContent">
      <a href="/user?user=${r.username}"><h3 style="display:inline-block;">
      <img class="pfp" style="width:30px;height:30px;border-radius:100%;border:1px solid gray;vertical-align:middle;">
      ${r.username}</h3></a><div class='popupVotes' style="margin-left:16px;display:inline-block;"></div><br>
      ${r.bio ? ""+r.username+" - "+format(r.bio) : ""}<br>
      ${r.lastActive ? "Last active: "+timeString(r.lastActive) : ""}</div>`
      if(r.bg) popupContent.querySelector(".bg").style.backgroundImage = 'url('+r.bg+')'
      popupContent.querySelector(".pfp").src = r.pfp
      makeVotes(popupContent.querySelector(".popupVotes"),r, userInfo && userInfo.username)
    })
  })
  el.addEventListener("mouseout", function(e){
    hoveringEl = false
    var popup = el.previousElementSibling
    if(!popup || !popup.classList.contains("popup")) return
    setTimeout(function(){
      if(!hoveringEl && !hoveringPopup){
        popup.remove()
        hoveringPopup = false
      }
    },1000)
  })
}

function makeVotes(el,data,yourUsername){
  let username = data.username
  el.innerHTML = `<div class="popupContainer">
<a class="allVotes"></a>
<div class="popup">
	<span style="padding:8px;">
		<button class="vote_1 small">+1</button>
		<button class="vote_0 small">0</button>
		<button class="vote_-1 small">-1</button>
		<br><br>
		<span class="voteInfo"></span>
		<br><br>
		<span style="color:gray;">If a user has 10 or more votes and 70% or more positive, they can create and edit wiki pages and delete some things.</span>
	</span>
</div>
</div>`
  let voteEl = el.querySelector(".allVotes")
  let voteInfo = el.querySelector(".voteInfo")
	let yourVote = data.yourVote || 0
	let votePercent, voteCount
  function updateVotes(data){
		({votePercent,voteCount} = data)
    voteEl.innerHTML = Math.round(votePercent*voteCount) // + (votes >= 10 ? " ✅" : "")
    voteEl.style.color = data.enoughVotes ? "green" : (votePercent < 0 ? "red" : "")
		voteInfo.textContent = Math.round(votePercent*100)+"% positive | "+voteCount+" voted"
		voteInfo.style.color = voteEl.style.color
  }
  updateVotes(data)
  el.querySelector(".vote_"+yourVote).classList.add("selected")
  function vote(amount){
    fetch(serverBase+"/server/voteUser/"+username, {
      credentials:'include',
      method: 'POST',
      body: JSON.stringify({vote:amount})
    }).then(d => d.json()).then(d => {
      if(d.success){
        el.querySelector(".vote_"+yourVote).classList.remove("selected")
				yourVote = amount
        updateVotes(d)
        el.querySelector(".vote_"+yourVote).classList.add("selected")
      }else{
        alert(d.message)
      }
    })
  }
  el.querySelector(".vote_1").onclick = () => vote(1)
  el.querySelector(".vote_0").onclick = () => vote(0)
  el.querySelector(".vote_-1").onclick = () => vote(-1)
}
