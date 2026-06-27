import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../ResponsiveImage';

import logoQuizBg from '../../assets/images/sex_toy_quiz_bg.png';
import logoNoirDress from '../../assets/images/products/noir_silhouette_dress.png';
import logoEtherealWrap from '../../assets/images/products/ethereal_silk_wrap.png';
import logoGoldBoots from '../../assets/images/products/gold_trimmed_boots.png';

export default function QuizSection() {
  const { t } = useTranslation();

  // Quiz State
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [selectedStimulation, setSelectedStimulation] = useState({ clitoris: false, penis: false });

  // Lock scroll when quiz modal is active
  useEffect(() => {
    if (quizOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [quizOpen]);

  const handleQuizAnswer = (key, value) => {
    setQuizAnswers(prev => ({ ...prev, [key]: value }));
    setQuizStep(prev => prev + 1);
  };

  const submitQuiz = () => {
    setQuizStep(10);
  };

  const getRecommendation = () => {
    const isPen = selectedStimulation.penis;
    const isClit = selectedStimulation.clitoris;

    // 1. Both selected (Clitoris + Penis Contact) or Couples Mode
    if ((isClit && isPen) || quizAnswers.mode === 'couple' || quizAnswers.mode === 'В паре') {
      return {
        id: 2,
        name: 'LELO BOOMERANG™',
        price: 114500,
        image: logoEtherealWrap,
        desc: t('home.quiz.recommendations.boomerang')
      };
    }

    // 2. Penis stimulation or Male Orgasm
    if (isPen || quizAnswers.orgasm === 'male' || quizAnswers.orgasm === 'Мужской') {
      return {
        id: 7,
        name: 'HUGO™ 2 REMOTE',
        price: 166440,
        image: logoGoldBoots,
        desc: t('home.quiz.recommendations.hugo')
      };
    }

    // 3. Clitoral / Female Orgasm
    if (isClit || quizAnswers.orgasm === 'female' || quizAnswers.orgasm === 'Женский') {
      // Premium budget / expert experience
      if (quizAnswers.budget === 'high' || quizAnswers.budget === 'Деньги — не проблема' || quizAnswers.experience === 'pro' || quizAnswers.experience === 'Сексперт') {
        return {
          id: 8,
          name: 'SORAYA WAVE™',
          price: 124500,
          image: logoNoirDress,
          desc: t('home.quiz.recommendations.soraya')
        };
      }

      // Middle budget
      if (quizAnswers.budget === 'mid' || quizAnswers.budget === 'Средний') {
        return {
          id: 4,
          name: 'SONA™ 3 CRUISE',
          price: 71800,
          image: logoNoirDress,
          desc: t('home.quiz.recommendations.sona')
        };
      }

      // Default G-spot choice
      return {
        id: 9,
        name: 'LELO GIGI™ 2',
        price: 89500,
        image: logoGoldBoots,
        desc: t('home.quiz.recommendations.gigi')
      };
    }

    // Fallback: INA™ THRUST
    return {
      id: 1,
      name: 'INA™ THRUST',
      price: 119500,
      image: logoGoldBoots,
      desc: t('home.quiz.recommendations.ina')
    };
  };

  const renderQuizContent = () => {
    // Helper to render "Назад" button
    const renderBackButton = () => {
      if (quizStep > 1 && quizStep < 10) {
        return (
          <button
            onClick={() => setQuizStep(prev => prev - 1)}
            className="mt-6 text-white/50 hover:text-white text-xs tracking-wider uppercase flex items-center gap-1 self-start font-sans"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            {t('home.quiz.back')}
          </button>
        );
      }
      return null;
    };

    // Calculate progress percentage
    const progress = (quizStep / 9) * 100;

    const progressHeader = (title) => (
      <div className="mb-6">
        <div className="w-full bg-white/10 h-1 mb-6 rounded-full overflow-hidden">
          <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <h3 className="text-white text-lg font-bold font-sans text-left uppercase tracking-wider">{title}</h3>
      </div>
    );

    if (quizStep === 1) {
      return (
        <div className="flex flex-col">
          {progressHeader(t('home.quiz.q1'))}
          <div className="grid grid-cols-2 gap-4">
            {['18-24', '25-34', '35-44', '45-54', '55-64', '65+'].map(opt => (
              <button
                key={opt}
                onClick={() => handleQuizAnswer('age', opt)}
                className="bg-surface-container-low hover:bg-surface-container-high border border-white/5 py-4 px-6 text-center text-white text-sm font-sans tracking-wide transition-colors font-bold"
              >
                {opt}
              </button>
            ))}
          </div>
          {renderBackButton()}
        </div>
      );
    }

    if (quizStep === 2) {
      return (
        <div className="flex flex-col">
          {progressHeader(t('home.quiz.q2'))}
          <div className="grid grid-cols-2 gap-4">
            {['hetero', 'gay', 'lesbian', 'bi', 'queer', 'other'].map(opt => (
              <button
                key={opt}
                onClick={() => handleQuizAnswer('identity', opt)}
                className="bg-surface-container-low hover:bg-surface-container-high border border-white/5 py-4 px-6 text-center text-white text-sm font-sans tracking-wide transition-colors font-bold"
              >
                {t('home.quiz.identity.' + opt)}
              </button>
            ))}
          </div>
          {renderBackButton()}
        </div>
      );
    }

    if (quizStep === 3) {
      const expOptions = [
        { key: 'new', label: t('home.quiz.exp_new'), desc: t('home.quiz.exp_new_desc') },
        { key: 'mid', label: t('home.quiz.exp_mid'), desc: t('home.quiz.exp_mid_desc') },
        { key: 'pro', label: t('home.quiz.exp_pro'), desc: t('home.quiz.exp_pro_desc') }
      ];
      return (
        <div className="flex flex-col">
          {progressHeader(t('home.quiz.q3'))}
          <div className="flex flex-col gap-4">
            {expOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => handleQuizAnswer('experience', opt.key)}
                className="bg-surface-container-low hover:bg-surface-container-high border border-white/5 py-4 px-6 text-left text-white transition-colors"
              >
                <div className="font-bold text-sm font-sans mb-1 text-left">{opt.label}</div>
                <div className="text-white/60 text-xs font-sans leading-relaxed text-left">{opt.desc}</div>
              </button>
            ))}
          </div>
          {renderBackButton()}
        </div>
      );
    }

    if (quizStep === 4) {
      return (
        <div className="flex flex-col">
          {progressHeader(t('home.quiz.q4'))}
          <div className="flex flex-col gap-4">
            {['no', 'once', 'fan', 'others'].map(opt => (
              <button
                key={opt}
                onClick={() => handleQuizAnswer('triedBrand', opt)}
                className="bg-surface-container-low hover:bg-surface-container-high border border-white/5 py-4 px-6 text-left text-white text-sm font-sans tracking-wide transition-colors font-bold"
              >
                {t('home.quiz.triedBrand.' + opt)}
              </button>
            ))}
          </div>
          {renderBackButton()}
        </div>
      );
    }

    if (quizStep === 5) {
      return (
        <div className="flex flex-col">
          {progressHeader(t('home.quiz.q5'))}
          <div className="grid grid-cols-2 gap-4">
            {['self', 'gift'].map(opt => (
              <button
                key={opt}
                onClick={() => handleQuizAnswer('purpose', opt)}
                className="bg-surface-container-low hover:bg-surface-container-high border border-white/5 py-4 px-6 text-center text-white text-sm font-sans tracking-wide transition-colors font-bold"
              >
                {t('home.quiz.purpose.' + opt)}
              </button>
            ))}
          </div>
          {renderBackButton()}
        </div>
      );
    }

    if (quizStep === 6) {
      return (
        <div className="flex flex-col">
          {progressHeader(t('home.quiz.q6'))}
          <div className="flex flex-col gap-4">
            {['later', 'mid', 'high'].map(opt => (
              <button
                key={opt}
                onClick={() => handleQuizAnswer('budget', opt)}
                className="bg-surface-container-low hover:bg-surface-container-high border border-white/5 py-4 px-6 text-left text-white text-sm font-sans tracking-wide transition-colors font-bold"
              >
                {t('home.quiz.budget.' + opt)}
              </button>
            ))}
          </div>
          {renderBackButton()}
        </div>
      );
    }

    if (quizStep === 7) {
      return (
        <div className="flex flex-col">
          {progressHeader(t('home.quiz.q7'))}
          <div className="grid grid-cols-2 gap-4">
            {['female', 'male'].map(opt => (
              <button
                key={opt}
                onClick={() => handleQuizAnswer('orgasm', opt)}
                className="bg-surface-container-low hover:bg-surface-container-high border border-white/5 py-4 px-6 text-center text-white text-sm font-sans tracking-wide transition-colors font-bold"
              >
                {t('home.quiz.orgasm.' + opt)}
              </button>
            ))}
          </div>
          {renderBackButton()}
        </div>
      );
    }

    if (quizStep === 8) {
      return (
        <div className="flex flex-col">
          {progressHeader(t('home.quiz.q8'))}
          <div className="grid grid-cols-2 gap-4">
            {['solo', 'couple'].map(opt => (
              <button
                key={opt}
                onClick={() => handleQuizAnswer('mode', opt)}
                className="bg-surface-container-low hover:bg-surface-container-high border border-white/5 py-4 px-6 text-center text-white text-sm font-sans tracking-wide transition-colors font-bold"
              >
                {t('home.quiz.mode.' + opt)}
              </button>
            ))}
          </div>
          {renderBackButton()}
        </div>
      );
    }

    if (quizStep === 9) {
      const isAnySelected = selectedStimulation.clitoris || selectedStimulation.penis;
      return (
        <div className="flex flex-col">
          {progressHeader(t('home.quiz.q9'))}
          <div className="flex flex-col gap-4 mb-6">
            <button
              onClick={() => setSelectedStimulation(prev => ({ ...prev, clitoris: !prev.clitoris }))}
              className={`py-4 px-6 text-left text-white text-sm font-sans tracking-wide transition-colors flex items-center justify-between border ${selectedStimulation.clitoris ? 'bg-surface-container border-primary' : 'bg-surface-container-low hover:bg-surface-container-high border-white/5'}`}
            >
              <span className="font-bold">{t('home.quiz.clitoris')}</span>
              <span className="material-symbols-outlined text-primary">
                {selectedStimulation.clitoris ? 'check_box' : 'check_box_outline_blank'}
              </span>
            </button>
            <button
              onClick={() => setSelectedStimulation(prev => ({ ...prev, penis: !prev.penis }))}
              className={`py-4 px-6 text-left text-white text-sm font-sans tracking-wide transition-colors flex items-center justify-between border ${selectedStimulation.penis ? 'bg-surface-container border-primary' : 'bg-surface-container-low hover:bg-surface-container-high border-white/5'}`}
            >
              <span className="font-bold">{t('home.quiz.penis')}</span>
              <span className="material-symbols-outlined text-primary">
                {selectedStimulation.penis ? 'check_box' : 'check_box_outline_blank'}
              </span>
            </button>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setQuizStep(8)}
              className="text-white/50 hover:text-white text-xs tracking-wider uppercase flex items-center gap-1 font-sans"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              {t('home.quiz.back')}
            </button>
            <button
              disabled={!isAnySelected}
              onClick={submitQuiz}
              className={`font-sans font-bold text-xs tracking-wider py-3 px-8 rounded-full transition-all uppercase ${isAnySelected ? 'bg-white hover:bg-gray-200 text-black cursor-pointer' : 'bg-white/10 text-white/40 cursor-not-allowed'}`}
            >
              {t('home.quiz.submit')}
            </button>
          </div>
        </div>
      );
    }

    if (quizStep === 10) {
      const rec = getRecommendation();
      return (
        <div className="flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-4xl text-primary mb-3">celebration</span>
          <h3 className="text-white text-xl font-bold mb-2 font-sans">{t('home.quiz.success_title')}</h3>
          <p className="text-white/60 text-xs sm:text-sm mb-6">{t('home.quiz.success_subtitle')}</p>

          <div className="w-full bg-surface-container-low border border-white/5 p-6 rounded-card mb-6 flex flex-col items-center">
            <div className="w-32 h-32 mb-4 overflow-hidden rounded-card bg-black/20">
              <ResponsiveImage src={rec.image} alt={rec.name} className="w-full h-full object-cover" />
            </div>
            <h4 className="text-white font-bold text-base mb-1 tracking-wider uppercase font-sans">{rec.name}</h4>
            <p className="text-primary text-sm font-bold mb-3">{rec.price.toLocaleString('ru-KZ')} ₸</p>
            <p className="text-white/70 text-xs leading-relaxed max-w-sm">{rec.desc}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              to={`/product/${rec.id}`}
              onClick={() => setQuizOpen(false)}
              className="flex-1 bg-white hover:bg-gray-200 text-black font-sans font-bold text-xs tracking-wider py-3.5 px-6 rounded-full text-center transition-colors uppercase"
            >
              {t('home.quiz.details')}
            </Link>
            <button
              onClick={() => { setQuizStep(1); setSelectedStimulation({ clitoris: false, penis: false }); setQuizAnswers({}); }}
              className="flex-1 border border-white/20 hover:bg-white/5 text-white font-sans font-bold text-xs tracking-wider py-3.5 px-6 rounded-full text-center transition-colors uppercase"
            >
              {t('home.quiz.reset')}
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      {/* ═══ QUIZ SECTION ══════════════════════════ */}
      <section className="w-full py-16 md:py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Left Block: Symmetrical Image Card with Border */}
          <div className="relative border border-white/10 overflow-hidden flex flex-col justify-end aspect-[4/3] md:aspect-auto min-h-[400px] bg-[#0d0d0d] p-8">
            <div className="absolute inset-0 z-0">
              <ResponsiveImage
                src={logoQuizBg}
                alt={t('home.quiz.title')}
                className="w-full h-full object-cover opacity-60"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
            </div>
            <div className="relative z-10 text-left">
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#31A8FF] font-bold uppercase mb-2 block">
                HOT STUFF EXPERT
              </span>
              <h2 className="text-white text-2xl md:text-3xl font-black uppercase tracking-wider leading-none">
                HOT STUFF QUIZ
              </h2>
            </div>
          </div>

          {/* Right Block: Content Card with matching Border */}
          <div className="border border-white/10 bg-[#0A0A0A] p-8 md:p-12 flex flex-col justify-center items-start text-left">
            <h2 className="text-white text-[28px] md:text-[34px] font-black uppercase tracking-wider mb-4 leading-tight font-sans">
              {t('home.quiz.title')}
            </h2>
            <h3 className="text-white text-base md:text-lg font-bold mb-4 font-sans text-neutral-300">
              {t('home.quiz.subtitle')}
            </h3>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-8 max-w-md">
              {t('home.quiz.desc')}
            </p>
            <button
              onClick={() => { setQuizAnswers({}); setSelectedStimulation({ clitoris: false, penis: false }); setQuizStep(1); setQuizOpen(true); }}
              className="border border-white hover:bg-white hover:text-black text-white font-sans font-bold text-xs sm:text-sm tracking-[0.2em] py-3.5 px-8 rounded-full transition-all bg-transparent cursor-pointer"
            >
              {t('home.quiz.start')}
            </button>
          </div>
        </div>
      </section>

      {/* Quiz Modal Portal */}
      {quizOpen && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[250] flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-[#121212] border border-white/10 w-full max-w-xl p-8 rounded-none relative flex flex-col">
            <button
              onClick={() => setQuizOpen(false)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
            {renderQuizContent()}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
