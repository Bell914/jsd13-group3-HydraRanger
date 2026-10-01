import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useLookbookStore } from '../../store/lookbookStore.js';
import { normalizeImageUrl } from '../../utils/imageUtils.js';
import { EmptyState } from './EmptyState.jsx';

export const LookbooksSection = () => {
  const favoriteLookbooks = useLookbookStore((state) => state.favorites);
  const removeFavoriteLookbook = useLookbookStore((state) => state.removeFavorite);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Favorite Lookbooks</h2>
      {favoriteLookbooks.length === 0 ? (
        <EmptyState
          title="ยังไม่มี Lookbook ที่บันทึกไว้"
          description="กดหัวใจที่ลุคที่คุณชอบเพื่อบันทึกไว้ดูภายหลัง"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favoriteLookbooks.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-xl border border-gray-200 bg-white p-3"
            >
              <Link to={`/lookbook/${item.id}`} className="shrink-0">
                <img
                  src={normalizeImageUrl(item.image)}
                  alt={item.nameTh || item.name}
                  className="h-24 w-20 rounded-lg object-cover"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  to={`/lookbook/${item.id}`}
                  className="line-clamp-1 block text-sm font-bold text-primary hover:text-accent transition"
                >
                  {item.nameTh || item.name}
                </Link>
                <p className="text-xs text-secondary">{item.name}</p>
                {item.concept && (
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                    {item.concept}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-sm font-extrabold text-primary">
                    ฿{(item.setPrice || 0).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFavoriteLookbook(item.id)}
                    className="rounded-full p-2 text-red-500 hover:bg-red-50 transition cursor-pointer"
                    title="ลบออกจากลุคโปรด"
                    aria-label="ลบออกจากลุคโปรด"
                  >
                    <Heart size={18} fill="currentColor" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};