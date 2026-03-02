import React from 'react';
import { LabelData, AppSettings, LabelSize, LabelTemplate, LabelFontSize, MarkerShape } from '../types';

interface LabelItemProps {
  label: LabelData;
  settings: AppSettings;
}

export const LabelItem: React.FC<LabelItemProps> = ({ label, settings }) => {
  const isLarge = settings.size === LabelSize.LARGE;
  const isSmallFile = settings.size === LabelSize.SMALL_FILE;
  const isPimaco365 = settings.size === LabelSize.PIMACO_365;

  const width = isPimaco365 ? '99mm' : (isLarge ? '153mm' : (isSmallFile ? '50mm' : '118mm'));
  const height = isPimaco365 ? '67.7mm' : (isLarge ? '48mm' : '30mm');

  // Lógica de auto-ajuste de texto
  const getAutoFontSizes = (text: string, baseSize: number, customThreshold?: number) => {
    const threshold = customThreshold || (isSmallFile ? 10 : (isPimaco365 ? 20 : (isLarge ? 25 : 20)));
    if (text.length > threshold) {
      const scale = Math.max(0.4, threshold / text.length);
      return Math.round(baseSize * scale);
    }
    return baseSize;
  };

  const getFontSizes = () => {
    let base = {
      title: isPimaco365 ? 32 : (isLarge ? 28 : (isSmallFile ? 14 : 20)),
      subtitle: isPimaco365 ? 18 : (isLarge ? 15 : (isSmallFile ? 9 : 11)),
      info: isPimaco365 ? 14 : (isLarge ? 9 : (isSmallFile ? 7 : 7.5)),
      grid: isLarge ? 11 : 8,
      volume: 24
    };

    const multiplier =
      settings.fontSize === LabelFontSize.NORMAL ? 1.0 :
        settings.fontSize === LabelFontSize.PROMINENT ? 1.2 :
          0.8;

    let tSize = base.title * multiplier;
    let sSize = base.subtitle * multiplier;
    let iSize = base.info * multiplier;
    let gSize = base.grid * multiplier;
    let vSize = base.volume * multiplier;

    tSize = getAutoFontSizes(label.title, tSize, isPimaco365 ? 15 : undefined);
    sSize = getAutoFontSizes(label.subtitle, sSize, isPimaco365 ? 20 : undefined);

    return {
      title: `${tSize}pt`,
      subtitle: `${sSize}pt`,
      info: `${iSize}pt`,
      grid: `${gSize}pt`,
      volume: `${vSize}pt`
    };
  };

  const fonts = getFontSizes();

  const containerStyle: React.CSSProperties = {
    width,
    height,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'white',
    color: '#000',
    fontFamily: '"Outfit", sans-serif',
    display: 'flex',
    flexDirection: 'column',
    padding: isPimaco365 ? '5mm 7mm' : (isSmallFile ? '2mm 3mm' : (isLarge ? '6mm 10mm' : '3.5mm 7mm')),
    boxSizing: 'border-box',
    border: settings.showDashedLines ? '0.25mm dashed #94a3b8' : 'none',
    printColorAdjust: 'exact',
    WebkitPrintColorAdjust: 'exact'
  };

  const renderMarker = () => {
    if (!label.showMarker || label.markerShape === MarkerShape.NONE) return null;

    const shape = label.markerShape || MarkerShape.SQUARE;
    const color = label.markerColor;

    const style: React.CSSProperties = {
      position: 'absolute',
      top: isPimaco365 ? '6mm' : (isSmallFile ? '2mm' : (isLarge ? '6mm' : '3.5mm')),
      left: isPimaco365
        ? (settings.template === LabelTemplate.BADGE || settings.template === LabelTemplate.MINIMAL ? '50%' :
          (settings.template === LabelTemplate.STRIPED || settings.template === LabelTemplate.CORPORATE || settings.template === LabelTemplate.GRID ? 'auto' : '6mm'))
        : 'auto',
      right: isPimaco365
        ? (settings.template === LabelTemplate.STRIPED || settings.template === LabelTemplate.CORPORATE || settings.template === LabelTemplate.GRID ? '7mm' : 'auto')
        : (isSmallFile ? '2mm' : (isLarge ? '6mm' : '3.5mm')),
      transform: isPimaco365 && (settings.template === LabelTemplate.BADGE || settings.template === LabelTemplate.MINIMAL) ? 'translateX(-50%)' : 'none',
      width: isPimaco365 ? '12mm' : (isSmallFile ? '5mm' : (isLarge ? '10mm' : '7.5mm')),
      height: isPimaco365 ? '12mm' : (isSmallFile ? '5mm' : (isLarge ? '10mm' : '7.5mm')),
      backgroundColor: shape === MarkerShape.TRIANGLE ? 'transparent' : color,
      borderRadius: shape === MarkerShape.CIRCLE ? '50%' : '0px',
      zIndex: 10,
      WebkitPrintColorAdjust: 'exact',
      printColorAdjust: 'exact'
    };

    if (shape === MarkerShape.TRIANGLE) {
      return (
        <div style={{ ...style, width: 0, height: 0, borderLeft: '5mm solid transparent', borderRight: '5mm solid transparent', borderBottom: `8.6mm solid ${color}` }} />
      );
    }

    return <div style={style} />;
  };

  const renderGrid = () => {
    const items = label.gridItems || Array(8).fill('');
    return (
      <div className="grid grid-cols-2 w-full gap-x-4 gap-y-1 mt-2 border-t pt-2" style={{ borderColor: `${settings.primaryColor}22` }}>
        {items.map((item, idx) => {
          const itemSize = getAutoFontSizes(item, parseFloat(fonts.grid), 15);
          return (
            <div key={idx} className="flex items-center truncate">
              <span
                className="font-medium uppercase tracking-tight truncate w-full"
                style={{ fontSize: `${itemSize}pt`, color: '#000' }}
              >
                {item || '—'}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTemplate = () => {
    // Layout PIMACO INDUSTRIAL (Prioritário para PIMACO_365)
    if (settings.template === LabelTemplate.INDUSTRIAL) {
      return (
        <div className="flex flex-col h-full w-full justify-between items-stretch bg-white">
          <div className={`grid ${isPimaco365 ? 'grid-cols-[20mm_1fr_20mm]' : 'grid-cols-[15mm_1fr_15mm]'} items-start w-full`}>
            <div /> {/* Espaço reservado para o marcador */}
            <h1 className="font-semibold uppercase tracking-tight text-center text-black" style={{ fontSize: fonts.title, lineHeight: 1.05, marginTop: isPimaco365 ? '2mm' : '-1.5mm' }}>
              {label.title}
            </h1>
            <div /> {/* Equilíbrio visual */}
          </div>

          <div className={`flex flex-col gap-1 ${isPimaco365 ? 'mt-0' : 'mt-[-2mm]'} border-l-4 pl-5`} style={{ borderColor: label.markerColor }}>
            <p className="font-semibold uppercase text-black" style={{ fontSize: fonts.subtitle, lineHeight: 1.1 }}>{label.subtitle}</p>
            <p className="font-medium uppercase text-black/60 tracking-widest" style={{ fontSize: fonts.info }}>{label.info}</p>
          </div>

          <div className="flex items-end justify-between border-t-2 pt-4" style={{ borderColor: '#f1f5f9' }}>
            <div className="flex flex-col">
              <span className="text-[7pt] font-semibold uppercase tracking-[0.2em] text-black/20 leading-none mb-1.5">Unidade / Vol</span>
              <div className="font-semibold uppercase italic leading-none text-black" style={{ fontSize: fonts.volume }}>
                {label.volume || 1}
              </div>
            </div>

            {settings.logoUrl ? (
              <div className={`flex items-end ${isPimaco365 ? 'h-[20mm]' : 'h-[15mm]'}`}>
                <img src={settings.logoUrl} className={`max-h-full ${isPimaco365 ? 'max-w-[50mm]' : 'max-w-[42mm]'} object-contain grayscale opacity-90 transition-all`} alt="Logo" />
              </div>
            ) : null}
          </div>
        </div>
      );
    }

    if (isSmallFile) {
      return (
        <div className="flex flex-col w-full text-left" style={{ width: '100%' }}>
          <h2 className="font-semibold leading-none uppercase tracking-tighter" style={{ fontSize: fonts.title, color: '#000' }}>
            {label.title || 'TÍTULO'}
          </h2>
          <p className="font-medium uppercase tracking-tight mt-1 opacity-80" style={{ fontSize: fonts.subtitle, color: '#000' }}>
            {label.subtitle}
          </p>
          {settings.template === LabelTemplate.GRID ? renderGrid() : (
            <div className="mt-1.5 border-t-[0.3mm] pt-1" style={{ borderColor: `${settings.primaryColor}33` }}>
              <p className="truncate font-medium uppercase tracking-widest" style={{ fontSize: fonts.info, color: '#000' }}>
                {label.info}
              </p>
            </div>
          )}
        </div>
      );
    }

    switch (settings.template) {
      case LabelTemplate.GRID:
        return (
          <div className={`flex w-full items-center gap-6 ${isPimaco365 ? 'pt-4' : ''}`} style={{ width: '100%' }}>
            <div className={`flex-1 flex flex-col justify-center overflow-hidden ${isPimaco365 ? 'pr-16' : ''}`}>
              <div className="flex items-baseline justify-between">
                <h2 className="font-semibold leading-tight truncate uppercase tracking-tighter" style={{ fontSize: fonts.title, color: '#000' }}>
                  {label.title || 'TÍTULO'}
                </h2>
              </div>
              {renderGrid()}
            </div>
            {(settings.logoUrl && !isPimaco365) && (
              <div className="flex items-center justify-center bg-slate-50 p-2 border border-slate-100 shadow-sm" style={{ minWidth: isLarge ? '25mm' : '18mm', height: '100%' }}>
                <img src={settings.logoUrl} alt="Logo" style={{ maxHeight: isLarge ? '25mm' : '15mm', maxWidth: '100%', objectFit: 'contain' }} />
              </div>
            )}
          </div>
        );

      case LabelTemplate.CORPORATE:
        return (
          <div className={`flex w-full items-center gap-10 ${isPimaco365 ? 'pt-4' : ''}`} style={{ width: '100%' }}>
            <div className={`flex-1 flex flex-col justify-center overflow-hidden ${isPimaco365 ? 'pr-16' : ''}`}>
              <h2 className="font-semibold leading-tight truncate uppercase tracking-tighter" style={{ fontSize: fonts.title, color: '#000' }}>
                {label.title || 'TÍTULO'}
              </h2>
              <p className="font-medium uppercase tracking-widest truncate mt-0.5 opacity-80" style={{ fontSize: fonts.subtitle, color: '#000' }}>
                {label.subtitle}
              </p>
              <div className="mt-4 border-t-2 pt-3" style={{ borderColor: `${settings.primaryColor}22` }}>
                <p className="truncate font-semibold uppercase tracking-[0.2em]" style={{ fontSize: fonts.info, color: '#000' }}>
                  {label.info}
                </p>
              </div>
            </div>
          </div>
        );

      case LabelTemplate.STRIPED:
        return (
          <div className="flex w-full h-full items-stretch border-l-[8mm] shadow-inner" style={{ borderColor: settings.primaryColor, width: '100%' }}>
            <div className={`flex-1 pl-10 flex flex-col justify-center overflow-hidden ${isPimaco365 ? 'pr-16 pt-4' : ''}`}>
              <h2 className="font-semibold uppercase truncate leading-none italic" style={{ fontSize: fonts.title, color: '#000' }}>
                {label.title || 'TÍTULO'}
              </h2>
              <p className="font-semibold truncate mt-1.5 text-black uppercase tracking-tighter" style={{ fontSize: fonts.subtitle }}>
                {label.subtitle}
              </p>
              <p className="truncate mt-2 font-medium italic border-l-4 border-slate-200 pl-3" style={{ fontSize: fonts.info, color: '#666' }}>
                {label.info}
              </p>
            </div>
          </div>
        );

      case LabelTemplate.BADGE:
        return (
          <div className={`flex flex-col w-full items-center justify-center text-center px-4 ${isPimaco365 ? 'pt-16' : ''}`}>
            <div
              className={`${isPimaco365 ? 'px-16 py-3' : 'px-10 py-2'} mb-4 font-semibold text-white uppercase tracking-[0.2em] shadow-md italic`}
              style={{ backgroundColor: settings.primaryColor, fontSize: fonts.subtitle, borderBottom: '1mm solid #ED1C24', WebkitPrintColorAdjust: 'exact' }}
            >
              {label.title || 'TÍTULO'}
            </div>
            <p className="font-semibold leading-tight uppercase truncate w-full" style={{ fontSize: fonts.title, color: '#000' }}>
              {label.subtitle}
            </p>
            <p className="mt-3 font-semibold uppercase text-black tracking-widest" style={{ fontSize: fonts.info }}>
              {label.info}
            </p>
          </div>
        );

      case LabelTemplate.MINIMAL:
      default:
        return (
          <div className={`flex flex-col w-full justify-center ${isPimaco365 ? 'pt-16' : ''}`}>
            <h2 className={`font-semibold truncate mb-2 uppercase tracking-tighter ${isPimaco365 ? 'text-center' : ''}`} style={{ fontSize: fonts.title, color: '#000' }}>
              {label.title || 'TÍTULO'}
            </h2>
            <div className={`h-1.5 w-24 bg-[#ED1C24] mb-3 ${isPimaco365 ? 'mx-auto' : ''}`} style={{ WebkitPrintColorAdjust: 'exact' }}></div>
            <p className={`font-semibold truncate uppercase text-black ${isPimaco365 ? 'text-center' : ''}`} style={{ fontSize: fonts.subtitle }}>
              {label.subtitle}
            </p>
            <p className={`truncate mt-3 font-medium opacity-40 uppercase italic ${isPimaco365 ? 'text-center' : ''}`} style={{ fontSize: fonts.info }}>
              {label.info}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="label-container" style={containerStyle}>
      {renderMarker()}
      {renderTemplate()}
    </div>
  );
};