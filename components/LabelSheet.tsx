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

  const isPimaco365 = settings.size === LabelSize.PIMACO_365;

  let labelsPerPage = isLarge ? 6 : 9;
  if (isSmallFile) labelsPerPage = 32;
  if (isPimaco365) labelsPerPage = 8;

  const pages: LabelData[][] = [];
  for (let i = 0; i < labels.length; i += labelsPerPage) {
    pages.push(labels.slice(i, i + labelsPerPage));
  }

  if (pages.length === 0) {
    return null;
  }

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
    if (isPimaco365) {
      return {
        display: 'grid',
        gridTemplateColumns: '99mm 99mm',
        gridTemplateRows: '67.7mm 67.7mm 67.7mm 67.7mm',
        justifyContent: 'center',
        alignContent: 'center',
        width: '210mm',
        height: '297mm'
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