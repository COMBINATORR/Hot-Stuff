import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function TrustCard({ icon, hoverIcon, title, desc }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex gap-4 items-start text-left group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-none mt-0.5 h-6 w-6 flex items-center justify-center overflow-hidden">
        <motion.span
          key={isHovered ? hoverIcon : icon}
          initial={{ opacity: 0, scale: 0.7, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.25, ease: "backOut" }}
          className="material-symbols-outlined text-[24px] text-[#f2ca50] block"
        >
          {isHovered ? hoverIcon : icon}
        </motion.span>
      </div>
      <div className="flex flex-col">
        <h3 className="font-sans font-bold text-[11px] tracking-wider text-white uppercase mb-1 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

export default function TrustSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-black py-12 px-6">
      <div className="container-hs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: 'inventory_2',
              hoverIcon: 'lock',
              title: t('home.features.anon_title'),
              desc: t('home.features.anon_desc')
            },
            {
              icon: 'local_shipping',
              hoverIcon: 'rocket_launch',
              title: t('home.features.free_title'),
              desc: t('home.features.free_desc')
            },
            {
              icon: 'health_and_safety',
              hoverIcon: 'favorite',
              title: t('home.features.safe_title'),
              desc: t('home.features.safe_desc')
            },
            {
              icon: 'verified',
              hoverIcon: 'workspace_premium',
              title: t('home.features.warranty_title'),
              desc: t('home.features.warranty_desc')
            }
          ].map((item, idx) => (
            <TrustCard
              key={idx}
              icon={item.icon}
              hoverIcon={item.hoverIcon}
              title={item.title}
              desc={item.desc}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
