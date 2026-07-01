import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

export default function BrandQuote() {
  const { t } = useTranslation();

  return (
    <section className="relative py-section-gap overflow-hidden">
      <div className="absolute inset-0 bg-black" />
      <div
        className="absolute top-0 right-0 w-[400px] h-[400px] opacity-[0.03]"
        style={{ background: 'radial-gradient(circle, #f2ca50, transparent 70%)' }}
      />
      <motion.div
        className="container-hs relative z-10 max-w-3xl mx-auto text-center"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
      >
        <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="label-caps text-primary mb-8">
          {t('home.quote_title', 'PHILOSOPHY')}
        </motion.p>
        <motion.blockquote
          variants={fadeUp} transition={{ duration: 0.6, delay: 0.1 }}
          className="text-headline-lg md:text-headline-lg text-headline-lg-mobile text-on-surface italic"
        >
          {t('home.quote')}
        </motion.blockquote>
        <motion.div variants={fadeUp} transition={{ duration: 0.4, delay: 0.2 }}>
          <div className="underline-gold mx-auto mt-6" />
        </motion.div>
      </motion.div>
    </section>
  );
}
