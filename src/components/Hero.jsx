import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import heroBg from '../assets/images/hero-bg.png?as=url&format=png';
import heroVideo from '../assets/hero-bg.webm';
import heroPoster from '../assets/hero-poster.webp?as=url&format=webp';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

export default function Hero() {
  const { t } = useTranslation();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  return (
    <section className="relative z-0 h-screen flex items-center justify-center overflow-hidden">
      {/* Poster image shown behind the video for seamless transition */}
      <img 
        src={heroPoster} 
        alt="Hero Background Poster" 
        className="w-full h-screen object-cover absolute inset-0 -z-20"
      />

      {/* HTML5 Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={heroPoster}
        onPlay={() => setIsVideoLoaded(true)}
        className={`w-full h-screen object-cover absolute inset-0 -z-10 transition-opacity duration-1000 ${
          isVideoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <source src={heroVideo} type="video/webm" />
        {/* Fallback to responsive image if video is not supported */}
        <img src={heroBg} alt="Hero Fallback" className="w-full h-full object-cover" />
      </video>

      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/40 -z-10" />

      {/* Bottom gradient fade for transition to black content */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent z-[1]" />

      <motion.div
        className="relative z-10 text-center flex flex-col items-center px-4"
        initial="hidden" 
        animate="visible" 
        variants={stagger}
      >
        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-[44px] sm:text-[68px] md:text-[86px] lg:text-[100px] font-extralight tracking-[0.3em] text-white uppercase leading-none select-none font-sans mr-[-0.3em]"
        >
          HOT STUFF
        </motion.h1>

        {/* Slogan */}
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="text-[12px] sm:text-[14px] md:text-[16px] tracking-[0.4em] uppercase text-white/80 mt-6 mb-12 select-none mr-[-0.4em]"
        >
          {t('home.magic_sensuality', 'в погоне за наслаждением')}
        </motion.p>

        {/* CTA */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          <Link 
            to="/catalog" 
            className="border border-white hover:bg-white hover:text-black font-sans font-bold text-[11px] tracking-[0.25em] py-4.5 px-12 uppercase transition-all duration-300 active:scale-95 inline-block text-white rounded-none"
          >
            {t('checkout.back_to_catalog', 'в каталог')}
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
