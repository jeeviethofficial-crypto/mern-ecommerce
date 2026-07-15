import { Star, StarHalf } from 'lucide-react';

export function Rating({ value, text }: { value: number; text?: string }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((index) => (
        <span key={index}>
          {value >= index ? (
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ) : value >= index - 0.5 ? (
            <StarHalf className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ) : (
            <Star className="w-4 h-4 text-gray-300" />
          )}
        </span>
      ))}
      {text && <span className="ml-2 text-sm text-gray-500 font-medium">{text}</span>}
    </div>
  );
}
