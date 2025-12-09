"use client";

import { CldUploadWidget } from 'next-cloudinary';
import { Camera, Upload } from 'lucide-react';

interface UploadProps {
  onUpload: (url: string) => void;
}

export default function UploadButton({ onUpload }: UploadProps) {
  return (
    <CldUploadWidget 
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET}
      onSuccess={(result: any) => {
        // Cloudinary returns the secure_url
        onUpload(result.info.secure_url);
      }}
    >
      {({ open }) => {
        return (
          <button 
            type="button" // Important: prevents form submission
            onClick={() => open()}
            className="flex flex-col items-center justify-center w-32 h-32 bg-gray-100 rounded-full border-2 border-dashed border-gray-300 hover:bg-gray-200 transition"
          >
            <Camera className="text-gray-500 mb-1" />
            <span className="text-xs text-gray-500 font-bold">Upload Photo</span>
          </button>
        );
      }}
    </CldUploadWidget>
  );
}