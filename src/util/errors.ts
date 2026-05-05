export class CliError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CliError';
  }
}

export class HTTPError extends Error {
  readonly status: number;
  readonly statusText: string;

  constructor(status: number, statusText: string) {
    super(`HTTPError: ${status} ${statusText}`);
    this.name = 'HTTPError';
    this.status = status;
    this.statusText = statusText;
  }
}
