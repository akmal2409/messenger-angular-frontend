export class ClientError extends Error {
  constructor(
    message: string,
    public description: string,
    public cause: Error | undefined,
    public code: string
  ) {
    super(message);
  }
}
