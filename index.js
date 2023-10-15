const Websocket = require('ws');
const { spawn } = require('child_process');
const AWS = require('aws-sdk');
const util = require('util');
const path = require('path');

const wss = new Websocket.Server({ port : 4000});
const metadata = new AWS.MetadataService();

const MIN_PORT_AVAILABILITY = 7777;
const MAX_PORT_AVAILABILITY = 8000;

// Ruta relativa al archivo index.js al archivo UTCPlaygroundServer-Arm64.sh
const SERVER_EXECUTE_RELATIVE_PATH = './HeroesOfTheMazeServer/UTCPlaygroundServer-Arm64.sh';


const usedPorts = []; // Lista global de puertos utilizados


function getAvailablePort(){
    while (true) {
        const port = Math.floor(Math.random() * (MAX_PORT_AVAILABILITY - MIN_PORT_AVAILABILITY + 1)) + MIN_PORT_AVAILABILITY;
        
        // Verificar si el puerto está en la lista de puertos utilizados
        if (!usedPorts.includes(port)) {
          usedPorts.push(port); // Agregar el puerto a la lista de puertos utilizados
          return port; // Devolver el puerto si no está en uso
        }
    }
}

global.hostIpAddress = null;

function continueAfterGetIp(){
    let DedicatedServer = {
        host: global.hostIpAddress,
        port: getAvailablePort(),
        status: 'running',
        playerCount: 0
    }
    console.log(DedicatedServer);
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
    StartDedicatedServer();
}

function StartDedicatedServer(){
    // Obtén el path absoluto
    const absolutePathServerExec = path.resolve(__dirname, SERVER_EXECUTE_RELATIVE_PATH);

    console.log('Path absoluto: ', absolutePathServerExec);
}



function initApp() {
    // Configuración de variables de entorno, conexión a bases de datos, etc.
    metadata.fetchMetadataToken(function (err, token) {
        if (err) {
          throw err;
        } else {
            metadata.request("/latest/meta-data/public-ipv4",{headers: { "x-aws-ec2-metadata-token": token },},
            function (err, data) {
                if (err) {
                    console.log("Error: " + err);
                } else {
                    global.hostIpAddress = data;
                    continueAfterGetIp();
                }
            }
          );
        }
    });
}

// Llamar a la función de inicialización cuando se inicia la aplicación
initApp();