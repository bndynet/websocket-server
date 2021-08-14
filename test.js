import { WebSocket } from 'ws';

const ws = new WebSocket('ws://localhost:10000/');

setInterval(() => {
  const getBody = () => {
    return JSON.stringify({
      name: 'Bing',
      time: new Date().toLocaleTimeString(),
    });
  };
  const body = getBody();
  const cmd = `hi -b '${body}'`;
  console.log('>>>>>>> ', cmd);
  ws.send(cmd);
}, 2000);


ws.on('message', (data) => {
    console.log('<<<<<<< ', data.toString());
});
