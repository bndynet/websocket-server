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
    connection.send(`Recevied your ping at IP:${ip}.`);
  });

  // The client websocket sends message to this event.
  connection.on('message', (incommingMessage) => {
    const input = incommingMessage.toString();
    if (input) {
      const arrs = input
        .trim()
        .split(' ')
        .filter((v) => !!v);
      const argv = [];
      const cmdText = input.trim().split(' ')[0];
      const p = /[^"']+?[\s|"']|".+?"|'.+?'/g;
      const t = input.trim().replace(cmdText, '').match(p);
      t.forEach((item) => {
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

      const cmdArgs = minimist(argv);
      const cmdHandler = cmds.find((cmd) => cmd.text === cmdText);

      console.log('=================');
      console.log(cmdText);
      console.log(cmdArgs);

      if (cmdHandler) {
        if (cmdArgs._.includes('help') || cmdText === 'help') {
          const helpMsg = trimHelpText(cmdHandler.help);
          console.log(helpMsg);
          connection.send(helpMsg);
        } else {
          // Run your command
          connection.send(cmdHandler.handler(cmdText, cmdArgs));
        }
      } else {
        connection.send(
          `Unknows command ${incommingMessage} requested from ${ip}`
        );
      }
    }
  });

  connection.send(`Hi ${ip}.`);
});
