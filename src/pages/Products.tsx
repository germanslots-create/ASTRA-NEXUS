import { Package, ShieldCheck, Zap, Star, LayoutGrid } from 'lucide-react';
import { CATALOG } from '../constants';
import { formatPrice, cn } from '../lib/utils';

export function Products() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold italic gold-gradient-text">Produktkatalog</h2>
          <p className="text-astro-muted">Verfügbare Horoskope und Dienstleistungen.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {CATALOG.map((product) => (
          <div key={product.id} className="astro-card p-6 flex flex-col">
            <div className="h-12 w-12 rounded-2xl bg-astro-gold/10 flex items-center justify-center text-astro-gold mb-6 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
              {product.type === 'subscription' ? <RefreshCcw className="h-6 w-6" /> : <Star className="h-6 w-6" />}
            </div>

            <h3 className="text-lg font-bold mb-2 group-hover:text-astro-gold transition-colors italic">
              {product.name}
            </h3>
            
            <p className="text-xs text-astro-muted mb-6 flex-1">
              Professionelle Analyse basierend auf Ihren Sternenkonstellationen.
            </p>

            <div className="mt-auto pt-6 border-t border-astro-gold/10 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold gold-gradient-text">{formatPrice(product.price)}</span>
                {product.type === 'subscription' && (
                  <span className="text-[10px] text-astro-muted uppercase tracking-widest font-bold">Pro 3 Monate</span>
                )}
              </div>
              <div className={cn(
                "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                product.type === 'subscription' ? "bg-blue-400/10 text-blue-400" : "bg-astro-gold/10 text-astro-gold"
              )}>
                {product.type === 'subscription' ? 'Abo' : 'Einmal'}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer Info */}
      <div className="astro-card p-6 mt-12 bg-white/5 border-dashed flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Digistore24 Ready</h4>
            <p className="text-xs text-astro-muted">API-Schnittstellen für automatische Imports sind vorbereitet.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Automatisierung</h4>
            <p className="text-xs text-astro-muted">Subsysteme für PDF-Zuweisung und Status-Updates aktiv.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RefreshCcw({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
      <path d="M16 16h5v5"/>
    </svg>
  );
}
