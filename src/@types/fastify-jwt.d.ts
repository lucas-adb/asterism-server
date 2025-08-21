import '@fastify/jwt';

declare module '@fastify/jwt' {
  // biome-ignore lint/nursery/useConsistentTypeDefinitions: <it extends the fastify request type>
  export interface FastifyJWT {
    user: {
      sub: string;
    };
  }
}
