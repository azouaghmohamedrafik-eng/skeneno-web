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
        <h2 className="text-6xl font-serif mb-6 leading-tight">Guide d'Utilisation <br /><span className="text-[#B29071] text-3xl font-sans font-bold uppercase tracking-[0.3em]">Skineno Admin</span></h2>
        <p className="text-gray-500 text-xl max-w-3xl leading-relaxed font-light">
          Ce manuel interactif a été conçu pour vous accompagner dans la gestion quotidienne de votre boutique. 
          Suivez ces protocoles pour garantir une expérience client irréprochable et optimiser vos performances commerciales.
        </p>
      </div>

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
                    Chaque produit doit posséder un <strong>Nom clair</strong>, un <strong>Prix précis</strong> et un <strong>Format</strong> (ex: 100ml). 
                    La description est votre meilleur vendeur : utilisez des mots qui évoquent le luxe et le bien-être.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="font-bold text-sm uppercase tracking-wider">Badges & Visibilité</p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Cochez les catégories (Visage, Corps, Cheveux) pour que le produit apparaisse dans les menus. 
                    Le badge <strong>"Spécial"</strong> ajoute une touche d'exclusivité visuelle sur la boutique.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-50">
              <h4 className="font-bold text-xl flex items-center gap-3 text-amber-500">
                <Sparkles className="w-5 h-5" /> Stratégie de Vente Croisée
              </h4>
              <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                La fonction <strong>"Suggéré" (Sparkles)</strong> est un outil puissant. En cochant cette case, le produit sera 
                automatiquement proposé dans le panier du client sous la section <strong>"Complétez votre routine"</strong>. 
                Utilisez-le pour proposer des produits complémentaires (ex: proposer une huile après l'achat d'une crème).
              </p>
            </div>
          </div>

          <div className="bg-blue-600 p-10 rounded-[2.5rem] text-white space-y-6 shadow-xl shadow-blue-100">
            <Lightbulb className="w-10 h-10 text-blue-200" />
            <h4 className="font-bold text-2xl leading-tight">Cas Pratique : <br />Lancement de Saison</h4>
            <p className="text-blue-100 text-sm leading-relaxed">
              Pour lancer une nouvelle gamme : <br /><br />
              1. Créez les produits avec le badge <strong>"Spécial"</strong>.<br />
              2. Marquez les 3 produits phares comme <strong>"Suggérés"</strong>.<br />
              3. Mettez à jour le <strong>Slider d'accueil</strong> avec un visuel de la gamme et liez-le au produit principal.
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
                Le stock est mis à jour en temps réel. Si vous réglez une quantité sur <strong>0</strong>, 
                le site bloque automatiquement l'achat et affiche <strong>"Rupture de stock"</strong>. 
                Cela évite les frustrations clients et les remboursements.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-600">
                <Zap className="w-5 h-5" />
                <h4 className="font-bold uppercase tracking-wider text-sm">Mise à jour Rapide</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                La page <strong>"Stock"</strong> est optimisée pour les inventaires. Utilisez les boutons + et - 
                pour ajuster les quantités sans avoir à modifier chaque fiche produit individuellement.
              </p>
            </div>
            <div className="space-y-4 p-6 bg-red-50 rounded-[2rem] border border-red-100">
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="font-bold uppercase tracking-wider text-sm">Alerte Critique</h4>
              </div>
              <p className="text-xs text-red-800/70 leading-relaxed">
                Un stock à 0 fait chuter votre taux de conversion. Anticipez vos réapprovisionnements 
                lorsque le stock descend en dessous de 5 unités (le chiffre passera en rouge dans votre tableau).
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
            <p className="text-sm text-gray-500 leading-relaxed">La commande est enregistrée. Vérifiez les détails du panier et l'adresse de livraison fournie par le client.</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 bg-blue-50 text-blue-600 font-bold text-[10px] uppercase">Phase 2</div>
            <h5 className="font-bold text-lg">Expédié</h5>
            <p className="text-sm text-gray-500 leading-relaxed">Le colis est entre les mains du transporteur. C'est le moment idéal pour utiliser le bouton <strong>WhatsApp</strong>.</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 bg-green-50 text-green-600 font-bold text-[10px] uppercase">Phase 3</div>
            <h5 className="font-bold text-lg">Livré</h5>
            <p className="text-sm text-gray-500 leading-relaxed">Le client a reçu son colis. Le statut "Livré" permet de clôturer la transaction proprement dans vos statistiques.</p>
          </div>
        </div>

        <div className="bg-green-600 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-12 shadow-xl shadow-green-100">
          <div className="p-6 bg-white/10 rounded-full">
            <MessageCircle className="w-16 h-16" />
          </div>
          <div className="space-y-4">
            <h4 className="text-2xl font-bold">L'Excellence du Service via WhatsApp</h4>
            <p className="text-green-50 leading-relaxed max-w-2xl">
              Le bouton WhatsApp génère automatiquement un lien vers le numéro du client avec un message pré-rempli. 
              <strong> Pourquoi l'utiliser ?</strong> Cela humanise votre marque de luxe, rassure le client sur son expédition 
              y réduit drastiquement les demandes au support. Assurez-vous que le numéro du client est au format international.
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
              <h4 className="font-bold text-xl uppercase tracking-wider">Règles de Cadeaux</h4>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Dans <strong>Configuration</strong>, vous pouvez définir un seuil de cadeau (ex: 1500 MAD). <br /><br />
              - <strong>Impact :</strong> Une barre de progression apparaîtra dans le panier du client pour l'encourager à acheter plus afin de débloquer le cadeau. <br />
              - <strong>Flexibilité :</strong> Vous pouvez changer le nom du cadeau et le montant minimum à tout moment selon vos stocks.
            </p>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-4 text-amber-600">
              <Package className="w-6 h-6" />
              <h4 className="font-bold text-xl uppercase tracking-wider">Packaging Cadeau</h4>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Gérez vos options de coffrets et pochettes dans la section <strong>Packaging</strong>. <br /><br />
              - <strong>Visuels :</strong> Téléchargez des photos de haute qualité de vos boîtes cadeaux. <br />
              - <strong>Prix :</strong> Définissez un prix additionnel ou laissez à 0 pour offrir le packaging. <br />
              - <strong>Contrôle :</strong> Si vous n'avez plus de coffrets, passez l'option sur "Désactivé" pour qu'elle disparaisse du site.
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
            <h3 className="text-3xl font-bold">05. Coupons & Menu de Campagne</h3>
            <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">Promotions contrôlées et élégantes</p>
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
            </div>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-4 text-violet-600">
              <Sparkles className="w-6 h-6" />
              <h4 className="font-bold text-xl uppercase tracking-wider">Menu de Campagne</h4>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Affichez un lien de campagne dans la barre de navigation pour vos opérations marketing. 
              Utilisez un intitulé court et impactant, par exemple <span className="font-bold">Ramadan</span>, <span className="font-bold">Soldes</span> ou <span className="font-bold">Nouveautés</span>.
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
            <h3 className="text-3xl font-bold">06. Slider & Footer</h3>
            <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">Identité et crédibilité</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h4 className="font-bold text-xl">Slider d’accueil</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Utilisez des visuels haute définition. Chaque slide peut être liée à un produit ou une collection. 
              Respectez un texte court et une hiérarchie claire pour rester premium.
            </p>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h4 className="font-bold text-xl">Footer</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Mettez à jour les liens sociaux et les mentions légales. Un footer complet augmente la confiance 
              et améliore la conversion sur une marque de luxe.
            </p>
          </div>
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
            <p className="text-[10px] font-bold uppercase text-gray-300 tracking-[0.4em]">Skineno OS v1.1.0 - 2026</p>
        </div>
      </div>
    </div>
  );
}
