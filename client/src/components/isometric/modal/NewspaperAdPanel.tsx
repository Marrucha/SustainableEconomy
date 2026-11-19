import React, { useState } from 'react';
import type { BuildingState } from '../types';
type NewspaperAdCampaign = NonNullable<BuildingState['newspaperAds']>[number];

interface NewspaperAdPanelProps {
  buildingState: BuildingState;
  onSpendGold?: (amount: number) => void;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

const AD_PACKAGES = [
  { id: 'press_notice', label: 'Ogłoszenie w Gazecie', cost: 150, boostPercent: 10 },
  { id: 'poster_run', label: 'Plakaty Reklamowe (Miasto)', cost: 320, boostPercent: 20 },
  { id: 'full_campaign', label: 'Pełna Kampania (Gazeta + Plakaty)', cost: 550, boostPercent: 35 },
] as const;

export const NewspaperAdPanel: React.FC<NewspaperAdPanelProps> = ({
  buildingState,
  onSpendGold,
  onUpdateState,
}) => {
  const [playerName, setPlayerName] = useState('Gracz 1');
  const ads = buildingState.newspaperAds || [];

  const handleBuyAd = (pkg: (typeof AD_PACKAGES)[number]) => {
    const cleanName = playerName.trim() || 'Gracz 1';
    if (onSpendGold) onSpendGold(pkg.cost);
    const nextAd: NewspaperAdCampaign = {
      id: `ad_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      playerName: cleanName,
      packageLabel: pkg.label,
      cost: pkg.cost,
      boostPercent: pkg.boostPercent,
    };
    onUpdateState({ newspaperAds: [...ads, nextAd] });
  };

  const handleRemoveAd = (id: string) => {
    onUpdateState({ newspaperAds: ads.filter((a) => a.id !== id) });
  };

  return (
    <div className="p-4 rounded-2xl bg-stone-950/80 border border-amber-500/35 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            📣 Biuro Reklamy i Ogłoszeń (Dla Każdego Gracza)
          </h4>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Każdy gracz może wykupić tu reklamę w gazecie lub plakaty reklamowe zwiększające popyt.
          </p>
        </div>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Nazwa gracza / firmy"
          className="bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1 text-xs text-stone-100 w-40"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {AD_PACKAGES.map((pkg) => (
          <button
            key={pkg.id}
            type="button"
            onClick={() => handleBuyAd(pkg)}
            className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-700 hover:border-amber-400/70 text-left transition-all cursor-pointer"
          >
            <p className="text-xs font-bold text-amber-200">{pkg.label}</p>
            <p className="text-[10px] text-emerald-300 mt-0.5">+{pkg.boostPercent}% popytu / marki</p>
            <p className="text-[11px] font-mono text-amber-400 font-bold mt-1">Wykup za £{pkg.cost}</p>
          </button>
        ))}
      </div>

      {ads.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-stone-800">
          <p className="text-[10px] font-bold text-stone-400 uppercase">
            Aktywne reklamy ({ads.length}):
          </p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-stone-900/70 border border-stone-800 text-[11px]"
              >
                <span>
                  <strong className="text-amber-200">{ad.playerName}</strong> — {ad.packageLabel}{' '}
                  <span className="text-emerald-300">(+{ad.boostPercent}%)</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveAd(ad.id)}
                  className="text-[10px] text-stone-400 hover:text-rose-300 cursor-pointer"
                >
                  Zakończ
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
