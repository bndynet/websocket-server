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
    req.headers['x-forwarded-for']?.split(',')[0].trim()   // if the server runs behind a proxy like NGINX
    || req.socket.remoteAddress;

  connection.on('ping', () => {
    connection.send(`Recevied your ping at IP:${ip}.`);
  });

  // The client needs to use emit('message', ...) to get this repsonse.
  connection.on('message', (incommingMessage) => {
    const input = incommingMessage.toString();
    if (input) {
      const args = input.split(' ').filter(v => !!v);
      const cmdText = args[0];
      const cmdObject = cmds.find(cmd => cmd.text === cmdText);
      const cmdOption = (args.length > 1 ? args[1] : '').replace('--', '');

      console.log(cmdObject);
      if (cmdObject) {
        if (cmdOption.startsWith('help') || cmdText === 'help') {
          const helpMsg = trimHelpText(cmdObject.help);
          console.log(helpMsg);
          connection.send(helpMsg);
        } else {
          // Run your command
          connection.send(cmdObject.handler(cmdText, cmdOption));
        }
      } else {
        connection.send(`Unknows command ${incommingMessage} requested from ${ip}`);
      }
    }
  });

  connection.send(`Hi ${ip}.`);
});