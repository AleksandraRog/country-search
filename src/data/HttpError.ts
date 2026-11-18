export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly name: string = 'HttpError',
  ) {
    super(`HTTP Error: ${status}`);
  }
}
