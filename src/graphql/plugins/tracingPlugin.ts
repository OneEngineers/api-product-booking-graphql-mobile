import { ENV } from '../../constants';
import pkg, { TracingConfig, TracingOptions } from 'jaeger-client';

const { initTracer } = pkg;

const config: TracingConfig = {
  serviceName: 'SabayOne API',
  sampler: { type: 'const', param: 1 },
  reporter: {
    logSpans: ENV.JAEGER_SPAN_LOGGING,
    collectorEndpoint: ENV.JAEGER_HOST,
  },
};

const options: TracingOptions = {
  logger: {
    info: () => null,
    error: (msg: string) => console.log('ERROR ', msg),
  },
};

const tracer = initTracer(config, options);

const tracingPlugin = {
  async requestDidStart(requestContext) {
    const span = tracer.startSpan(
      `Operation: ${requestContext?.request?.operationName}`
    );
    span.setTag(
      'operationName',
      requestContext?.request?.operationName || 'Unknown'
    );
    requestContext.span = span;
    global.span = span;

    return {
      async willSendResponse() {
        span.finish();
      },
    };
  },
};

export default tracingPlugin;
