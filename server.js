// localGJK || Chubby Yoshi#0004
// ExternalAPI.js
// 10:39 PM, March 26, 2021

// Used for external requests e.g. fetching server list, updating, removing or adding a server.


// Node Services
const express = require("express")
const Discord = require("discord.js")
const xmlrequest = require('xmlhttprequest').XMLHttpRequest
const app = express()

// Vars
var client = new Discord.Client()
var servers = []
var placeId = 7118762676
var groupId = 5562794

app.use(express.json())

var toHHMMSS = (secs) => {
  var sec_num = parseInt(secs, 10)
  var hours = Math.floor(sec_num / 3600)
  var minutes = Math.floor(sec_num / 60) % 60
  var seconds = sec_num % 60

  return [hours, minutes, seconds]
    .map(v => v < 10 ? "0" + v : v)
    .filter((v, i) => v !== "00" || i > 0)
    .join(":")
}

function httpGet(url) {
  var req = new xmlrequest();
  var jsonResponse = null;
  req.open("GET", url, false);
  req.onload = function() {
    jsonResponse = JSON.parse(req.responseText);
  };
  req.send(null);
  return jsonResponse;
}

app.post('/addserver', function(request, response) {
  // Add Server
  servers[request.body.Index] = request.body.Data
  response.json(`Server ${request.body.Data.Name} has been added.`)
})

app.get('/servers', function(request, response) {
  // Fetch latest servers
  const formattedResponse = { "servers": servers }
  response.json(formattedResponse)
})

app.post('/updateserver', function(request, response) {
  // Update Server
  servers[request.body.Index] = request.body.Data
  response.json(`Server ${request.body.Data.Name} has been updated.`)
})

app.get('/externaldata', function(req, res, next) {
  var serverResponse = httpGet(`https://games.roblox.com/v1/games/${placeId}/servers/Public?sortOrder=Asc&limit=100`).data
  var groupResponse = httpGet(`https://groups.roblox.com/v1/groups/${groupId}`)
  const externaldata = {
    "group": groupResponse,
    "servers": serverResponse,
    "placeId": placeId,
    "groupId": groupId
  }
  res.json(externaldata)
})

app.post('/removeserver', function(request, response) {
  // Remove Server
  servers[request.body.Index] = null
  response.json(`Server ${request.body.Index} has been removed.`)
})

app.get('/', (request, response) => {
  response.send(':3')
})

// Listen
app.listen(process.env.PORT || 5000)

// Login
client.login("OTM3MDQ0Njc3NDA2ODk2MTc4.YfWA3A.gxWn3mlSEx881hBdwRccg2ew5M8")

// Clean up old servers
for (i = 0; i < servers.length; i += 1) {
  servers[i] = null
}

// Discord
client.on("ready", async () => {
  client.user.setActivity({
    "name": "Groups Reunited",
    "type": "WATCHING"
  })
  setInterval(() => {
    client.user.setActivity({
      "name": "Groups Reunited",
      "type": "WATCHING"
    })
    setTimeout(() => {
      client.user.setActivity({
        "name": "Groups Reunited",
        "type": "WATCHING"
      })
    }, 5 * 1000)
  }, 10 * 1000)
  var serverChannel = client.channels.cache.get("927116532893507634")
  if (serverChannel) {
    await serverChannel.messages.fetch({ limit: 100 }).then(messages => {
      serverChannel.bulkDelete(messages)
    })
    msg = await serverChannel.send("serverList")
    setTimeout(() => {
      setInterval(() => {
        var staffTotalCount = 0
        var patientTotalCount = 0
        var wardTotalCount = 0
        var list = ""
        // do math :3
        for (i = 1; i < servers.length; i += 1) {
          if (servers[i] === null == false) {
            var needNurse = servers[i].NeedNurse
            var addon = ""
            if (needNurse === true) {
              addon = "[!]"
            }
            wardTotalCount += 1
            patientTotalCount += servers[i].Players
            staffTotalCount += servers[i].Nurses
            list = list + `     ${servers[i].Nurses}                      ${servers[i].Players}               ${servers[i].Name} [${toHHMMSS(servers[i].GameTime)}] ${addon}\n`
          }
        }
        // edit msg :3
        msg.edit("```\n  Staff (" + staffTotalCount + ")            Patients (" + patientTotalCount + ")             Wards (" + wardTotalCount + ")           \n-------------        ---------------       -------------------\n" + list + "```")
      }, 10 * 1000)
    }, 1 * 1000)
  }
})