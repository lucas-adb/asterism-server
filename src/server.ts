import { app } from './app';
import { env } from './env';

app
  .listen({
    host: '0.0.0.0', // to listen on all IPv4 addresses, not only localhost
    port: env.PORT,
  })
  // biome-ignore lint/suspicious/noConsole: <initializing app>
  .then(() => console.log('Its Alive ⚡'));
