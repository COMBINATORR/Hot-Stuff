import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../ResponsiveImage';
import logoInaThrustPromo from '../../assets/images/ina_thrust_promo.png';

export default function PromoBanner() {
  const { t } = useTranslation();

  return (
    <section className="relative w-full aspect-[21/9] min-h-[350px] md:min-h-[500px] flex items-center overflow-hidden">
      <ResponsiveImage
        src={logoInaThrustPromo}
        alt="INA™ Thrust"
        className="absolute inset-0 w-full h-full object-cover opacity-80"
        loading="lazy"
      />
      {/* Gradients to match screenshot */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      <div className="relative z-10 w-full container-hs flex flex-col items-start px-6 md:px-12 lg:px-16 text-left">
        <h2 className="text-white text-[28px] sm:text-[40px] md:text-[48px] lg:text-[56px] font-black leading-tight mb-2 max-w-lg font-sans">
          {t('home.promo_title')}
        </h2>
        <p className="text-white text-[11px] sm:text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-8">
          INA™ Thrust
        </p>
        <Link
          to="/product/1"
          className="bg-white text-black font-sans font-bold text-[11px] sm:text-[12px] tracking-[0.2em] py-4 px-10 uppercase transition-all hover:bg-gray-200 inline-block"
        >
          {t('home.promo_btn')}
        </Link>
      </div>
    </section>
  );
}
