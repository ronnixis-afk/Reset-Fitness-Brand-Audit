import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X } from 'lucide-react';

export function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel
}: {
  imageSrc: string;
  onCropComplete: (croppedBase64: string) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: { x: number; y: number }) => setCrop(crop);
  const onZoomChange = (zoom: number) => setZoom(zoom);
  const onCropCompleteCallback = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      const canvas = document.createElement('canvas');
      const image = new Image();
      image.src = imageSrc;
      await new Promise(resolve => { image.onload = resolve; });

      canvas.width = 500;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        500,
        500
      );

      // Compress to JPEG with 0.7 quality to save space
      const base64Image = canvas.toDataURL('image/jpeg', 0.7);
      onCropComplete(base64Image);
    } catch (e) {
      console.error('Error cropping image:', e);
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[60] flex flex-col font-sans">
      <div className="flex justify-between items-center p-4 text-white">
        <h3 className="font-heading font-bold text-lg">Crop Image</h3>
        <button onClick={onCancel} className="p-2 hover:bg-white/20 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteCallback}
          onZoomChange={onZoomChange}
        />
      </div>
      <div className="p-6 bg-black flex justify-center gap-4 pb-12">
        <button onClick={onCancel} className="px-6 py-3 rounded-xl font-bold text-white bg-gray-800 active:scale-95 transition-transform">
          Cancel
        </button>
        <button onClick={handleSave} className="px-6 py-3 rounded-xl font-bold text-white bg-brand active:scale-95 transition-transform">
          Save Image
        </button>
      </div>
    </div>
  );
}
