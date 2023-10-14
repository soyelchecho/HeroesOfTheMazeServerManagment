const Websocket = require('ws');
const { spawn } = require('child_process');
const AWS = require('aws-sdk');

const wss = new Websocket.Server({ port : 4000});
const metadata = new AWS.MetadataService();

global.hostIpAddress = null;

// Definir una función asincrónica que obtiene la dirección IP
async function fetchHostIpAddress() {
  try {
    const token = await metadata.fetchMetadataToken();
    const data = await metadata.request("/latest/meta-data/public-ipv4", {
      headers: { "x-aws-ec2-metadata-token": token },
    });
    global.hostIpAddress = data;
    console.log("The host IP address is: " + global.hostIpAddress);
  } catch (err) {
    throw err;
  }
}



// Llamar a la función asincrónica
fetchHostIpAddress().then(() => {
    // Una vez que global.hostIpAddress se haya asignado, declara DedicatedServer
    let DedicatedServer = {
      host: global.hostIpAddress,
      port: '7777',
      status: 'running',
      playerCount: 0
    };
  
    // Ahora puedes usar DedicatedServer
    console.log(DedicatedServer);
});

/*const MIN_PORT_AVAILABILITY = 7777;
const MAX_PORT_AVAILABILITY = 8000;

wss.on('connection', (ws) => {
    if(DedicatedServer.playerCount >= 2){
        DedicatedServer.status = 'full';
    }
    else
    {
        DedicatedServer.playerCount++;
    }

    if(DedicatedServer.status == 'full'){
        DedicatedServer.port = Math.floor(Math.random() * (MAX_PORT_AVAILABILITY - MIN_PORT_AVAILABILITY + 1)) + MIN_PORT_AVAILABILITY;
        DedicatedServer.status = 'running';
        DedicatedServer.playerCount = 0;
        StartDedicatedServer();
    }
    ws.send(JSON.stringify(DedicatedServer));
});

function StartDedicatedServer(){
    const serverstartcommand = ""
}*/