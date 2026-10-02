import type { ErrorRequestHandler, RequestHandler } from 'express';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const notFound: RequestHandler = (_req, _res, next) => {
  next(new HttpError(404, 'Route nicht gefunden'));
};

const connectionCodes = new Set([
  'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'EHOSTUNREACH', 'ENETUNREACH',
  'ENOTFOUND', 'EAI_AGAIN', '57P01', '57P02', '57P03', '53300',
]);

function isDatabaseUnavailable(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const code = 'code' in error && typeof error.code === 'string' ? error.code : '';
  return code.startsWith('08')
    || connectionCodes.has(code)
    || error.message === 'timeout exceeded when trying to connect'
    || error.message === 'Connection terminated due to connection timeout'
    || error.message === 'Connection terminated unexpectedly';
}

export const handleError: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  if (error?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Ungültiger JSON-Text' });
    return;
  }

  if (isDatabaseUnavailable(error)) {
    console.error('Datenbank nicht erreichbar:', error);
    res.status(503).json({ error: 'Datenbank derzeit nicht erreichbar. Bitte später erneut versuchen.' });
    return;
  }

  console.error('Unerwarteter API-Fehler:', error);
  res.status(500).json({ error: 'Interner Serverfehler' });
};
