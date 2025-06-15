
/*
This script is used in most pages of this website

Most code here is by thingmaker (thingmaker.us.eu.org)
*/

/*const origin = "https://aaaathing.github.io"
if(location.origin !== origin && location.origin !== "http://localhost"){
  fetch(origin+"/test").then(() => {
    location.href = origin + location.pathname
  })
}*/

const {floor, ceil, abs, round} = Math

var script = document.createElement("script")
script.src = "//cdn.jsdelivr.net/npm/sweetalert2@11"
document.body.appendChild(script)

/*{
  let diff = Date.now()-(new Date('Fri Nov 17 2023'))+(new Date().getTimezoneOffset()*60*1000)
console.log(diff)
  document.body.style.filter = "grayscale("+(diff/1000/60/60/24)*0.1+")"
}*/
/*let userCount = USERCOUNT
document.body.style.filter = "grayscale("+(1-(userCount/50))+")"*/
/*if(userCount < 25){
  let desertedness=25-userCount
  document.body.insertAdjacentHTML("beforeend",'<svg style="display:none;"><filter id="wavy2"><feTurbulence x="0" y="0" baseFrequency="0.01" numOctaves="5" seed="1" /><feDisplacementMap in="SourceGraphic" scale="'+desertedness+'" /></filter></svg>')
  document.body.style.filter += "url(#wavy2)"
}*/
let luserInfo
try{
luserInfo = USERDATA
}catch{}
const userInfo = luserInfo

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
  subscription = await swRegister.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
  })
  await fetch('/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
async function sameSubscribe(){
  if(!subscription) return console.error("no subscription")
  await fetch('/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

let swRegister, subscription
if(navigator.serviceWorker) navigator.serviceWorker.register('/sw.js', {
  scope: '/'
}).then(r => {
  swRegister = r
  windowLoadedForPush++
  mentionNotifications()
})

var script = document.createElement("script")
script.src = "/assets/localforage.js"
document.body.appendChild(script)
let localforageScript = script
let windowLoadedForPush = 0
localforageScript.addEventListener("load", function(){
  windowLoadedForPush++
  mentionNotifications()
});
async function mentionNotifications(){
  if(windowLoadedForPush !== 2) return console.log("not mention notifs "+windowLoadedForPush)
  if(!userInfo) return
  console.log("mention notifs")
  if(await localforage.getItem("noNotifs")) return
  if (await localforage.getItem("notifs")) {
    subscription = await swRegister.pushManager.subscribe({
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
}


//====================NAVBAR===============
var navbar = document.createElement("div");
navbar.className = "navbar navbarStick"

navbar.innerHTML = `
  <a class="logo" href="/"><span style="font-size:50%;transform:scaleY(2);display:inline-block;">Many things website</span></a>
  <div class="search-container">
    <form action="/search">
      <input type="text" placeholder="Search..." name="q">
<button type="submit">🔎</button>
    </form>
  </div>

	<a onclick="history.back()">◀</a>
	<a onclick="history.forward()">▶</a>
	<a onclick="location.reload()">↻</a>
	<a href="/posts">Posts</a>
	<div class="dropdown">
    <a class="dropdown-name" href="/minekhan/">MineKhan</a>
    <div class="dropdown-content">
			<a href="/minekhan/">MineKhan (thingmaker version)</a>
    </div>
  </div>

	<a class="right" onclick="navbar.classList.remove('navbarStick')">&times;</a>

	<div class="dropdown right">
    <a class="dropdown-name">Theme</a>
    <div class="dropdown-content">
      <a onclick="setTheme('')">Light</a>
      <a onclick="setTheme('dark')">Dark</a>
      <a onclick="setTheme('dark,glow')">Glow</a>
    </div>
  </div>
  
  <span id="adminNav"></span>

  <a class="right" id="loggedIn" href="/login">Log in</a>
  <div class="dropdown right" id="usernameDropdown" style="display:none;">
    <a class="dropdown-name"></a>
    <div class="dropdown-content">
      <a href="/account">Account</a>
      <a id="usernameDropdown-profile">Profile</a>
    </div>
  </div>
  <a class="right" id="notifs" href="/notifs">Notifications</a>
`
document.body.prepend(navbar)

var style=document.createElement("style")
style.innerHTML = `
.navbar{
  background:var(--black);
  /*height:47px;*/
  z-index:10;
  color: white;
}
.navbarStick{
	position:sticky;
  top:0;
}
.navbar:after{
  content:"";
  display:block;
  clear:both;
}
body[theme=dark] .navbar{
  background:#444;
}
.navbar a{
  /*float: left;
  display: block;*/
  text-align: center;
  padding: 14px 20px;
  text-decoration: none;
  cursor:pointer;
  color: white;
}
body[theme=dark] .navbar a{
  color:white;
}
/* Right-aligned link */
.navbar .right {
  float: right;
}
.navbar .logo{
  background:var(--theme);
}
.navbar .search-container{
  /*padding: 6px 10px;
  margin:8px 20px;*/
  padding:4px;
  /*float:left;*/
  display:inline-block;
}
/* Change color on hover */
.navbar a:hover {
  background-color: #ddd;
  color: black;
}
body[theme=dark] .navbar a:hover{
  background:#111;
}
.navbar .dropdown{
  background:inherit;
}
.navbar .dropdown > a{
  display:block;
}
.navbar .dropdown .dropdown-content{
  background:inherit;
}
.navbar .dropdown .dropdown-content a{
  display:block;
  width:100%;
  float:none;
}
`
document.head.appendChild(style)

async function setTheme(theme){
	localStorage.setItem("theme", theme)
	updateTheme(theme)
}

//================LOGGEDIN==============
/*function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}*/

function findUnread(n){
  var a = 0
  for(var i=0; i<n.length; i++){
    if(!n[i].read) a++
  }
  if(a > 0) return a
}
function addBanner(text, bg = "white", color = "black"){
  var div = document.createElement("div")
  div.style.padding = "10px"
  div.style.background = bg
  div.style.color = color
  div.style.borderBottom = "1px solid black"
  div.style.boxShadow = "0px 0px 15px 3px black"
  div.innerHTML = text
  document.body.prepend(div)
}

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
}
/*.catch(function(e){
  console.log(e)
  addBanner("Something went wrong when fetching","var(--red)")
})*/
/*
var logged = getCookie("username")
if(logged){
  loggedInEl.innerHTML = logged
}*/

var script = document.createElement("script")
script.src = "/news.js"
document.body.appendChild(script)

//===============FOOTER=============
var div = document.createElement("div")
div.innerHTML = `
<div>
  <b>footer</b>
  <ul>
    <li><a href="/">home</a></li>
  </ul>
</div>
`
div.classList.add("footer")
document.body.appendChild(div)

div = document.createElement("div")
div.className = "footerPlaceholder"
document.body.appendChild(div)

var style=document.createElement("style")
style.innerHTML = `
.footer {
  padding: 20px;
  display:flex;
  background: #ddd;
  justify-content:center;
  flex-direction:row;
  position:absolute;
  bottom:0;
  width:100%;
  height:200px;
  overflow:auto;
}
body[theme=dark] .footer{
  background:#171717;
}
.footer > div{
  margin:0px 20px;
}
.footer > div > ul{
  list-style-type: none;
  margin: 0;
  padding: 0;
}
.footer > div > ul li{
  margin:10px 0px;
}
.footer > div{
  text-align:center;
}
.footerPlaceholder{
  height:200px;
}
`
document.head.appendChild(style)

//=========THEME===========
var globTheme
async function updateTheme(theme){
  theme = theme || (localStorage.getItem("theme"))
	let themeParsed = theme ? theme.split(",") : []
	document.body.setAttribute("theme", themeParsed[0]||"")
  document.body.setAttribute("theme2", themeParsed[1]||"")
  /*document.body.setAttribute("theme", theme)
  document.body.setAttribute("theme2", "")
  if(theme === "glow"){
    document.body.setAttribute("theme", "dark")
    document.body.setAttribute("theme2", "glow")
  }*/
  globTheme = theme
}
updateTheme()
//localforageScript.addEventListener("load",() => updateTheme())

function timeDiffString(millis){
  const SECOND = 1000
  const MINUTE = SECOND * 60
  const HOUR = MINUTE * 60
  const DAY = HOUR * 24
  const YEAR = DAY * 365

  if (millis < SECOND) {
    return "just now"
  }

  let years = floor(millis / YEAR)
  millis -= years * YEAR

  let days = floor(millis / DAY)
  millis -= days * DAY

  let hours = floor(millis / HOUR)
  millis -= hours * HOUR

  let minutes = floor(millis / MINUTE)
  millis -= minutes * MINUTE

  let seconds = floor(millis / SECOND)

  if (years) {
    return `${years} year${years > 1 ? "s" : ""} and ${days} day${days !== 1 ? "s" : ""} ago`
  }
  if (days) {
    return `${days} day${days > 1 ? "s" : ""} and ${hours} hour${hours !== 1 ? "s" : ""} ago`
  }
  if (hours) {
    return `${hours} hour${hours > 1 ? "s" : ""} and ${minutes} minute${minutes !== 1 ? "s" : ""} ago`
  }
  if (minutes) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  }
  return `${seconds} second${seconds > 1 ? "s" : ""} ago`
}
function timeString(time){
  return timeDiffString(Date.now() - time) + " | " + (new Date(time).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }))
}
async function getLocalTime(time){
  return await fetch(`/server/getLocalTime?time=${Date.now()}${time ? "&convert="+time : ""}`).then(r => r.json()).then(r => {
    if(r.success){
      return r.time || r.diff
    }else{
      console.error(r.message)
      alert(r.message)
    }
  })
}
async function getLocalTimeString(time){
  time = await getLocalTime(time)
  return timeString(time)
}
function hashCode(str) {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    let chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

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
    fetch(`/server/account/${user}`).then(r => r.json()).then(r => {
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
    fetch("/server/voteUser/"+username, {
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

/*function formatGetAttributesInString(str){
  var arr = []
  var attribute = "", value = ""
  var inQuotes = false, quoteType = null
  var isValue = false
  for(var l of str){
    if((!inQuotes || l === quoteType) && (l === "'" || l === '"')){
      inQuotes = !inQuotes
      quoteType = l
      if(!inQuotes){
        if(attribute) arr.push([attribute.toLowerCase(),value])
        attribute = value = ""
        isValue = false
        quoteType = null
      }
    }else if(!inQuotes && l === " "){
      if(attribute) arr.push([attribute.toLowerCase(),value.toLowerCase()])
      attribute = value = ""
      isValue = false
      quoteType = null
    }else if(!inQuotes && !(isValue && value) && l === "="){
      isValue = true
    }else{
      if(isValue) value += l
      else attribute += l
    }
  }
  if(attribute) arr.push([attribute.toLowerCase(),value.toLowerCase()])
  return arr
}
function formatGetElementsInString(str){
  var main = []
  var element = {elements:main}
  while(str){
    var isText = true
    if(str[0] === "<"){
      var i = 0
      var j = str.indexOf(">")
      if(j === -1){
        isText = true
      }else if(str[i+1] === "/"){
        var tagName = str.substring(i+2,j).toLowerCase()
        if(tagName === element.tagName){
          element = element.parent
          isText = false
        }
      }else if(!formatUnparsedElements.includes(element.tagName)){
        var preclose = (str[j-1] === "/") ? 1 : 0
        var attributeStart = str.indexOf(" ")
        if(attributeStart > j) attributeStart = -1
        var tagEnd = attributeStart === -1 ? j-preclose : attributeStart+i
        attributeStart = attributeStart === -1 ? j-preclose : attributeStart+i+1
        var tagName = str.substring(i+1,tagEnd).toLowerCase()
        var parent = element
        var attributes = formatGetAttributesInString(str.substring(attributeStart,j-preclose))
        element = {tagName,attributes,elements:[],parent}
        parent.elements.push(element)
        if(formatUnclosedElements.includes(tagName) || preclose){
          element = parent
        }
        isText = false
      }
      if(!isText) str = str.substring(j+1,str.length)
    }
    if(isText){
      var i = str.substring(1,str.length).indexOf("<")
      if(i === -1) i = str.length
      else i++
      let str2 = str.substring(0,i)
      if(!formatUnparsedElements.includes(element.tagName)) str2 = str2.replace(/</g,"&lt;").replace(/>/g,"&gt;")
      element.elements.push(str2)
      str = str.substring(i,str.length)
    }
  }
  return main
}
var formatSafeElements = ["h1","h2","h3","h4","h5","h6","p","img","video","audio","a","ul","ol","li","pre","code","br","image-recipe","mc-recipe","font","b","i","big","center","small","span","strike","strong","sub","sup","table","tbody","td","tfoot","th","thead","tr","hr"]
var formatSafeAttributes = ["align","alt","width","height","href","src","media","title","style","target",'inline',"controls","loop"]
var formatUnclosedElements = ["img","br","hr"]
var formatUnparsedElements = ["pre","code"]
function formatConvertToSafeHtml(elements,addTo){
  for(var e of elements){
    if(typeof e === "string"){
      addTo.insertAdjacentHTML("beforeend",e)
      continue
    }else if(e instanceof HTMLElement){
      addTo.appendChild(e)
      continue
    }
    if(!formatSafeElements.includes(e.tagName)) e.tagName = "span"
    let element = document.createElement(e.tagName)
    addTo.appendChild(element)
    for(let a of e.attributes){
      if(!formatSafeAttributes.includes(a[0]) && !(a[0] === "id" && a[1].startsWith("heading_"))) continue
      element.setAttribute(a[0],a[1])
    }
    if(formatUnclosedElements.includes(e.tagName)) continue
    formatConvertToSafeHtml(e.elements,element)
  }
  return addTo
}
function formatGetElementsByTagName(e,tag, arr = []){
  if(e) for(var i of e){
    if(i.tagName === tag) arr.push(i)
    formatGetElementsByTagName(i.elements,tag,arr)
  }
  return arr
}
function formatGetAttribute(e,a){
  for(var i of e.attributes){
    if(i[0] === a) return i[1]
  }
  return null
}
function formatGetAttributeArr(e,a){
  for(var i of e.attributes){
    if(i[0] === a) return i
  }
}*/
const HTMLSafeElements = new Set(["h1","h2","h3","h4","h5","h6","p","img","video","audio","a","ul","ol","li","pre","code","br","b","i","big","center","small","span","strike","strong","sub","sup","table","tbody","td","tfoot","th","thead","tr","hr","button","details","summary","div","blockquote","q"])
const HTMLSafeAttributes = new Set(["align","alt","width","height","href","src","media","title","style","target","controls","loop"])
const HTMLEvalAttributes = new Set(["onclick","onmousemove","onmousedown","onmouseup","onmouseover","onmouseout","onmouseenter","onmouseleave","onmousewheel","onwheel"])
let safeTemplate = document.createElement("template")
function makeHTMLSafeElement(el,attrcb,elcb){
  if(elcb && elcb(el)) return
  for(let c of Array.from(el.children)){
    if(!HTMLSafeElements.has(c.tagName.toLowerCase())){
      c.remove()
      continue
    }
    for(let a of c.attributes){
      if(!HTMLSafeAttributes.has(a.name.toLowerCase()) && !(attrcb && attrcb(a.name.toLowerCase(),a.value.toLowerCase(),c))) c.removeAttribute(a.name)
    }
    makeHTMLSafeElement(c,attrcb,elcb)
  }
}
function makeHTMLSafe(str,attrcb,elcb){
  safeTemplate.innerHTML = str
  makeHTMLSafeElement(safeTemplate.content,attrcb,elcb)
  return safeTemplate.innerHTML
}

let notLetterRegex = /[^a-zA-Z]+/g, headingNames = new Set(["h1","h2","h3","h4","h5","h6"])
/*function formatTextInElements(arr){
  let str = ""
  for(var i=0; i<arr.length; i++){
    if(typeof arr[i] === "string"){
      var m = arr[i]
      str += m+" "
      if(userInfo ? userInfo.profanityFilter : true) for(var obj of remove){ //remove bad words
        m = m.replace(obj.replace, "<span style='color:red; background:black;'>"+obj.with+"</span>")
      }
      //m = m.replace(/ /g, "&nbsp;")
      //m = m.replace(/\n/g, "<br>"
      m = m.replace(/@([^ \n]*)/g, "<a href='/user?user=$1'>@$1</a>")
      m = m.replace(
        /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal|io))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/gi
        , "<a href='$1'>$1</a>")
      arr[i] = m
    }else{
      let c = formatTextInElements(arr[i].elements)
      if(headingNames.includes(arr[i].tagName)){
        let has
        for(let j of arr[i].attributes){
          if(j[0] === "id"){
            has = j
            break
          }
        }
        if(has) has[1] = "heading_"+c
        else arr[i].attributes.push(["id","heading_"+c])
      }
    }
  }
  return str.substring(0,str.length-1).replace(notLetterRegex,"-")
}*/
const mcAssetsUrl = "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.0/assets/minecraft/textures/"
let replaceWithEl = document.createElement("span")
function formatElcb(el){
  let name = el.tagName ? el.tagName.toLowerCase() : ""
  if(name === "image-recipe"){
    var a = el.textContent.trim().split("\n")
    el.innerHTML = ""
    for(let v of a){
      let v2 = v.trim()
      el.insertAdjacentHTML("beforeend", v2 ? `<img src="${mcAssetsUrl}${v2}.png">` : "<div></div>")
    }
    return
  }
  if(name === "pre" || name === "code"){
    if(window.Prism){
      let lang = el.getAttribute("codeType")
      let notcode = el.getAttribute("notcode")
      if(!lang) lang = "javascript"
      if(Prism.languages[lang] && notcode === null){
        el.innerHTML = Prism.highlight(el.textContent, Prism.languages[lang], lang)
      }
    }
    return true
  }
	if(name === "scratchblocks"){
		if(window.scratchblocks){
			let code = el.textContent
			let options = el.dataset
			let doc = scratchblocks.parse(code, options)
			let svg = scratchblocks.render(doc, options)
			el.replaceChildren(svg)
		}
		return true
	}
	/*if(name === "panorama"){
		createPanorama(el,el.getAttribute("panoramaShape"),el.getAttribute("src"))
		return true
	}*/
  if(name === "a") el.dontLInkTHIsS = true
  for(var n of el.childNodes){
    if(el.dontLInkTHIsS) n.dontLInkTHIsS = true
    else if(n.nodeType === Node.TEXT_NODE){
      let m = n.textContent
      if(userInfo ? userInfo.profanityFilter : true) for(var obj of remove){ //remove bad words
        m = m.replace(obj.replace, obj.with)//"<span style='color:red; background:black;'>"+obj.with+"</span>")
      }
      m = m.replace(/(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal|io))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/gi,"<a href='$&'>$&</a>")
      m = m.replace(/@([^ \n]*)/g,"<a href='/user?user=$1'>$&</a>")
      replaceWithEl.innerHTML = m
      n.replaceWith(...replaceWithEl.childNodes)
      //n.textContent = m
      //m = m.replace(/ /g, "&nbsp;")
      //m = m.replace(/\n/g, "<br>"
      /*for(let t of m.matchAll(/(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal|io))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/gi)){
        let r = n.splitText(t.index)
        r.splitText(t[0].length)
        let a = document.createElement("a")
        a.textContent = t[0]
        a.href = t[0]
        r.replaceWith(a)
      }
      for(let t of m.matchAll(/@([^ \n]*)/g)){
        let r = n.splitText(t.index)
        r.splitText(t[0].length)
        let a = document.createElement("a")
        a.textContent = t[0]
        a.href = "/user?user="+t[1]
        r.replaceWith(a)
      }*/
    }
  }
  if(headingNames.has(name)){
    el.setAttribute("id","heading_"+el.textContent.replace(notLetterRegex,"-"))
  }
}

// These are extra ones used by website
HTMLSafeElements.add("image-recipe")
HTMLSafeElements.add("iframe")
HTMLSafeElements.add("source")
HTMLSafeAttributes.add("codetype")
HTMLSafeAttributes.add("notcode")
HTMLSafeAttributes.add("inline")
HTMLSafeAttributes.add("loading")
HTMLSafeAttributes.add("preload")
HTMLSafeElements.add("scratchblocks")
HTMLSafeAttributes.add("data-style")
HTMLSafeAttributes.add("data-scale")
HTMLSafeAttributes.add("data-inline")

let remove = (function(){ //wow, this is a really advanced filter
  var arr = [//if you update this, also update one on website
    {replace:["k","c","u","f"].reverse().join(""), optional:["c"]},
    {replace:["t","n","u","c"].reverse().join(""), optional:["u"]},
    {replace:"stupid", with:"very not smart", optional:["u","i"]},
    {replace:"dumby", with:"not smart", optional:["b","y"],noEnd:"p"},
    {replace:"bitch",with:"female dog, wolf, fox, or otter", optional:["i","h"]},
    {replace:"shit",with:"poo poo",noStart:"[a-z]", optional:["i"]},
    {replace:"crap",with:"something of extremely poor quality",noStart:"s"},
    {replace:"ass",with:"animal of the horse family",noStart:"[a-z]",noEnd:"[a-rt-z]"},
    {replace:"sex",with:"type",noStart:"[a-z]"},
    {replace:"nigger",with:"unknown"}
  ]
  let nlab
  try {//https://stackoverflow.com/questions/60325323/how-to-test-to-determine-if-browser-supports-js-regex-lookahead-lookbehind
    nlab = !(
      "hibyehihi"
        .replace(new RegExp("(?<=hi)hi", "g"), "hello")
        .replace(new RegExp("hi(?!bye)", "g"), "hey") === "hibyeheyhello"
    );
  } catch (error) {
    nlab = true;
  }
  if(nlab) alert("look-ahead or look-behind")
  const between = "[THELETTER \\\-_\*.,|`~\\/\\\\!&\?\\\[\\\]'\":;]*" //there might be characters between, like this: b.a.d
  const subs = {
    i:["1","!","|","l"],
    u:["v","µ"],
    f:["ƒ"],
    v:["\\\/"],
    s:["$"],
    g:["9"]
  } //letters could be replaced like this: thlng
  arr.forEach((obj, i) => {
    var str = "", value, witH
    if(typeof obj === "string") value = obj, witH = "bad"
    else value = obj.replace, witH = obj.with || "bad"
    if(obj.noStart && !nlab) str += "(?<!"+obj.noStart+")" //negative look behind
    for(var j=0; j<value.length; j++){
      var letter = value[j], group = value[j]
      if(subs[letter]){
        group = "("+letter+"|"+subs[letter].join("|")+")"
        letter += subs[letter].join("")
      }
      if(obj.optional && obj.optional.includes(value[j])) group = ""
      if(j+1 === value.length) str += group
      else str += group + between.replace("THELETTER",letter)
    }
    if(obj.noEnd && !nlab) str += "(?!"+obj.noEnd+")"
    arr[i] = {original:value,replace:new RegExp("("+str+")", "gi"),with:witH}
  })
  return arr
})()

function format(str){
  str = str.replace(/{{ASSETS_URL}}/g,mcAssetsUrl)
  return "<span class='format'>"+makeHTMLSafe(str,null,formatElcb)+"</span>"
}
/*function format(m){
  m = m.replace(/{{ASSETS_URL}}/g,mcAssetsUrl)
  var elements = formatGetElementsInString(m)

  prismHilite(elements)
  var r = formatGetElementsByTagName(elements,"image-recipe")
  for(var i=0; i<r.length; i++){
    var a = r[i].elements.join("").split("\n")
    a.pop(); a.shift() //remove first and last
    r[i].elements = a.map(v => v ? `<img src="${mcAssetsUrl}${v}.png">` : "<div></div>")
  }
  r = formatGetElementsByTagName(elements,"font")
  for(var i=0; i<r.length; i++){
    var font = formatGetAttribute(r[i],"font")
    if(font){
      var s = formatGetAttributeArr(r[i],"style") || ["style",""]
      s += "fontFamily:"+font+";"
    }
  }
  formatTextInElements(elements)
  m = formatConvertToSafeHtml(elements,document.createElement("div")).innerHTML

  return m
  //return md.render(m).replace(/\n$/,"")
}
function prismHilite(el){
  if(!window.Prism) return
  var pres = [...formatGetElementsByTagName(el,"pre"),...formatGetElementsByTagName(el,"code")]
  for(var i=0; i<pres.length; i++){
    var pre = pres[i]
    var lang = formatGetAttribute(pre,"codeType")
    var notcode = formatGetAttribute(pre,"notcode")
    if(!lang) lang = "javascript"
    if(Prism.languages[lang] && notcode === null){
      pre.elements = [Prism.highlight(pre.elements.join(""), Prism.languages[lang], lang).replace(/\./g,"&period;")]
    }
  }
}*/

/*const panoramaStrips = 24, panoramaScale = 1024
const panoramaStripW = 2*panoramaScale*Math.sin(Math.PI/panoramaStrips)
const panoramaStripR = panoramaScale*Math.cos(Math.PI/panoramaStrips)
function createPanorama(el,shape,img){
	const contain = document.createElement("div")
	contain.className = "camera"
	if(shape === "cyl"){
		for(let i=0; i<panoramaStrips; i++){
			let div = document.createElement("div")
			div.style.transform = "rotateY("+(i/panoramaStrips)+"turn)translate3d("+((-i+(panoramaStrips/2)-0.5)*panoramaStripW)+"px,0,"+panoramaStripR+"px)"
			div.style.backgroundImage = "url('"+img+"')"
			//div.style.backgroundPositionX = i/panoramaStrips*100+"%"
			contain.appendChild(div)
		}
	}
	el.appendChild(contain)
}*/
/*

panorama{
	height: 80vh;
	max-width:100%;
  aspect-ratio: 16 / 9;
	display:block;
	perspective:700px;
	overflow:hidden;
}
panorama .camera{
	transform-style: preserve-3d;
	height:100%;
	position:relative;
	transform:translateZ(700px) rotateY(0deg) translate3d(50%,50%,0);
}
panorama .camera > div{
	translate:-50% -50%;
	width:${panoramaStripW*panoramaStrips}px;
	height:${panoramaScale}px;
	position:absolute;
	top:0;
	left:0;
	background-size: 100% 100%;
}*/

const sanitizer = document.createElement('div')
function sanitize(text) {
  sanitizer.textContent = text
  return sanitizer.innerHTML
}

var prismVersion = "9000.0.1"

var script = document.createElement("script")
script.src = "https://cdnjs.cloudflare.com/ajax/libs/prism/"+prismVersion+"/prism.min.js"
document.body.appendChild(script)

var prismTheme = localStorage.getItem("theme") === "dark" ? "prism-dark" : "prism"
var link = document.createElement("link")
link.rel = "stylesheet"
link.href = "https://cdnjs.cloudflare.com/ajax/libs/prism/"+prismVersion+"/themes/"+prismTheme+".min.css"
document.head.appendChild(link)

var script = document.createElement("script")
script.src = "https://cdn.jsdelivr.net/npm/scratchblocks@3.6.4/build/scratchblocks.min.js"
document.body.appendChild(script)

var style = document.createElement('style')
style.innerHTML = `
.format pre, .format code{
  padding:10px;
  background:#f8f4f4;
  color:black;
  white-space:pre-wrap;
  display: block;
  font-family: monospace;
  margin: 1em 0px;
}
.format pre[inline], .format code[inline]{
  display: inline-block;
  padding: 0 2px;
  margin: 0;
}
.format blockquote{
	padding:8px;
	background:#eee;
  color:black;
}
body[theme=dark] .format pre, body[theme=dark] .format code, body[theme=dark] .format blockquote{
  color:white;
  background:black;
}

.format img, .format video{
  max-width:100%;
}
.format{
  overflow-wrap: break-word;
  white-space:pre-wrap;
}

mc-recipe, image-recipe{
  display: flex;
  flex-wrap: wrap;
  width:144px;
  image-rendering:pixelated;
  outline:2px solid black;
}
mc-recipe > *, image-recipe > *{
  width:48px;
  height:48px;
  outline:1px solid black;
}
`
document.head.appendChild(style)