import {
  ArrowRight,
  CheckCircle2,
  Mail,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";

const contactEmail = "contact@rafik.site";
const whatsappDisplay = "0034603425370";
const whatsappLink = "https://wa.me/34603425370";

const saleHighlights = [
  "Boutique e-commerce premium deja structuree",
  "Base de donnees integree et exploitable",
  "Back-office personnalise pour la gestion quotidienne",
];

const includedItems = [
  "Design haut de gamme, responsive et pret a presenter",
  "Tunnel d'achat moderne avec pages boutique, panier et checkout",
  "Panel d'administration pour gerer contenu, stock et configuration",
];

export default function VentaPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,145,113,0.24),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.14),transparent_28%)]" />
      <div className="absolute left-1/2 top-[-120px] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-[#b99171]/15 blur-3xl" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-16 sm:px-8 lg:px-12">
        <div className="grid w-full gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/75 backdrop-blur">
              <Sparkles className="h-4 w-4 text-[#d7b394]" />
              Template premium disponible
            </div>

            <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-7xl">
              TEMPLATE E-COMMERCE
              <span className="block text-[#d7b394]">A VENDRE</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
              Une vitrine haut de gamme, deja developpee, ideale pour lancer
              rapidement un projet de marque ou une boutique digitale avec une
              base technique serieuse et un rendu professionnel.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {saleHighlights.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <CheckCircle2 className="mb-3 h-5 w-5 text-[#7ef0aa]" />
                  <p className="text-sm leading-6 text-white/82">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f6efe8] px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:scale-[1.01] hover:bg-white"
              >
                <Mail className="h-4 w-4" />
                Contacter par email
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:scale-[1.01] hover:border-[#25d366]/60 hover:bg-[#25d366]/10"
              >
                <MessageCircle className="h-4 w-4 text-[#25d366]" />
                Contacter sur WhatsApp
              </a>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                  Email direct
                </p>
                <p className="mt-3 text-lg font-medium text-white">{contactEmail}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                  WhatsApp direct
                </p>
                <p className="mt-3 text-lg font-medium text-white">{whatsappDisplay}</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-b from-[#d7b394]/20 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-white/8 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                    Offre actuelle
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                    Vente complete du template
                  </h2>
                </div>
                <div className="rounded-full border border-[#7ef0aa]/30 bg-[#7ef0aa]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7ef0aa]">
                  Disponible
                </div>
              </div>

              <div className="mt-8 rounded-3xl border border-white/10 bg-black/35 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-white/45">
                  Prix de vente
                </p>
                <div className="mt-3 flex items-end gap-3">
                  <span className="text-5xl font-semibold tracking-tight text-[#7ef0aa] sm:text-6xl">
                    5000
                  </span>
                  <span className="pb-2 text-lg uppercase tracking-[0.18em] text-white/60">
                    MAD
                  </span>
                </div>
                <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
                  Ideal pour une revente rapide, une presentation client ou un
                  lancement accelere avec une base deja valorisable.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                {includedItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/25 p-4"
                  >
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#d7b394]" />
                    <p className="text-sm leading-6 text-white/78">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
                  <Store className="h-5 w-5 text-[#d7b394]" />
                  <p className="mt-3 text-sm font-medium text-white">
                    Experience boutique
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/62">
                    Une structure pensee pour valoriser les produits et la
                    marque des le premier regard.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
                  <ShieldCheck className="h-5 w-5 text-[#7ef0aa]" />
                  <p className="mt-3 text-sm font-medium text-white">
                    Administration integree
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/62">
                    Gestion de contenu et operations deja pensees pour un usage
                    concret.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
