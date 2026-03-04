export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname === '/' ? '/index.html' : url.pathname;
    return env.ASSETS.fetch(new Request(new URL(path, request.url), request));
  }
};
