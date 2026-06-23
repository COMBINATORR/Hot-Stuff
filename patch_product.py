with open('src/pages/ProductPage.jsx', 'r') as f:
    content = f.read()

search_str = """                <button
                  className="px-4 text-on-surface-variant hover:text-white transition-colors text-sm font-bold"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                >−</button>
                <span className="px-5 text-xs font-bold text-center min-w-[2.5rem] select-none">{qty}</span>
                <button
                  className="px-4 text-on-surface-variant hover:text-white transition-colors text-sm font-bold"
                  onClick={() => setQty(q => q + 1)}
                >+</button>"""

replace_str = """                <button
                  className="px-4 text-on-surface-variant hover:text-white transition-colors text-sm font-bold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-[2px]"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  aria-label={t('common.decrease', 'Уменьшить')}
                >−</button>
                <span className="px-5 text-xs font-bold text-center min-w-[2.5rem] select-none">{qty}</span>
                <button
                  className="px-4 text-on-surface-variant hover:text-white transition-colors text-sm font-bold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-[2px]"
                  onClick={() => setQty(q => q + 1)}
                  aria-label={t('common.increase', 'Увеличить')}
                >+</button>"""

if search_str in content:
    content = content.replace(search_str, replace_str)
    with open('src/pages/ProductPage.jsx', 'w') as f:
        f.write(content)
    print("Patch applied to ProductPage.jsx")
else:
    print("Search string not found in ProductPage.jsx")
