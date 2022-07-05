export class ScrollContent<T> {
  constructor(
    public pagingState: string,
    public content: Array<T>
  ) { }
}
