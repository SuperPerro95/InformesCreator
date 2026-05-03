const _listeners = {};

export function on(event, fn) {
  (_listeners[event] || (_listeners[event] = [])).push(fn);
}

export function off(event, fn) {
  const arr = _listeners[event];
  if (!arr) return;
  const idx = arr.indexOf(fn);
  if (idx >= 0) arr.splice(idx, 1);
}

export function emit(event, data) {
  const arr = _listeners[event];
  if (!arr) return;
  for (let i = 0; i < arr.length; i++) arr[i](data);
}
