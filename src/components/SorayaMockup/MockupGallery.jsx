import { useTranslation } from 'react-i18next';
import { SorayaWaveSvg } from './MockupAssets';
export function MockupGallery({ selectedImageIndex, setSelectedImageIndex, activeColorHex }) {
  const { t } = useTranslation();
  return (
    <>
      {/* IMAGE GALLERY DISPLAY */}
        <section className="relative bg-white py-8 flex flex-col items-center">
          {/* Arrow navigation wrapper */}
          <div className="w-full flex items-center justify-between px-4">
            <button
              onClick={() => setSelectedImageIndex(prev => (prev - 1 + 4) % 4)}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black"
              aria-label={t('home.quiz.back', 'Назад')}
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="w-56 h-56 flex items-center justify-center">
              <SorayaWaveSvg color={activeColorHex} />
            </div>
            <button
              onClick={() => setSelectedImageIndex(prev => (prev + 1) % 4)}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black"
              aria-label={t('home.quiz.next', 'Вперед')}
            >
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
          {/* 3D Review Floating Button */}
          <button className="absolute bottom-12 right-6 flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-sm hover:border-black transition-all">
            <span className="material-symbols-outlined text-[14px] text-gray-600">3d_rotation</span>
            <span className="font-sans font-bold text-[9px] tracking-wider uppercase text-gray-600">{t('mockup.view_3d', '3D ОБЗОР')}</span>
          </button>
          {/* Gallery Progress/Slider Indicator */}
          <div className="w-[85%] h-[2px] bg-gray-200 mt-6 relative">
            <div
              className="absolute top-0 bottom-0 bg-black transition-all duration-300"
              style={{
                width: '25%',
                left: `${selectedImageIndex * 25}%`
              }}
            />
          </div>
        </section>
    </>
  );
}
