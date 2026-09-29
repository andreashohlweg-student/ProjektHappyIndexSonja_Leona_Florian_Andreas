export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}

export function unfinished(task: string): never {
  throw new HttpError(501, 'NOT_IMPLEMENTED', `${task} ist noch nicht implementiert. Siehe ROADMAP.md.`);
}
