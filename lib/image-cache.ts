// Keep a few image promises per mounted result. Concurrent copy/download requests
// share work; failed renders are evicted so the next click can retry.
export function createImageCache(limit = 3) {
  const images = new Map<string, Promise<Blob>>();
  return (key: string, render: () => Promise<Blob>): Promise<Blob> => {
    const hit = images.get(key);
    if (hit) { images.delete(key); images.set(key, hit); return hit; }
    const pending = Promise.resolve().then(render).catch(error => {
      if (images.get(key) === pending) images.delete(key);
      throw error;
    });
    images.set(key, pending);
    if (images.size > limit) images.delete(images.keys().next().value!);
    return pending;
  };
}
