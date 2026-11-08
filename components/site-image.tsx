'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

/** External editorial photographs load in the browser to avoid server CDN timeouts. */
export default function SiteImage({ src, alt, onError, unoptimized, ...props }: ImageProps) {
  const [failedSource, setFailedSource] = useState<ImageProps['src'] | null>(null);
  const failed = failedSource === src;
  const externalPhoto = typeof src === 'string' && (/^https:\/\/(images\.unsplash\.com|(?:thumb|upload)\.wikimedia\.org)\//.test(src));

  return (
    <Image
      {...props}
      src={failed ? '/assets/image-placeholder.svg' : src}
      alt={failed ? '' : alt}
      unoptimized={unoptimized ?? externalPhoto}
      onError={event => {
        if (!failed) setFailedSource(src);
        onError?.(event);
      }}
    />
  );
}
