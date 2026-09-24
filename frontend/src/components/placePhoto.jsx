import React, { useEffect, useState } from 'react';
import { api } from '../services/apiClient';

/**
 * Loads a Places photo through the backend proxy. <img src> can't send the
 * auth header, so the image is fetched as a blob and shown via an object URL.
 * Renders `fallback` while loading and when the reference has expired.
 */
export default function PlacePhoto({ photoRef, width = 400, fallback = null, ...imgProps }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!photoRef) return;
    const controller = new AbortController();
    let objectUrl;

    api.get(`/api/places/photo/${encodeURIComponent(photoRef)}`, {
      params: { w: width },
      responseType: 'blob',
      signal: controller.signal
    })
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data);
        setSrc(objectUrl);
      })
      .catch(() => setSrc(null));

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photoRef, width]);

  if (!src) return fallback;
  return <img src={src} {...imgProps} />;
}
