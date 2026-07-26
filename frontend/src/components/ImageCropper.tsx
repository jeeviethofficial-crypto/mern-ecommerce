import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import getCroppedImg from '../utils/cropImage';

interface ImageCropperProps {
  imageSrc: string;
  onCropSave: (croppedImageBase64: string) => void;
  onCancel: () => void;
  isUploading: boolean;
}

export function ImageCropper({ imageSrc, onCropSave, onCancel, isUploading }: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [crop, setCrop] = useState({ x: 0, y: 0, size: 200 });
  const [imageBounds, setImageBounds] = useState({ width: 300, height: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset crop size based on image size when it loads
  const handleImageLoad = () => {
    if (imageRef.current) {
      const { width, height } = imageRef.current.getBoundingClientRect();
      setImageBounds({ width, height });
      const minSize = Math.min(width, height, 300);
      setCrop({
        x: (width - minSize) / 2,
        y: (height - minSize) / 2,
        size: minSize
      });
    }
  };

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - crop.x, y: clientY - crop.y });
  };

  const onDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !imageRef.current) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    
    let newX = clientX - dragStart.x;
    let newY = clientY - dragStart.y;
    
    const { width, height } = imageRef.current.getBoundingClientRect();
    
    // Constrain to image bounds
    newX = Math.max(0, Math.min(newX, width - crop.size));
    newY = Math.max(0, Math.min(newY, height - crop.size));
    
    setCrop(prev => ({ ...prev, x: newX, y: newY }));
  };

  const stopDrag = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onDrag);
      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('touchmove', onDrag);
      window.addEventListener('touchend', stopDrag);
    } else {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchmove', onDrag);
      window.removeEventListener('touchend', stopDrag);
    }
    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchmove', onDrag);
      window.removeEventListener('touchend', stopDrag);
    };
  }, [isDragging, crop, dragStart]);

  const handleSave = async () => {
    if (!imageRef.current) return;
    
    // Calculate pixels based on original image size vs displayed size
    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = imageRef.current.naturalWidth / rect.width;
    const scaleY = imageRef.current.naturalHeight / rect.height;
    
    const pixelCrop = {
      x: crop.x * scaleX,
      y: crop.y * scaleY,
      width: crop.size * scaleX,
      height: crop.size * scaleY,
    };
    
    try {
      const croppedBase64 = await getCroppedImg(imageSrc, pixelCrop);
      if (croppedBase64) {
        onCropSave(croppedBase64);
      }
    } catch (error) {
      console.error("Failed to crop image", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col h-[600px]">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Crop Profile Photo</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="relative flex-grow bg-gray-900 flex items-center justify-center overflow-hidden p-4" ref={containerRef}>
          <div className="relative inline-flex max-w-full max-h-full select-none items-center justify-center">
            <img 
              ref={imageRef} 
              src={imageSrc} 
              alt="Crop target" 
              className="pointer-events-none"
              style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }}
              onLoad={handleImageLoad}
            />
            
            {/* SVG Mask Overlay */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <mask id="crop-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <circle 
                    cx={crop.x + crop.size / 2} 
                    cy={crop.y + crop.size / 2} 
                    r={crop.size / 2} 
                    fill="black" 
                  />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#crop-mask)" />
            </svg>
            
            {/* Draggable Cropper Box */}
            <div 
              className="absolute border-2 border-white rounded-full cursor-move"
              style={{
                left: `${crop.x}px`,
                top: `${crop.y}px`,
                width: `${crop.size}px`,
                height: `${crop.size}px`,
              }}
              onMouseDown={startDrag}
              onTouchStart={startDrag}
            />
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex flex-col gap-4">
           <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">Size</span>
            <input
              type="range"
              value={crop.size}
              min={50}
              max={Math.min(imageBounds.width, imageBounds.height)}
              step={1}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                if (!imageRef.current) return;
                const { width, height } = imageRef.current.getBoundingClientRect();
                
                // Adjust x/y to keep centered if possible, and constrain
                let newX = crop.x;
                let newY = crop.y;
                
                if (newX + newSize > width) newX = width - newSize;
                if (newY + newSize > height) newY = height - newSize;
                
                setCrop(prev => ({ ...prev, size: newSize, x: newX, y: newY }));
              }}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isUploading ? 'Saving...' : 'Crop & Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
