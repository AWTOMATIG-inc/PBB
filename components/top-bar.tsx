import Link from "next/link";
import { MapPin, MessageCircle, Phone } from "lucide-react";

const ITEM = "flex items-center gap-1.5 transition-colors hover:text-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500";

export default function TopBar() {
  return (
    <div className="bg-ink-950 text-xs text-white">
      <div className="mx-auto flex h-8 max-w-7xl items-center justify-between gap-4 px-4 sm:justify-start sm:gap-6 sm:px-6 lg:px-8">
        <a
          href="https://wa.me/8801989474447"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp +88 (0) 1989 474 447"
          className={ITEM}
        >
          <MessageCircle className="size-3.5 shrink-0 text-brand-500" />
          <span className="font-medium tabular-nums">+88 (0) 1989 474 447</span>
        </a>
        <a href="tel:+8801625181403" aria-label="Office +88 (0) 1625 181 403" className={ITEM}>
          <Phone className="size-3.5 shrink-0 text-brand-500" />
          <span className="font-medium tabular-nums">+88 (0) 1625 181 403</span>
        </a>
        <Link href="/contact" className={`${ITEM} hidden sm:ml-auto sm:flex`}>
          <MapPin className="size-3.5 shrink-0 text-brand-500" />
          <span className="font-medium">Dhaka (Savar) and Chattogram</span>
        </Link>
      </div>
    </div>
  );
}
