import { ReactNode } from "react";

type PageWithAdsProps = {
  children: ReactNode;
  mainColumnClassName?: string;
};

type AdBannerProps = {
  ariaLabel: string;
  className: string;
};

function AdRail({ side }: { side: "left" | "right" }) {
  const ariaLabel =
    side === "left"
      ? "Publicidade lateral esquerda"
      : "Publicidade lateral direita";
  const railClassName = side === "left" ? "adRail adRailLeft" : "adRail adRailRight";

  return (
    <aside className={railClassName} aria-label={ariaLabel}>
      <div className="adSlot">
        <span>Ad</span>
      </div>
    </aside>
  );
}

export function AdBanner({ ariaLabel, className }: AdBannerProps) {
  return (
    <div className={className} aria-label={ariaLabel}>
      <span>Ad</span>
    </div>
  );
}

export function PageWithAds({
  children,
  mainColumnClassName = "mainColumn"
}: PageWithAdsProps) {
  return (
    <div className="layoutWithAds">
      <AdRail side="left" />
      <div className={mainColumnClassName}>{children}</div>
      <AdRail side="right" />
    </div>
  );
}
