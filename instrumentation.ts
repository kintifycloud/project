import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { LoggerProvider, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { logs } from '@opentelemetry/api-logs';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

console.log('[OTEL] Initializing OpenTelemetry instrumentation...');

// Verify environment variables
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const otlpHeaders = process.env.OTEL_EXPORTER_OTLP_HEADERS;

console.log('[OTEL] OTEL_EXPORTER_OTLP_ENDPOINT:', otlpEndpoint ? 'SET' : 'NOT SET');
console.log('[OTEL] OTEL_EXPORTER_OTLP_HEADERS:', otlpHeaders ? 'SET' : 'NOT SET');

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

if (!otlpEndpoint) {
  console.error('[OTEL] ERROR: OTEL_EXPORTER_OTLP_ENDPOINT is not set');
  throw new Error('OTEL_EXPORTER_OTLP_ENDPOINT is required');
}

const parsedHeaders = parseHeaders(otlpHeaders);
console.log('[OTEL] Parsed headers:', Object.keys(parsedHeaders));

// Construct the correct OTLP logs URL with /v1/logs path
const logsUrl = otlpEndpoint.endsWith('/v1/logs') ? otlpEndpoint : `${otlpEndpoint}/v1/logs`;
console.log('[OTEL] Logs export URL:', logsUrl);

// Initialize the SDK with auto-instrumentations
const sdk = new NodeSDK({
  instrumentations: [getNodeAutoInstrumentations()],
});

// Export register function for Next.js App Router
export async function register() {
  console.log('OTEL started - register() function called');
  
  try {
    // Start the SDK first
    await sdk.start();
    console.log('OTEL started - SDK started successfully');
    
    // Configure OTLP Log Exporter with debug logging
    const logExporter = new OTLPLogExporter({
      url: logsUrl,
      headers: parsedHeaders,
    });
    
    // Add debug logging to the exporter
    const originalExport = logExporter.export;
    logExporter.export = async function(...args: unknown[]) {
      console.log('[OTEL Exporter] Exporting logs...');
      try {
        const result = await originalExport.apply(logExporter, args as never);
        console.log('[OTEL Exporter] Export successful');
        return result;
      } catch (error) {
        console.error('[OTEL Exporter] Export failed:', error);
        throw error;
      }
    } as never;
    
    const originalForceFlush = logExporter.forceFlush;
    logExporter.forceFlush = async function(...args: unknown[]) {
      console.log('[OTEL Exporter] Force flushing logs...');
      try {
        const result = await originalForceFlush.apply(logExporter, args as never);
        console.log('[OTEL Exporter] Force flush successful');
        return result;
      } catch (error) {
        console.error('[OTEL Exporter] Force flush failed:', error);
        throw error;
      }
    } as never;
    
    // Configure Logger Provider with resource attributes
    const loggerProvider = new LoggerProvider();
    
    (loggerProvider as LoggerProvider & { addLogRecordProcessor: (processor: unknown) => void }).addLogRecordProcessor(new SimpleLogRecordProcessor(logExporter));
    
    // Set global logger provider AFTER SDK starts
    logs.setGlobalLoggerProvider(loggerProvider);
    console.log('[OTEL] Global logger provider registered successfully');
    
    // Verify the logger is not a ProxyLogger
    const testLogger = logs.getLogger('kintifycloud');
    console.log('[OTEL] Test logger type:', testLogger.constructor.name);
    console.log('[OTEL] Test logger provider:', (testLogger as { provider?: { constructor: { name: string } } }).provider?.constructor.name);
    
    // Emit a startup log to verify connection
    testLogger.emit({
      severityText: 'INFO',
      body: 'OpenTelemetry instrumentation initialized successfully with real logger provider',
      attributes: {
        'service.name': 'kintifycloud',
        'service.version': '0.1.0',
        'startup.log': 'true',
      },
    });
    console.log('[OTEL] Startup log emitted, force flushing...');
    
    // Force flush to ensure startup log is sent
    await loggerProvider.forceFlush();
    console.log('[OTEL] Startup log flushed successfully');
    
  } catch (error) {
    console.error('OTEL started - Failed to start SDK:', error);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[OTEL] SIGTERM received - shutting down SDK');
  sdk.shutdown().catch(console.error);
});

process.on('SIGINT', () => {
  console.log('[OTEL] SIGINT received - shutting down SDK');
  sdk.shutdown().catch(console.error);
});
