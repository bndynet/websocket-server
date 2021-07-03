export const cmds = [
  {
    text: 'help',
    help: `
    hi    - Just say hello
    pwd   - Print your current path
  `,
    handler: (cmd, args) => {
      return ``;
    },
  },
  {
    text: 'hi',
    help: `Just type hi without --help.`,
    handler: (cmd, args) => {
      return `Hello, I am server. Who are you?`;
    },
  },
  {
    text: 'pwd',
    help: `Show current path of server side`,
    handler: (cmd, args) => {
      return process.cwd();
    },
  },
];
