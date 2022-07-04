const mockServerResponse = <T>(response: T, timeout = 300): Promise<T> => new Promise((resolve) => {
  setTimeout(() => {
    resolve(response);
  }, timeout);
});

export default mockServerResponse;
