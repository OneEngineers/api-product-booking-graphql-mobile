import express from 'express';
import cors from 'cors';
import { json } from 'express';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import {
  ApolloServerPluginLandingPageLocalDefault,
} from '@apollo/server/plugin/landingPage/default';

import { createPrometheusExporterPlugin } from '@bmatei/apollo-prometheus-exporter';
import { Tags } from 'opentracing';
import { buildSchema } from 'type-graphql';

import Resolvers from './graphql/resolvers';
import { connectAmqp, connectDB } from './configs';
import { dbStatus, rabbitMqStatus } from './configs';
import {
  ENV,
  GRAPHQL_ERROR_CODE,
  RESPONSE_CODE,
  RESPONSE_STATUS,
} from './constants';
import { buildAppHeaderContext } from './graphql/plugins/buildAppHeaderContext';
import tracingPlugin from './graphql/plugins/tracingPlugin';

const startServer = async () => {
  const app = express();

  app.use(cors());
  app.use(json());

  // Prometheus
  const prometheusExporterPlugin = createPrometheusExporterPlugin({ app });

  // Connections
  await connectDB();
  await connectAmqp();

  // Health check
  app.get('/status', async (_, res) => {
    try {
      const mongooseStatus = dbStatus();
      const amqpConnectionStatus = await rabbitMqStatus();

      return res.status(200).json({
        status:
          mongooseStatus === 'ok' && amqpConnectionStatus === 'ok'
            ? 'healthy'
            : 'unhealthy',
        connection: {
          database: mongooseStatus,
          rabbitmq: amqpConnectionStatus,
        },
      });
    } catch {
      return res.status(500).json({ status: 'unhealthy', connection: {} });
    }
  });


  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: Resolvers as any,
      validate: true,
    }),
    plugins: [
      prometheusExporterPlugin as unknown,
      ApolloServerPluginLandingPageLocalDefault({
        embed: true
      }),
      {
        requestDidStart: tracingPlugin.requestDidStart
      }
    ],
    introspection: true,
    formatError: (error) => {
      if (global.span) {
        global.span.setTag(Tags.ERROR, true);
        global.span.log({
          code: error.extensions?.code,
          message: error.message,
        });
      }

      const code: any = error.extensions?.code;
      const knownError = Object.keys(GRAPHQL_ERROR_CODE).includes(code);

      return {
        code: knownError
          ? GRAPHQL_ERROR_CODE[code]
          : RESPONSE_CODE.INTERNAL_SERVER_ERROR,
        status: RESPONSE_STATUS.FAILED,
        message: error.message,
      };
    },
  });

  await server.start();

  app.use(
    '/graphql',
    cors(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => buildAppHeaderContext({ req }),
    })
  );

  const port = ENV.APP_PORT;
  app.listen(port, () => {
    console.log(`🚀 GraphQL Server ready at http://localhost:${port}/graphql`);
  });
};

startServer();
