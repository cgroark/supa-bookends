fetch('/assets/env.json')
  .then(response => response.json())
  .then(env => {
    console.warn('FETCHED', env)
    window.__env = env;
  })
  .catch(() => {
    console.warn('Could not load environment variables.');
  });