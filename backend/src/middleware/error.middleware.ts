import type { ErrorRequestHandler, RequestHandler } from 'express';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const notFound: RequestHandler = (_req, _res, next) => {
  next(new HttpError(404, 'Route nicht gefunden'));
};

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

  console.error('Unerwarteter API-Fehler:', error);
  res.status(500).json({ error: 'Interner Serverfehler' });
};
