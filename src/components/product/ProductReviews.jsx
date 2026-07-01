
export default function ProductReviews({
  t,
  i18n,
  reviewsList,
  handleSubmitReview,
  formName,
  setFormName,
  formAge,
  setFormAge,
  formExp,
  setFormExp,
  formSens,
  setFormSens,
  formNoise,
  setFormNoise,
  formStrength,
  setFormStrength,
  formErgo,
  setFormErgo,
  formText,
  setFormText,
  getExperienceTranslation,
  getSensitivityTranslation,
  getReviewTextTranslation
}) {
  return (
    <>
    {/* Review Section */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-low text-left font-sans">
          <div className="max-w-5xl mx-auto flex flex-col gap-16">
            <h2 className="font-sans font-black text-[22px] md:text-[30px] tracking-[0.15em] text-white uppercase text-center">{t('product.reviews_title')}</h2>

            {/* Reviews Summary and Add Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

              {/* Left Column: Ratings Summary & Sub-criteria */}
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="text-left">
                    <p className="text-5xl font-black text-white leading-none">4.9</p>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-2">{t('product.reviews_stars')}</p>
                  </div>
                  <div className="flex flex-col gap-1 text-primary">
                    <div className="flex gap-1 text-lg">★★★★★</div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{t('product.reviews_based', { count: reviewsList.length })}</p>
                  </div>
                </div>

                {/* Sub-criteria progress bars */}
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <h3 className="text-[10px] font-black tracking-widest text-white uppercase">{t('product.reviews_breakdown')}</h3>

                  {/* Noise Level */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                      <span className="uppercase tracking-wider">{t('product.noise_level')}</span>
                      <span className="text-white">9.2 / 10</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '92%' }} />
                    </div>
                  </div>

                  {/* Vibration Strength */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                      <span className="uppercase tracking-wider">{t('product.vibration_strength')}</span>
                      <span className="text-white">9.5 / 10</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '95%' }} />
                    </div>
                  </div>

                  {/* Ergonomics */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                      <span className="uppercase tracking-wider">{t('product.ergonomics')}</span>
                      <span className="text-white">9.8 / 10</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '98%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Write a Review Form */}
              <div className="bg-neutral-900/40 p-6 md:p-8 border border-white/5 rounded-none">
                <h3 className="text-sm font-black tracking-widest text-white uppercase mb-6">{t('product.write_review')}</h3>
                <form onSubmit={handleSubmitReview} className="space-y-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold tracking-wider text-outline uppercase">{t('product.form_name')}</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder={t('product.form_name_placeholder')}
                      className="w-full bg-neutral-950 border border-white/10 px-4 py-2.5 text-[16px] text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors rounded-none"
                    />
                  </div>

                  {/* Dropdowns Row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <label className="block text-[9px] font-bold tracking-wider text-outline uppercase">{t('product.form_age')}</label>
                      <select
                        value={formAge}
                        onChange={e => setFormAge(e.target.value)}
                        className="w-full bg-neutral-950 border border-white/10 px-2.5 py-2.5 text-[10px] text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors rounded-none"
                      >
                        <option value="18-24">18-24</option>
                        <option value="25-34">25-34</option>
                        <option value="35-44">35-44</option>
                        <option value="45+">45+</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[9px] font-bold tracking-wider text-outline uppercase">{t('product.form_exp')}</label>
                      <select
                        value={formExp}
                        onChange={e => setFormExp(e.target.value)}
                        className="w-full bg-neutral-950 border border-white/10 px-2.5 py-2.5 text-[10px] text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors rounded-none"
                      >
                        <option value="Новичок">{t('home.quiz.exp_new')}</option>
                        <option value="Средний">{t('home.quiz.exp_mid')}</option>
                        <option value="Сексперт">{t('home.quiz.exp_pro')}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[9px] font-bold tracking-wider text-outline uppercase">{t('product.form_sens')}</label>
                      <select
                        value={formSens}
                        onChange={e => setFormSens(e.target.value)}
                        className="w-full bg-neutral-950 border border-white/10 px-2.5 py-2.5 text-[10px] text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors rounded-none"
                      >
                        <option value="Низкая">{i18n.language === 'en' ? 'Low' : i18n.language === 'kk' ? 'Төмен' : 'Низкая'}</option>
                        <option value="Нормальная">{i18n.language === 'en' ? 'Normal' : i18n.language === 'kk' ? 'Қалыпты' : 'Нормальная'}</option>
                        <option value="Высокая">{i18n.language === 'en' ? 'High' : i18n.language === 'kk' ? 'Жоғары' : 'Высокая'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Character Sliders */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-bold text-outline uppercase tracking-wider">
                      <span>{t('product.form_noise', { noise: formNoise })}</span>
                      <input
                        type="range" min="1" max="10"
                        value={formNoise} onChange={e => setFormNoise(parseInt(e.target.value))}
                        className="accent-primary w-24 h-1 bg-neutral-800 rounded-none cursor-pointer"
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold text-outline uppercase tracking-wider">
                      <span>{t('product.form_vib', { vib: formStrength })}</span>
                      <input
                        type="range" min="1" max="10"
                        value={formStrength} onChange={e => setFormStrength(parseInt(e.target.value))}
                        className="accent-primary w-24 h-1 bg-neutral-800 rounded-none cursor-pointer"
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold text-outline uppercase tracking-wider">
                      <span>{t('product.form_ergo', { ergo: formErgo })}</span>
                      <input
                        type="range" min="1" max="10"
                        value={formErgo} onChange={e => setFormErgo(parseInt(e.target.value))}
                        className="accent-primary w-24 h-1 bg-neutral-800 rounded-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold tracking-wider text-outline uppercase">{t('product.form_review')}</label>
                    <textarea
                      required
                      value={formText}
                      onChange={e => setFormText(e.target.value)}
                      placeholder={t('product.form_placeholder')}
                      rows={3}
                      className="w-full bg-neutral-950 border border-white/10 px-4 py-2.5 text-[16px] text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors rounded-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary text-on-primary font-sans font-black text-[10px] tracking-[0.2em] py-3.5 uppercase hover:bg-[#ffe088] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98] transition-all rounded-none"
                  >
                    {t('product.form_submit')}
                  </button>
                </form>
              </div>

            </div>

            {/* Bottom Reviews List Stack */}
            <div className="space-y-6 pt-12 border-t border-white/10">
              <h3 className="text-sm font-black tracking-widest text-white uppercase mb-6 text-left">{t('product.reviews_list_title', { count: reviewsList.length })}</h3>

              <div className="space-y-6">
                {reviewsList.map(rev => (
                  <div key={rev.id} className="p-6 md:p-8 bg-neutral-900/20 border border-white/5 rounded-none space-y-4">
                    {/* Review Header Metadata */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="text-left">
                        <p className="text-sm font-bold text-white uppercase">{rev.author}</p>
                        <p className="text-[9px] text-outline mt-1 font-bold">{rev.date}</p>
                      </div>

                      {/* Profile Badges */}
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-neutral-900 text-primary border border-primary/20 text-[8px] font-black tracking-widest uppercase py-1 px-3 rounded-full">
                          {t('product.rev_age', { age: rev.age })}
                        </span>
                        <span className="bg-neutral-900 text-primary border border-primary/20 text-[8px] font-black tracking-widest uppercase py-1 px-3 rounded-full">
                          {t('product.rev_exp', { exp: getExperienceTranslation(rev.experience) })}
                        </span>
                        <span className="bg-neutral-900 text-primary border border-primary/20 text-[8px] font-black tracking-widest uppercase py-1 px-3 rounded-full">
                          {t('product.rev_sens', { sens: getSensitivityTranslation(rev.sensitivity) })}
                        </span>
                      </div>
                    </div>

                    {/* Review text */}
                    <p className="text-xs text-white/80 leading-relaxed font-sans font-normal text-left">{getReviewTextTranslation(rev.id, rev.text)}</p>

                    {/* Review sub-ratings */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-[9px] text-outline font-bold tracking-wider uppercase pt-4 border-t border-white/5">
                      <span>{t('product.rev_noise', { noise: rev.noise })}</span>
                      <span>{t('product.rev_vib', { vib: rev.strength })}</span>
                      <span>{t('product.rev_ergo', { ergo: rev.ergo })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

    </>
  );
}
