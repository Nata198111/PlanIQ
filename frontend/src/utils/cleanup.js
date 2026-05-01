let cleanups = [];

export function registerCleanup(fn) {
  cleanups.push(fn);
}

export function runCleanups() {
  cleanups.forEach(fn => {
    try { fn(); } catch (e) { /* silent */ }
  });
  cleanups = [];
}
