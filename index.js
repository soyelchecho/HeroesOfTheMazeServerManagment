const Websocket = require('ws');
const { spawn } = require('child_process');
const AWS = require('aws-sdk');
const util = require('util');


const wss = new Websocket.Server({ port : 4000});
const metadata = new AWS.MetadataService();

const fetchMetadataTokenPromisified = util.promisify(metadata.fetchMetadataToken);
const requestPromisified = util.promisify(metadata.request);


global.hostIpAddress = null;

async function getHostIpAddress() {
    try {
        const token = await fetchMetadataTokenPromisified();
        const data = await requestPromisified("/latest/meta-data/public-ipv4", {headers: { "x-aws-ec2-metadata-token": token },});
        return data;
    } catch (err) {
        throw err;
    }
}


function initApp() {
    // Configuración de variables de entorno, conexión a bases de datos, etc.
    console.log("Inicializando la aplicación...");
    getHostIpAddress()
    .then((hostIpAddress) => {
        global.hostIpAddress = hostIpAddress;
        console.log("The host IP address is: " + global.hostIpAddress);
        let DedicatedServer = {
            host: global.hostIpAddress,
            port: '7777',
            status: 'running',
            playerCount: 0
        }
        console.log(DedicatedServer);
    })
    .catch((err) => {
        console.error("Error:", err);
    });
}


// Llamar a la función de inicialización cuando se inicia la aplicación
initApp();

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