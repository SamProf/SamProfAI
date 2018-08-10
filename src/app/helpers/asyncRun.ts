export function asyncRun(asyncFn: () => Promise<void>): void {
  asyncFn().then(() => {
  });
}
