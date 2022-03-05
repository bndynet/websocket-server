import { exec } from 'child_process';
import minimist from 'minimist';
import { WebSocketServer } from 'ws';
import { cmds } from './cmds.js';
import { trimHelpText } from './utils.js';

const ws = new WebSocketServer({
  port: '10000',
  verifyClient: (_info, done) => {
    done(true);
  },
});

ws.on('connection', (connection, req) => {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0].trim() || // if the server runs behind a proxy like NGINX
    req.socket.remoteAddress;

  connection.on('ping', () => {
    connection.send(`Received your ping at IP:${ip}.`);
  });

  // The client websocket sends message to this event.
  connection.on('message', (incomingMessage) => {
    // the message is a buffer.
    let input = incomingMessage.toString();

    let cmdText = '';
    let cmdArgs = {};

    if (input.startsWith('{') && input.endsWith('}')) {
      // incoming message is a json object, for example: {cmd: 'hi'}
      const inputJson = JSON.parse(input);
      cmdText = inputJson.cmd;
      cmdArgs = inputJson;
    } else {
      if (input.startsWith('"') && input.endsWith('"')) {
        // incoming message is a text
        input = input.slice(1, -1);
      }

      if (input) {
        cmdText = input.trim().split(' ')[0];
        const argv = [];
        const p = /[^"']+?[\s|"']|".+?"|'.+?'/g;
        const matched = input.trim().replace(cmdText, '').match(p);
        if (matched && matched.length > 0) {
          matched.forEach((item) => {
            if (item && item.trim()) {
              item = item.trim();
              if (
                (item.startsWith('"') && item.endsWith('"')) ||
                (item.startsWith("'") && item.endsWith("'"))
              ) {
                item = item.slice(1, -1);
              }
              if (item) {
                argv.push(item);
              }
            }
          });
        }
        cmdArgs = minimist(argv);
      }
    }

    const cmdHandler = cmds.find((cmd) => cmd.text.toLowerCase() === cmdText.toLowerCase());

    console.log(`================== ${cmdText} ================`);
    console.log(cmdArgs);

    if (cmdHandler) {
      if ((cmdArgs._ && cmdArgs._.includes('help')) || (Object.keys(cmdArgs).includes('help') && cmdArgs.help) || cmdText === 'help') {
        const helpMsg = trimHelpText(cmdHandler.help);
        connection.send(helpMsg);
      } else {
        // Run your command
        if (cmdHandler.isBroadcast) {
          ws.clients.forEach(client => {
            client.send(cmdHandler.handler(cmdText, cmdArgs));
          })
        } else {
          connection.send(cmdHandler.handler(cmdText, cmdArgs));
        }
      }
    } else {
      exec(cmdText, (error, stdout, stderr) => {
        if (error) {
          connection.send(error.message);
          return;
        }
      
        if (stderr) {
          connection.send(stderr);
          return;
        }
      
        const output = stdout;
        connection.send(output);
      });
    }
  });

  connection.send(`Hi ${ip}.`);
});
