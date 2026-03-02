
export enum LabelSize {
  LARGE = 'LARGE',      // 153 x 48
  SMALL = 'SMALL',      // 118 x 30
  SMALL_FILE = 'SMALL_FILE', // 50 x 30 (Pasta Suspensa)
  PIMACO_365 = 'PIMACO_365' // 99 x 67.7 (Pimaco A4365)
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
  GRID = 'GRID',
  INDUSTRIAL = 'INDUSTRIAL' // Novo layout Pimaco
}

export enum MarkerShape {
  CIRCLE = 'CIRCLE',
  SQUARE = 'SQUARE',
  TRIANGLE = 'TRIANGLE',
  NONE = 'NONE'
}

export interface LabelData {
  id: string;
  title: string;      // Usado como Ambiente no Industrial
  subtitle: string;   // Usado como Cliente no Industrial
  info: string;       // Usado como Numero do Pedido no Industrial
  year: string;
  markerColor: string;
  showMarker: boolean;
  markerShape?: MarkerShape; // Novo campo
  volume?: number;           // Novo campo para sequencial
  gridItems?: string[];
}

export interface AppSettings {
  size: LabelSize;
  fontSize: LabelFontSize;
  template: LabelTemplate;
  primaryColor: string;
  logoUrl: string | null;
  globalTitle: string;
  showDashedLines: boolean;
}
