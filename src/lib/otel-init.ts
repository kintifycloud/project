import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { logs } from '@opentelemetry/api-logs';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

console.log('[OTEL INIT] Initializing OpenTelemetry SDK...');

// Verify environment variables
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const otlpHeaders = process.env.OTEL_EXPORTER_OTLP_HEADERS;

if (!otlpEndpoint) {
  console.error('[OTEL INIT] ERROR: OTEL_EXPORTER_OTLP_ENDPOINT is not set');
  throw new Error('OTEL_EXPORTER_OTLP_ENDPOINT is required');
}

// Helper function to parse headers from environment variable
function parseHeaders(headersString?: string): Record<string, string> {
  if (!headersString) return {};
  
  const headers: Record<string, string> = {};
  const parts = headersString.split('&');
  
  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key && value) {
      headers[key] = decodeURIComponent(value);
    }
  }
  
  return headers;
}

const parsedHeaders = parseHeaders(otlpHeaders);
console.log('[OTEL INIT] Parsed headers:', Object.keys(parsedHeaders));
console.log('[OTEL INIT] Authorization header value (truncated):', parsedHeaders.Authorization?.substring(0, 20) + '...');

// Construct the correct OTLP logs URL with /v1/logs path
const logsUrl = otlpEndpoint.endsWith('/v1/logs') ? otlpEndpoint : `${otlpEndpoint}/v1/logs`;
console.log('[OTEL INIT] Logs export URL:', logsUrl);

type ExporterWithSend = OTLPLogExporter & {
  _send?: (request: unknown) => Promise<unknown>;
};

type LoggerProviderDebugState = {
  registeredLogRecordProcessors?: unknown[];
  activeProcessor?: {
    constructor?: {
      name?: string;
    };
  };
};

type LoggerProviderDebug = {
  forceFlush: () => Promise<void>;
  _sharedState?: LoggerProviderDebugState;
};

// Configure OTLP Log Exporter with detailed HTTP debug logging
const logExporter = new OTLPLogExporter({
  url: logsUrl,
  headers: parsedHeaders,
});

// Wrap the export method with detailed HTTP logging
const originalSend = (logExporter as ExporterWithSend)._send;
if (originalSend) {
  (logExporter as ExporterWithSend)._send = async function(request: unknown) {
    console.log('[OTEL HTTP] Sending OTLP request to:', logsUrl);
    console.log('[OTEL HTTP] Request headers:', parsedHeaders);
    try {
      const response = await originalSend.call(logExporter, request);
      console.log('[OTEL HTTP] Response received:', response);
      return response;
    } catch (error) {
      console.error('[OTEL HTTP] Request failed:', error);
      throw error;
    }
  };
}

const processor = new SimpleLogRecordProcessor(logExporter);

// Set environment variables for SDK auto-configuration
process.env.OTEL_EXPORTER_OTLP_ENDPOINT = logsUrl;
process.env.OTEL_EXPORTER_OTLP_HEADERS = otlpHeaders;
process.env.OTEL_SERVICE_NAME = 'kintifycloud';
process.env.OTEL_SERVICE_VERSION = '0.1.0';

// Initialize the SDK with the exact 0.214.0 log processor API
const sdk = new NodeSDK({
  instrumentations: [getNodeAutoInstrumentations()],
  logRecordProcessors: [processor],
});

// Start the SDK
await sdk.start();
console.log('[OTEL INIT] OTEL SDK started successfully');

const sdkLoggerProvider = (sdk as unknown as { _loggerProvider?: LoggerProviderDebug })._loggerProvider;

if (!sdkLoggerProvider) {
  throw new Error('OTEL logger provider was not created by NodeSDK');
}

logs.setGlobalLoggerProvider(
  sdkLoggerProvider as unknown as Parameters<typeof logs.setGlobalLoggerProvider>[0]
);
console.log('[OTEL INIT] Global logger provider registered');

const providerState = sdkLoggerProvider._sharedState;
const registeredProcessorCount = providerState?.registeredLogRecordProcessors?.length ?? 0;
console.log('[OTEL INIT] Registered processors count:', registeredProcessorCount);
console.log('[OTEL INIT] Logger shared state processor count:', registeredProcessorCount);
console.log('[OTEL INIT] Active processor:', providerState?.activeProcessor?.constructor?.name ?? 'unknown');

// Test log emission with force flush
const testLogger = logs.getLogger('kintifycloud');
console.log('[OTEL INIT] Test logger type:', testLogger.constructor.name);
testLogger.emit({
  severityText: 'INFO',
  body: 'OTEL HTTP transport test - verify Grafana receives this',
  attributes: {
    'service.name': 'kintifycloud',
    'service.version': '0.1.0',
    'test.type': 'http-transport-verification',
  },
});
console.log('[OTEL INIT] Test log emitted, force flushing...');
await sdkLoggerProvider.forceFlush();
console.log('[OTEL INIT] Force flush completed');

// Export for potential use
export { sdk, logExporter };
