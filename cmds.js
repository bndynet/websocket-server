export const cmds = [
    {
        text: "help",
        help: `
    hi    - Just say hello
    pwd   - Print your current path
  `,
        handler: (cmd, options) => {
            return ``;
        },
    },
    {
        text: "hi",
        help: `Just type hi without --help.`,
        handler: (cmd, options) => {
            return `Hello, I am server. Who are you?`;
        },
    },
    {
      text: 'pwd',
      help: `Show current path of server side`,
      handler: (cmd, options) => {
        return process.cwd();
      },
    },
];
