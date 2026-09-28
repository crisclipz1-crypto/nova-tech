import { BadgeCheck, BanknoteArrowDown, Truck } from "lucide-react";

const CLAIMS = [
  { icon: BanknoteArrowDown, text: "Pago contra entrega en toda Colombia" },
  { icon: Truck, text: "Envío gratis desde $200.000" },
  { icon: BadgeCheck, text: "Garantía de 12 meses en todos los productos" },
];

/**
 * Cinta superior con las tres promesas de la tienda.
 *
 * En móvil no caben las tres, así que se desplazan en bucle; a partir de `sm`
 * se muestran fijas y repartidas. La marquesina se duplica y se anima hasta
 * −50 %, que es lo que hace que el bucle no tenga salto visible.
 */
export function AnnouncementBar() {
  return (
    <div className="border-b border-foreground/10 bg-foreground text-background">
      {/* Móvil: marquesina */}
      <div className="group relative flex overflow-hidden py-2 sm:hidden">
        <div className="flex shrink-0 animate-marquee items-center group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {CLAIMS.map(({ icon: Icon, text }) => (
                <span
                  key={text}
                  className="flex shrink-0 items-center gap-2 px-6 font-mono text-[10px] tracking-[0.14em] uppercase"
                >
                  <Icon className="size-3 shrink-0" />
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Escritorio: las tres a la vista */}
      <div className="container-page hidden py-2 sm:block">
        <ul className="flex items-center justify-between gap-6">
          {CLAIMS.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] uppercase"
            >
              <Icon className="size-3 shrink-0" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
