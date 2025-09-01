import { useState } from "react";

interface ImageModalProps {
  src: string;
  alt?: string;
}

export default function ImageModal({ src, alt }: ImageModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Thumbnail */}
      <img
        src={src}
        alt={alt || "preview"}
        className="w-24 h-24 object-cover cursor-pointer rounded"
        onClick={() => setIsOpen(true)}
      />

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative">
            <img
              src={src}
              alt={alt || "large view"}
              className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 bg-white text-black rounded-full px-2 py-1 shadow"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
