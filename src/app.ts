import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import cors from 'cors';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { createPrometheusExporterPlugin } from '@bmatei/apollo-prometheus-exporter';
import { Tags } from 'opentracing';
import Resolvers from './graphql/resolvers';
import { connectAmqp, connectDB } from './configs';
import {
  ENV,
  GRAPHQL_ERROR_CODE,
  RESPONSE_CODE,
  RESPONSE_STATUS,
} from './constants';
import { buildSchema } from 'type-graphql';
// import tracingPlugin from './graphql/plugins/tracingPlugin';
import { dbStatus, rabbitMqStatus } from './configs';
import { buildAppHeaderContext } from './graphql/plugins/buildAppHeaderContext';

const startServer = async () => {
  const app = express();
  app.use(express.json());
  app.use(cors());
  const prometheusExporterPlugin = createPrometheusExporterPlugin({
    app,
  });

  // connect to DB
  await connectDB();
  await connectAmqp();

  app.get('/status', async (_, res) => {
    try {
      // mongoose state:
      // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
      const mongooseStatus = dbStatus();
      // rabbitmq
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
    } catch (error) {
      return res.status(500).json({ status: 'unhealthy', connection: {} });
    }
  });

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: Resolvers as any,
      validate: true,
    }),
    plugins: [
      prometheusExporterPlugin as unknown,
      ApolloServerPluginLandingPageLocalDefault({
        embed: ENV.ENABLE_INTROSPECTION as boolean,
      }),
      // {
      //   requestDidStart: tracingPlugin.requestDidStart,
      // },
    ],
    context: buildAppHeaderContext,
    formatError: (error) => {
      if (global.span) {
        global.span.setTag(Tags.ERROR, true);
        global.span.log({
          code: error.extensions.code,
          message: error.message,
        });
      }

      const code: any = error?.extensions?.code || null;
      const knownError = Object.keys(GRAPHQL_ERROR_CODE).includes(code);

      return {
        code: knownError
          ? GRAPHQL_ERROR_CODE[code]
          : RESPONSE_CODE.INTERNAL_SERVER_ERROR,
        status: RESPONSE_STATUS.FAILED,
        message: error.message,
      };
    },

    introspection: true || ENV.ENABLE_INTROSPECTION,
  });

  await apolloServer.start();

  // apollo server middleware
  apolloServer.applyMiddleware({ app, path: '/graphql' });

  const port = ENV.APP_PORT;
  const httpServer = app.listen(port, () => {
    console.log(`GraphQL Server Listening on Port ${port}`);
  });

  return httpServer;
};

startServer();
