with open('src/components/Header.jsx', 'r') as f:
    content = f.read()

search_str = """                          <button
                            className="px-3 py-1 text-on-surface-variant hover:text-primary"
                            onClick={() => onUpdateQty(item.id, item.variant, Math.max(1, item.qty - 1))}
                          >-</button>
                          <span className="px-3 py-1 font-body-md">{item.qty}</span>
                          <button
                            className="px-3 py-1 text-on-surface-variant hover:text-primary"
                            onClick={() => onUpdateQty(item.id, item.variant, item.qty + 1)}
                          >+</button>"""

replace_str = """                          <button
                            className="px-3 py-1 text-on-surface-variant hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-[2px]"
                            onClick={() => onUpdateQty(item.id, item.variant, Math.max(1, item.qty - 1))}
                            aria-label={t('common.decrease', 'Уменьшить')}
                          >-</button>
                          <span className="px-3 py-1 font-body-md">{item.qty}</span>
                          <button
                            className="px-3 py-1 text-on-surface-variant hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-[2px]"
                            onClick={() => onUpdateQty(item.id, item.variant, item.qty + 1)}
                            aria-label={t('common.increase', 'Увеличить')}
                          >+</button>"""

if search_str in content:
    content = content.replace(search_str, replace_str)
    with open('src/components/Header.jsx', 'w') as f:
        f.write(content)
    print("Patch applied to Header.jsx")
else:
    print("Search string not found in Header.jsx")
