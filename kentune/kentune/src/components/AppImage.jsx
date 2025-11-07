import React from 'react';

function Image({
  src,
  alt = "Image Name",
  className = "",
  ...props
}) {

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        // Prevent infinite loop if fallback also fails
        if (!e.target.dataset.fallback) {
          e.target.src = "/assets/images/no_image.png";
          e.target.dataset.fallback = "true";
        }
      }}
      {...props}
    />
  );
}

export default Image;
