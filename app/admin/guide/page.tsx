"use client";

import { 
  ShoppingBag, Package, CreditCard, Gift, ImageIcon, Settings, 
  CheckCircle2, Info, Lightbulb, MessageCircle, Sparkles, AlertTriangle,
  ArrowRight, MousePointer2, Eye, Zap, ShieldCheck, Heart
} from "lucide-react";

export default function AdminGuidePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-20 animate-fade-in-up pb-32 text-black font-sans">
      
      {/* HEADER DE HAUTE QUALITÉ */}
      <div className="border-b border-gray-100 pb-12 relative">
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-[#B29071]/5 rounded-full blur-3xl -z-10"></div>
        <h2 className="text-6xl font-serif mb-6 leading-tight">Guide d'Utilisation <br /><span className="text-[#B29071] text-3xl font-sans font-bold uppercase tracking-[0.3em]">Skinino Admin</span></h2>
        <p className="text-gray-500 text-xl max-w-3xl leading-relaxed font-light">
          Ce guide a été actualisé pour refléter votre back-office réel. 
          Suivez ce protocole pour gérer produits, variantes, stock, commandes et marketing avec un flux simple et fiable.
        </p>
      </div>

      <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Routine rapide quotidienne</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <p className="text-sm text-gray-600">1. Vérifiez les commandes en attente et confirmez les adresses.</p>
          <p className="text-sm text-gray-600">2. Contrôlez la page Stock, surtout les variantes 100ml/200ml.</p>
          <p className="text-sm text-gray-600">3. Ajustez Produits si un format secondaire doit être ajouté ou retiré.</p>
          <p className="text-sm text-gray-600">4. Testez un panier pour valider cadeau, packaging et livraison.</p>
        </div>
      </section>

      {/* MODULE 1: CATALOGUE & STRATÉGIE */}
      <section className="space-y-10">
        <div className="flex items-center gap-6">
          <div className="p-5 rounded-3xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-3xl font-bold">01. Gestion du Catalogue</h3>
            <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">Architecture des produits & Marketing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
            <div className="space-y-6">
              <h4 className="font-bold text-xl flex items-center gap-3 text-blue-600">
                <Zap className="w-5 h-5" /> Protocoles de Mise en Ligne
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <p className="font-bold text-sm uppercase tracking-wider">Fiche Produit</p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Utilisez le formulaire repliable pour créer ou modifier rapidement un produit. 
                    Ajoutez le format principal, puis le format secondaire uniquement si vous vendez une seconde contenance.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="font-bold text-sm uppercase tracking-wider">Badges & Visibilité</p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Cochez Visage, Corps, Cheveux et les badges Offre, Cadeau, Spécial selon la stratégie. 
                    Le statut <strong>Suggéré</strong> affiche le produit en cross-sell dans le panier.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-50">
              <h4 className="font-bold text-xl flex items-center gap-3 text-amber-500">
                <Sparkles className="w-5 h-5" /> Stratégie de Vente Croisée
              </h4>
              <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                Utilisez Suggéré pour recommander des routines cohérentes. Exemple: sérum + crème + huile. 
                Le client voit ces produits dans le panier, ce qui augmente naturellement le panier moyen.
              </p>
            </div>
          </div>

          <div className="bg-blue-600 p-10 rounded-[2.5rem] text-white space-y-6 shadow-xl shadow-blue-100">
            <Lightbulb className="w-10 h-10 text-blue-200" />
            <h4 className="font-bold text-2xl leading-tight">Cas Pratique : <br />Lancement de Saison</h4>
            <p className="text-blue-100 text-sm leading-relaxed">
              Pour une gamme avec 100ml et 200ml : <br /><br />
              1. Créez la fiche avec format et prix principal.<br />
              2. Ajoutez Format 2 + Prix 2 uniquement si la variante existe.<br />
              3. Vérifiez le stock de chaque format dans <strong>Gestion du Stock</strong>.
            </p>
            <div className="pt-4">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" /> Stratégie Validée
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODULE 2: LOGISTIQUE & STOCK */}
      <section className="space-y-10">
        <div className="flex items-center gap-6">
          <div className="p-5 rounded-3xl bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100">
            <Package className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-3xl font-bold">02. Logistique & Stock</h3>
            <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">Contrôle des flux et disponibilité</p>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-600">
                <Eye className="w-5 h-5" />
                <h4 className="font-bold uppercase tracking-wider text-sm">Synchronisation</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Le stock suit désormais la variante réellement vendue. 
                Si le client achète 200ml, la déduction se fait sur le stock de 200ml, pas sur 100ml.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-600">
                <Zap className="w-5 h-5" />
                <h4 className="font-bold uppercase tracking-wider text-sm">Mise à jour Rapide</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                La page <strong>Stock</strong> affiche une ligne par format. 
                Utilisez + et - pour ajuster séparément chaque variante sans ouvrir chaque fiche produit.
              </p>
            </div>
            <div className="space-y-4 p-6 bg-red-50 rounded-[2rem] border border-red-100">
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="font-bold uppercase tracking-wider text-sm">Alerte Critique</h4>
              </div>
              <p className="text-xs text-red-800/70 leading-relaxed">
                Gardez l’attribut <strong>stock_alt</strong> actif dans la collection products pour piloter les formats secondaires. 
                Un stock à 0 bloque immédiatement l’achat côté client.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MODULE 3: COMMANDES & RELATION CLIENT */}
      <section className="space-y-10">
        <div className="flex items-center gap-6">
          <div className="p-5 rounded-3xl bg-rose-50 text-rose-600 shadow-sm border border-rose-100">
            <CreditCard className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-3xl font-bold">03. Flux des Commandes</h3>
            <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">Cycle de vie d'une vente</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 bg-amber-50 text-amber-600 font-bold text-[10px] uppercase">Phase 1</div>
            <h5 className="font-bold text-lg">En attente</h5>
            <p className="text-sm text-gray-500 leading-relaxed">Commande reçue. Vérifiez adresse, téléphone, contenu panier et message cadeau.</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 bg-blue-50 text-blue-600 font-bold text-[10px] uppercase">Phase 2</div>
            <h5 className="font-bold text-lg">Expédié</h5>
            <p className="text-sm text-gray-500 leading-relaxed">Le colis part. Le stock est déduit automatiquement, y compris la bonne variante (100ml/200ml).</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 bg-green-50 text-green-600 font-bold text-[10px] uppercase">Phase 3</div>
            <h5 className="font-bold text-lg">Livré</h5>
            <p className="text-sm text-gray-500 leading-relaxed">Commande finalisée. Si vous repassez en attente, la restauration du stock est automatique.</p>
          </div>
        </div>

        <div className="bg-green-600 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-12 shadow-xl shadow-green-100">
          <div className="p-6 bg-white/10 rounded-full">
            <MessageCircle className="w-16 h-16" />
          </div>
          <div className="space-y-4">
            <h4 className="text-2xl font-bold">L'Excellence du Service via WhatsApp</h4>
            <p className="text-green-50 leading-relaxed max-w-2xl">
              Le bouton WhatsApp prépare un message prêt à envoyer au moment de l’expédition. 
              Utilisez-le pour confirmer le départ du colis et améliorer la confiance client.
            </p>
          </div>
        </div>
      </section>

      {/* MODULE 4: MARKETING AVANCÉ & DESIGN */}
      <section className="space-y-10">
        <div className="flex items-center gap-6">
          <div className="p-5 rounded-3xl bg-amber-50 text-amber-600 shadow-sm border border-amber-100">
            <Gift className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-3xl font-bold">04. Marketing & Identité Visuelle</h3>
            <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">Cadeaux, Packaging & Slider</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-4 text-amber-600">
              <Heart className="w-6 h-6" />
              <h4 className="font-bold text-xl uppercase tracking-wider">Cadeaux + Offre automatique</h4>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              1. Créez vos cadeaux dans la section <strong>Cadeaux</strong> (nom, image, actif/inactif).<br /><br />
              2. Dans <strong>Packaging</strong>, sélectionnez le cadeau offert, le seuil en MAD et activez la règle.
            </p>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-4 text-amber-600">
              <Package className="w-6 h-6" />
              <h4 className="font-bold text-xl uppercase tracking-wider">Packaging & Panier</h4>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Activez/désactivez coffret et pochette, définissez les prix et chargez les visuels. 
              Les options apparaissent ensuite dans le drawer panier et dans la page panier.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-10">
        <div className="flex items-center gap-6">
          <div className="p-5 rounded-3xl bg-violet-50 text-violet-600 shadow-sm border border-violet-100">
            <Settings className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-3xl font-bold">05. Coupons, Menu & Livraison</h3>
            <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">Pilotage global du front-office</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-4 text-violet-600">
              <CreditCard className="w-6 h-6" />
              <h4 className="font-bold text-xl uppercase tracking-wider">Système de Coupons</h4>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                Créez un code unique, choisissez le type <span className="font-bold">Pourcentage</span> ou <span className="font-bold">Montant fixe</span>, 
                définissez le minimum de commande, la période de validité et les limites d'usage. Vous pouvez aussi cibler un produit précis.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border p-4">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Exemple</p>
                  <p className="text-sm"><span className="font-bold">RAMADAN20</span> • 20% • Min: 200 MAD • 05/03 → 08/03</p>
                </div>
                <div className="rounded-2xl border p-4">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Ciblage produit</p>
                  <p className="text-sm">Sélectionnez un produit du catalogue pour une remise ciblée.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <p className="text-sm">Activation/désactivation et édition rapides depuis la liste.</p>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Dans la section Livraison, configurez aussi le panneau d’expédition et les tarifs par zone affichés au client.
              </p>
            </div>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-4 text-violet-600">
              <Sparkles className="w-6 h-6" />
              <h4 className="font-bold text-xl uppercase tracking-wider">Menu de Campagne & Messages</h4>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Dans Configuration, pilotez le menu dynamique, les onglets Visage/Corps/Cheveux et les messages top-bar. 
              Utilisez des textes courts pour préserver la lisibilité sur mobile.
            </p>
            <div className="rounded-2xl border p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase text-gray-400">Bonnes pratiques</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Évitez les titres trop longs.</li>
                <li>Gardez une seule campagne active à la fois.</li>
                <li>Couplez avec un slider d’accueil pour cohérence visuelle.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-10">
        <div className="flex items-center gap-6">
          <div className="p-5 rounded-3xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
            <ImageIcon className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-3xl font-bold">06. Slider, Footer & Contrôle qualité</h3>
            <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">Contenu visuel et cohérence marque</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h4 className="font-bold text-xl">Slider d’accueil</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Mettez à jour images, textes, produit lié et vidéo hero si besoin. 
              Gardez des visuels haute définition et des titres courts pour une lecture claire.
            </p>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h4 className="font-bold text-xl">Footer</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Activez uniquement les réseaux vraiment utilisés. 
              Contrôlez régulièrement les URL pour éviter les liens cassés et préserver la crédibilité.
            </p>
          </div>
        </div>
        <div className="bg-black text-white p-7 rounded-[2rem]">
          <p className="text-sm leading-relaxed">
            Contrôle hebdomadaire recommandé: vérifier une commande test, valider les stocks critiques, relire les messages promo et confirmer que chaque section admin reste alignée avec la campagne active.
          </p>
        </div>
      </section>

      {/* FOOTER DE LA GUÍA */}
      <div className="pt-16 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3 text-gray-400">
          <Info className="w-5 h-5" />
          <p className="text-xs font-bold uppercase tracking-[0.2em]">Besoin d'une assistance technique ? Contactez votre développeur référent.</p>
        </div>
        <div className="flex items-center gap-4">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <p className="text-[10px] font-bold uppercase text-gray-300 tracking-[0.4em]">Skinino OS v1.1.0 - 2026</p>
        </div>
      </div>
    </div>
  );
}
