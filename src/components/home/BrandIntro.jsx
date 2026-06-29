import { useTranslation } from 'react-i18next';

export default function BrandIntro() {
  const { t } = useTranslation();

  return (
    <section className="bg-background py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-base md:text-lg text-white font-medium leading-relaxed max-w-2xl mx-auto font-sans tracking-wide">
          {t('home.magic_desc')}
        </p>
      </div>
    </section>
  );
}
