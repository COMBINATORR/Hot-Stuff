export default function ResponsiveImage({ 
  src, 
  alt = '', 
  className = '', 
  loading = 'lazy' 
}) {
  // If src is a string (e.g. from an external URL or unoptimized import), fallback to normal img
  if (typeof src === 'string') {
    return <img src={src} alt={alt} className={className} loading={loading} />;
  }

  // If src is a vite-imagetools picture object
  if (src && src.img) {
    return (
      <picture>
        {src.sources && Object.entries(src.sources).map(([format, srcsets]) => {
          let resolvedSrcset = '';
          if (typeof srcsets === 'string') {
            resolvedSrcset = srcsets;
          } else if (Array.isArray(srcsets)) {
            resolvedSrcset = srcsets
              .map(s => (typeof s === 'object' && s !== null ? s.src || s.url : s))
              .filter(Boolean)
              .join(', ');
          }
          
          return (
            <source 
              key={format} 
              type={`image/${format}`} 
              srcSet={resolvedSrcset} 
            />
          );
        })}
        <img 
          src={src.img.src} 
          alt={alt} 
          className={className} 
          loading={loading} 
        />
      </picture>
    );
  }

  // Fallback if data is missing
  return null;
}
