import React from 'react';
import { LabelData, AppSettings, LabelSize } from '../types';
import { LabelItem } from './LabelItem';

interface LabelSheetProps {
  labels: LabelData[];
  settings: AppSettings;
}

export const LabelSheet: React.FC<LabelSheetProps> = ({ labels, settings }) => {
  const isLarge = settings.size === LabelSize.LARGE;
  const isSmallFile = settings.size === LabelSize.SMALL_FILE;

  // Determinação precisa de etiquetas por página baseada nas dimensões do papel A4 (210x297mm)
  // Large (153x48): cabe 1 col x 6 linhas (48*6=288mm)
  // Small (118x30): cabe 1 col x 9 linhas (30*9=270mm)
  // Suspensa (50x30): cabe 4 col x 9 linhas (50*4=200mm, 30*9=270mm)

  let labelsPerPage = isLarge ? 6 : 9;
  if (isSmallFile) labelsPerPage = 32; // 4 colunas x 8 linhas (seguro)

  const pages: LabelData[][] = [];
  for (let i = 0; i < labels.length; i += labelsPerPage) {
    pages.push(labels.slice(i, i + labelsPerPage));
  }

  if (pages.length === 0) {
    return null;
  }

  // Define a estrutura de grid para cada tipo
  const getGridStyle = (): React.CSSProperties => {
    if (isSmallFile) {
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 50mm)',
        gridAutoRows: '30mm',
        gap: '2mm',
        justifyContent: 'center',
      };
    }
    return {
      display: 'grid',
      gridTemplateColumns: isLarge ? '153mm' : '118mm',
      gridAutoRows: isLarge ? '48mm' : '30mm',
      gap: '2mm',
      justifyContent: 'center',
    };
  };

  return (
    <div className="labels-sheet-container">
      {pages.map((pageLabels, pageIdx) => (
        <div key={pageIdx} className="a4-page">
          <div style={getGridStyle()}>
            {pageLabels.map((label) => (
              <div
                key={label.id}
                className="label-print-wrapper"
                style={{
                  boxSizing: 'border-box',
                  overflow: 'hidden'
                }}
              >
                <LabelItem label={label} settings={settings} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};