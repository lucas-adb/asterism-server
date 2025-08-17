import { app } from './app';

app
  .listen({
    host: '0.0.0.0', // to listen on all IPv4 addresses, not only localhost
    port: 3333,
  })
  // biome-ignore lint/suspicious/noConsole: <initializing app>
  .then(() => console.log('Its Alive ⚡'));
