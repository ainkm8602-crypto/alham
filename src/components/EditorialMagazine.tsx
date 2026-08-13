import React, { useState } from 'react';
import { Article } from '../types';
import { BookOpen, Clock, User, ArrowRight, X, ShoppingBag } from 'lucide-react';

interface EditorialMagazineProps {
  articles: Article[];
  onNavigate?: (view: string) => void;
}

const EditorialMagazineComponent: React.FC<EditorialMagazineProps> = ({ articles, onNavigate }) => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const categories = ['All', 'Behind the Craft', 'Healthy Snacking', 'Ingredient Stories'];

  const filteredArticles = filterCategory === 'All'
    ? articles
    : articles.filter(a => a.category === filterCategory);

  const handleCtaClick = (e: React.MouseEvent, ctaLink?: string, openInNewTab?: boolean) => {
    e.stopPropagation();
    if (openInNewTab && ctaLink) {
      window.open(ctaLink, '_blank', 'noopener,noreferrer');
      return;
    }
    if (ctaLink && ctaLink.startsWith('http')) {
      window.location.href = ctaLink;
      return;
    }
    if (onNavigate) {
      onNavigate('collection');
    } else {
      window.history.pushState({ view: 'collection' }, '', '/collection');
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 bg-[#E8DCC8]/30 border-t border-[#E8DCC8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#E8DCC8]">
          <div>
            <span className="text-xs font-semibold tracking-widest text-[#A86445] uppercase">
              The Alham Journal
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#29231F] mt-1">
              Stories & Recipes
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterCategory === cat
                    ? 'bg-[#29231F] text-[#F7F2E8]'
                    : 'bg-[#F7F2E8] text-[#29231F] hover:bg-[#E8DCC8]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredArticles.map(article => {
            const isShopCtaEnabled = article.shopCtaEnabled !== false;
            const shopCtaText = article.shopCtaText || 'Shop Related Products';
            const shopCtaLink = article.shopCtaLink || '/collection';

            return (
              <article
                key={article.id}
                className="bg-[#F7F2E8] border border-[#E8DCC8] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group space-y-4"
              >
                <div>
                  {/* Clickable Image -> Redirects to Shop Page */}
                  <div
                    onClick={(e) => handleCtaClick(e, shopCtaLink, article.openInNewTab)}
                    className="aspect-[16/10] bg-[#E8DCC8] overflow-hidden relative cursor-pointer shadow-sm group-hover:shadow-md"
                    title="Click to shop related collection"
                  >
                    <img
                      src={article.image}
                      alt={article.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      width="500"
                      height="312"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#6F7655] text-white text-[11px] px-2.5 py-1 rounded-full font-medium">
                      {article.category}
                    </div>
                    <div className="absolute inset-0 bg-[#29231F]/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-[#29231F]/80 text-[#F7F2E8] text-[11px] font-medium px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5 shadow-lg">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#C8A96B]" />
                        <span>Shop Related Products</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-6 pb-2 space-y-3">
                    <div className="flex items-center space-x-3 text-xs text-[#29231F]/60">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#A86445]" />
                        {article.readTime}
                      </span>
                      <span>•</span>
                      <span>{article.date}</span>
                    </div>

                    <h3
                      onClick={() => setSelectedArticle(article)}
                      className="font-serif text-xl font-bold text-[#29231F] group-hover:text-[#A86445] transition-colors leading-snug cursor-pointer"
                    >
                      {article.title}
                    </h3>

                    <p className="text-xs text-[#29231F]/70 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-3 border-t border-[#E8DCC8]/60 mt-2">
                  <div className="flex items-center justify-between pt-2">
                    {/* Primary Article Action: Read Editorial */}
                    <button
                      type="button"
                      onClick={() => setSelectedArticle(article)}
                      className="text-xs font-semibold text-[#A86445] hover:text-[#29231F] transition-colors flex items-center gap-1"
                    >
                      <span>Read Editorial</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Secondary CTA: Shop Products */}
                  {isShopCtaEnabled && (
                    <button
                      type="button"
                      onClick={(e) => handleCtaClick(e, shopCtaLink, article.openInNewTab)}
                      className="w-full py-2.5 px-3 bg-[#6F7655] hover:bg-[#29231F] text-[#F7F2E8] text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow group/btn"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#C8A96B]" />
                      <span>{shopCtaText}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Article Full Reader Modal */}
        {selectedArticle && (
          <div className="fixed inset-0 z-50 bg-[#29231F]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#F7F2E8] rounded-2xl border border-[#E8DCC8] max-w-2xl w-full p-6 sm:p-10 relative shadow-2xl my-8 space-y-6">
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 p-2 text-[#29231F] hover:bg-[#E8DCC8] rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-medium text-[#A86445]">
                  <span className="bg-[#A86445]/10 px-3 py-1 rounded-full">{selectedArticle.category}</span>
                  <span>•</span>
                  <span>{selectedArticle.readTime}</span>
                </div>

                <h2 className="font-serif text-3xl font-bold text-[#29231F] leading-snug">
                  {selectedArticle.title}
                </h2>

                <div className="flex items-center space-x-2 text-xs text-[#29231F]/60 pt-1 border-b border-[#E8DCC8] pb-4">
                  <User className="w-3.5 h-3.5 text-[#6F7655]" />
                  <span>By {selectedArticle.author}</span>
                  <span>•</span>
                  <span>{selectedArticle.date}</span>
                </div>
              </div>

              <div className="aspect-[16/9] rounded-xl overflow-hidden bg-[#E8DCC8]">
                <img
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  width="600"
                  height="338"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="prose prose-stone text-sm text-[#29231F]/85 leading-relaxed space-y-4">
                <p className="font-serif text-base italic text-[#29231F] border-l-2 border-[#A86445] pl-4">
                  "{selectedArticle.excerpt}"
                </p>
                <p>{selectedArticle.content}</p>
                <p>
                  At Alham, every recipe is a testament to the belief that healthy food should never feel clinical. By bringing together Middle Eastern date groves and Bangladeshi local nut roasting, we create timeless snacking moments.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E8DCC8] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    setSelectedArticle(null);
                    handleCtaClick(e, selectedArticle.shopCtaLink || '/collection', selectedArticle.openInNewTab);
                  }}
                  className="px-5 py-2.5 bg-[#6F7655] hover:bg-[#29231F] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow"
                >
                  <ShoppingBag className="w-4 h-4 text-[#C8A96B]" />
                  <span>{selectedArticle.shopCtaText || 'Shop Products Related To This Story'}</span>
                </button>

                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-5 py-2.5 bg-[#E8DCC8] text-[#29231F] rounded-xl text-xs font-semibold hover:bg-[#29231F] hover:text-white transition-colors"
                >
                  Close Article
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export const EditorialMagazine = React.memo(EditorialMagazineComponent);
