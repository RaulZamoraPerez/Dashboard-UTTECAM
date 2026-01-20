import React from "react";

type Props = {
  src: string | null | undefined;
  alt?: string;
  placeholderText?: string;
};

const ImagePreview: React.FC<Props> = ({ src, alt, placeholderText = "Aquí se visualizará tu imagen" }) => {
  return (
    <div className="w-full h-48 md:h-40 lg:h-32 flex items-center justify-center bg-gray-100">
      {src ? (
        <img src={src} alt={alt} className="object-cover w-full h-full" />
      ) : (
        <div className="text-center text-gray-400 px-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 5a1 1 0 112 0 1 1 0 01-2 0zm5-1l-3 4-2-3-3 4v1h10v-6z" clipRule="evenodd" />
          </svg>
          <p className="mt-2 text-sm">{placeholderText}</p>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
