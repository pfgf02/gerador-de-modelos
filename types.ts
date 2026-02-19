
export enum LabelSize {
  LARGE = 'LARGE',      // 153 x 48
  SMALL = 'SMALL',      // 118 x 30
  SMALL_FILE = 'SMALL_FILE' // 50 x 30 (Pasta Suspensa)
}

export enum LabelFontSize {
  DISCRETE = 'DISCRETE',
  NORMAL = 'NORMAL',
  PROMINENT = 'PROMINENT'
}

export enum LabelTemplate {
  MINIMAL = 'MINIMAL',
  CORPORATE = 'CORPORATE',
  STRIPED = 'STRIPED',
  BADGE = 'BADGE',
  GRID = 'GRID'
}

export interface LabelData {
  id: string;
  title: string;
  subtitle: string;
  info: string;
  year: string;
  markerColor: string;
  showMarker: boolean;
  gridItems?: string[]; // 8 itens para 4 linhas x 2 colunas
}

export interface AppSettings {
  size: LabelSize;
  fontSize: LabelFontSize;
  template: LabelTemplate;
  primaryColor: string;
  logoUrl: string | null;
  globalTitle: string;
}
