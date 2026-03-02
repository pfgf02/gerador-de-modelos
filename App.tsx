
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Printer, ImageIcon, Sparkles, Settings2, Layout, Table as TableIcon, Eye, Download, Type, Palette, FolderOpen, Grid3X3, ChevronDown, ChevronUp, Package, Hash, User, MapPin } from 'lucide-react';
import { LabelData, LabelSize, LabelTemplate, AppSettings, LabelFontSize, MarkerShape } from './types';
import { LabelSheet } from './components/LabelSheet';
import { LabelItem } from './components/LabelItem';

const DEFAULT_LOGO_SVG = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjMDA2MEI2Ii8+CjxwYXRoIGQ9Ik03MCAzMEM5MCAzMCAxMDAgNTAgMTAwIDcwQzEwMCA5MCA4MCAxMDAgNjAgMTAwQzQwIDEwMCAzMCA4MCAzMCA2MEMzMCA0MCA1MCAzMCA3MCAzMFoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMiIvPgo8cGF0aCBkPSJNMjUwIDExMEw0MDAgMzkwSDExMEwyNTAgMTEwWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTAgNDBDNDAgMjAgNjAgNjAgMTAwIDQwQzE0MCAyMCAxNjAgNjAgMjAwIDQwQzI0MCAyMCAyNjAgNjAgMzAwIDQwQzM0MCAyMCAzNjAgNjAgNDAwIDQwQzQ0MCAyMCA0NjAgNjAgNTAwIDQwVjBIMFY0MFoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOCIvPgo8L3N2Zz4=`;

const App: React.FC = () => {
  const [labels, setLabels] = useState<LabelData[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'manual' | 'industrial'>('industrial');

  // Sync active tab to URL for deep linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'manual' || tab === 'industrial') {
      setActiveTab(tab);
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', activeTab);
    window.history.replaceState({}, '', url);
  }, [activeTab]);
  const [settings, setSettings] = useState<AppSettings>({
    size: LabelSize.PIMACO_365,
    fontSize: LabelFontSize.NORMAL,
    template: LabelTemplate.INDUSTRIAL,
    primaryColor: '#0060B6',
    logoUrl: null,
    globalTitle: '',
    showDashedLines: true
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Estados do Gerador de Lote
  const [batchForm, setBatchForm] = useState({
    cliente: '',
    ambiente: '',
    pedido: '',
    quantidade: 1,
    inicioSequencia: 1,
    markerShape: MarkerShape.TRIANGLE,
    markerColor: '#ED1C24'
  });

  const generateBatch = () => {
    const newLabels: LabelData[] = [];
    for (let i = 0; i < batchForm.quantidade; i++) {
      newLabels.push({
        id: Math.random().toString(36).substr(2, 9) + i,
        title: batchForm.ambiente.toUpperCase() || 'AMBIENTE',
        subtitle: batchForm.cliente.toUpperCase() || 'CLIENTE',
        info: batchForm.pedido || 'Nº PEDIDO',
        year: new Date().getFullYear().toString(),
        markerColor: batchForm.markerColor,
        showMarker: true,
        markerShape: batchForm.markerShape,
        volume: batchForm.inicioSequencia + i
      });
    }
    setLabels([...labels, ...newLabels]);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLabel = () => {
    const isIndustrial = settings.template === LabelTemplate.INDUSTRIAL;
    const newLabel: LabelData = {
      id: Math.random().toString(36).substr(2, 9),
      title: isIndustrial ? 'AMBIENTE' : 'TÍTULO DA ETIQUETA',
      subtitle: isIndustrial ? 'CLIENTE' : 'SUBTÍTULO',
      info: isIndustrial ? 'PEDIDO' : 'INFORMAÇÃO ADICIONAL',
      year: new Date().getFullYear().toString(),
      markerColor: settings.primaryColor,
      showMarker: isIndustrial,
      markerShape: MarkerShape.CIRCLE,
      volume: 1,
      gridItems: Array(8).fill('')
    };
    setLabels([...labels, newLabel]);
    setExpandedRow(newLabel.id);
  };

  const removeLabel = (id: string) => {
    setLabels(labels.filter(l => l.id !== id));
  };

  const updateLabel = (id: string, field: keyof LabelData, value: any) => {
    setLabels(labels.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const updateGridItem = (labelId: string, index: number, value: string) => {
    setLabels(labels.map(l => {
      if (l.id === labelId) {
        const gridItems = [...(l.gridItems || Array(8).fill(''))];
        gridItems[index] = value;
        return { ...l, gridItems };
      }
      return l;
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
        localStorage.setItem('label_generator_logo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const savedLogo = localStorage.getItem('label_generator_logo');
    if (savedLogo) {
      setSettings(prev => ({ ...prev, logoUrl: savedLogo }));
    }
  }, []);

  const handlePrint = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    window.print();
    setIsGenerating(false);
  };

  const isPimaco365 = settings.size === LabelSize.PIMACO_365;

  return (
    <div className="min-h-screen bg-[#f1f7ff] flex flex-col font-sans selection:bg-brand-blue selection:text-white text-slate-800">
      <div className="no-print flex-grow pb-24">
        {/* Top Branding Bar */}
        <div className="bg-brand-blue h-1.5 w-full shadow-[0_2px_10px_rgba(0,96,182,0.3)]"></div>

        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 overflow-hidden">
          {/* Bahia Panoramic Banner Concept */}
          <div className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none overflow-hidden select-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-100/50 to-transparent"></div>
            <div className="w-full h-full flex items-center justify-around px-20">
              <div className="flex flex-col items-center gap-2 transform -rotate-12 opacity-50">
                <div className="w-16 h-1 bg-amber-200 rounded-full"></div>
                <div className="w-12 h-1 bg-amber-100 rounded-full"></div>
              </div>
              <div className="flex flex-col items-center gap-3 scale-150 opacity-40">
                <div className="w-8 h-8 rounded-full border-2 border-slate-200"></div>
                <div className="w-1 h-20 bg-slate-100 rounded-full"></div>
              </div>
              <div className="flex gap-4 items-end opacity-30">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-1.5 bg-blue-200 rounded-t-full" style={{ height: `${i * 15}px` }}></div>
                ))}
              </div>
              <div className="flex flex-col items-center gap-2 transform rotate-6 opacity-40">
                <div className="w-10 h-10 border-4 border-amber-200/50 rounded-sm"></div>
                <div className="w-20 h-2 bg-amber-100/50 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="w-full px-6 py-4 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand-blue to-blue-700 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100">
                    <div className="w-7 h-7 bg-brand-blue flex items-center justify-center rounded-lg shadow-lg">
                      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-white"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900 uppercase italic leading-none flex items-center gap-2">
                    ETIQUETAS <span className="text-brand-blue italic not-uppercase font-serif lowercase opacity-50">pro</span>
                  </h1>
                  <p className="text-brand-blue/60 text-[10px] font-medium mt-1.5 tracking-[0.25em] uppercase">Estação de Padronização Industrial</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-px bg-slate-200 hidden md:block mx-2"></div>
                <button
                  onClick={handlePrint}
                  disabled={isGenerating || labels.length === 0}
                  className={`relative flex items-center gap-3 overflow-hidden rounded-xl px-10 py-4 text-[10px] font-semibold tracking-widest uppercase transition-all shadow-lg active:scale-95 group ${isGenerating || labels.length === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                    : 'bg-brand-red text-white hover:bg-red-700 hover:shadow-red-200/50'
                    }`}
                >
                  <Printer className={`w-4 h-4 ${isGenerating ? 'animate-bounce' : 'group-hover:translate-y-[-1px] transition-transform'}`} />
                  {isGenerating ? 'Processando Documento...' : 'Gerar Pack PDF'}
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-8">
            {/* Action Card */}
            <section className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden translate-y-0 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex p-1 bg-slate-50 border-b">
                <button
                  onClick={() => setActiveTab('industrial')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-medium uppercase tracking-wider transition-all ${activeTab === 'industrial'
                    ? 'bg-white text-brand-blue shadow-sm ring-1 ring-brand-blue/10'
                    : 'text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5'
                    }`}
                >
                  <Package className={`w-4 h-4 ${activeTab === 'industrial' ? 'text-brand-blue' : 'text-slate-300'}`} />
                  Lote Industrial
                </button>
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-medium uppercase tracking-wider transition-all ${activeTab === 'manual'
                    ? 'bg-white text-brand-blue shadow-sm ring-1 ring-brand-blue/10'
                    : 'text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5'
                    }`}
                >
                  <Plus className={`w-4 h-4 ${activeTab === 'manual' ? 'text-brand-blue' : 'text-slate-300'}`} />
                  Adição Manual
                </button>
              </div>

              <div className="p-8">
                {activeTab === 'industrial' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-5">
                      <div className="col-span-2">
                        <label htmlFor="cliente-input" className="block text-[10px] font-medium text-brand-blue uppercase mb-2 tracking-wide">Identificação do Cliente</label>
                        <div className="relative group">
                          <User aria-hidden="true" className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                          <input
                            id="cliente-input"
                            type="text"
                            maxLength={20}
                            autocomplete="organization"
                            spellcheck="false"
                            value={batchForm.cliente}
                            onChange={e => setBatchForm({ ...batchForm, cliente: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-11 text-xs font-semibold uppercase outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/10 focus-visible:border-brand-blue transition-colors"
                            placeholder="CLIENTE FINAL OU PROJETO"
                          />
                        </div>
                      </div>

                      <div className="col-span-1">
                        <label htmlFor="ambiente-input" className="block text-[10px] font-medium text-brand-blue uppercase mb-2 tracking-wide">Ambiente</label>
                        <div className="relative group">
                          <MapPin aria-hidden="true" className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                          <input
                            id="ambiente-input"
                            type="text"
                            maxLength={20}
                            autocomplete="street-address"
                            value={batchForm.ambiente}
                            onChange={e => setBatchForm({ ...batchForm, ambiente: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-11 text-xs font-semibold uppercase outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/10 focus-visible:border-brand-blue transition-colors"
                            placeholder="EX: COZINHA"
                          />
                        </div>
                      </div>

                      <div className="col-span-1">
                        <label htmlFor="pedido-input" className="block text-[10px] font-medium text-brand-blue uppercase mb-2 tracking-wide">Nº Pedido</label>
                        <div className="relative group">
                          <Hash aria-hidden="true" className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                          <input
                            id="pedido-input"
                            type="text"
                            autocomplete="off"
                            value={batchForm.pedido}
                            onChange={e => setBatchForm({ ...batchForm, pedido: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-11 text-xs font-semibold uppercase outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/10 focus-visible:border-brand-blue transition-colors"
                            placeholder="0000"
                          />
                        </div>
                      </div>

                      <div className="col-span-1">
                        <label htmlFor="marcador-select" className="block text-[10px] font-medium text-brand-blue uppercase mb-2 tracking-wide">Marcador</label>
                        <select
                          id="marcador-select"
                          value={batchForm.markerShape}
                          onChange={e => setBatchForm({ ...batchForm, markerShape: e.target.value as MarkerShape })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-semibold uppercase outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/10 focus-visible:border-brand-blue transition-colors appearance-none cursor-pointer"
                        >
                          <option value={MarkerShape.TRIANGLE}>▲ Triângulo</option>
                          <option value={MarkerShape.CIRCLE}>● Círculo</option>
                          <option value={MarkerShape.SQUARE}>■ Quadrado</option>
                          <option value={MarkerShape.NONE}>Nenhum</option>
                        </select>
                      </div>

                      <div className="col-span-1">
                        <label className="block text-[10px] font-medium text-brand-blue uppercase mb-2 tracking-wide">Cor Ident.</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={batchForm.markerColor}
                            onChange={e => setBatchForm({ ...batchForm, markerColor: e.target.value })}
                            className="h-11 w-12 cursor-pointer bg-white rounded-lg border border-slate-200 p-1"
                          />
                          <div className="flex-1 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl p-2 text-[10px] font-mono text-slate-500 uppercase">
                            {batchForm.markerColor}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-1">
                        <label className="block text-[10px] font-medium text-brand-blue uppercase mb-2 tracking-wide">Quantidade</label>
                        <input
                          type="number"
                          min={1}
                          value={batchForm.quantidade}
                          onFocus={e => e.target.select()}
                          onChange={e => setBatchForm({ ...batchForm, quantidade: parseInt(e.target.value) || 1 })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-semibold uppercase outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all"
                        />
                      </div>

                      <div className="col-span-1">
                        <label className="block text-[10px] font-medium text-brand-blue uppercase mb-2 tracking-wide">Início Seq.</label>
                        <input
                          type="number"
                          min={1}
                          value={batchForm.inicioSequencia}
                          onFocus={e => e.target.select()}
                          onChange={e => setBatchForm({ ...batchForm, inicioSequencia: parseInt(e.target.value) || 1 })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-semibold uppercase outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      onClick={generateBatch}
                      className="w-full bg-brand-blue hover:bg-blue-700 text-white rounded-xl p-4 font-semibold uppercase text-xs tracking-[0.15em] transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-blue-200 mt-2 group"
                    >
                      <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      Gerar Pack de Lote
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 py-4">
                    <div className="p-4 bg-brand-blue/5 rounded-2xl border border-brand-blue/10 italic">
                      <p className="text-[10px] font-semibold text-brand-blue uppercase tracking-wide leading-relaxed">
                        Modo especializado para etiquetas individuais, lombadas de pasta e sinalização avulsa.
                      </p>
                    </div>
                    <button
                      onClick={addLabel}
                      className="w-full bg-brand-blue hover:bg-blue-700 text-white rounded-xl p-4 font-semibold uppercase text-xs tracking-[0.15em] transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-blue-200 group"
                    >
                      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Nova Etiqueta Manual
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Global Settings Card */}
            <section className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <Settings2 className="w-4 h-4 text-slate-400" />
                </div>
                <h2 className="font-semibold uppercase text-[11px] tracking-[0.2em] text-brand-blue">Propriedades Globais</h2>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-medium text-brand-blue/50 uppercase mb-3 tracking-wide flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" /> Logotipo Institucional
                  </label>
                  <div className="flex flex-col gap-2">
                    {settings.logoUrl ? (
                      <div className="relative group rounded-2xl overflow-hidden border border-slate-200">
                        <div className="w-full h-24 bg-slate-50 flex items-center justify-center p-4">
                          <img src={settings.logoUrl} className="max-h-full max-w-full object-contain drop-shadow-sm" alt="Logo Preview" />
                        </div>
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px] flex items-center justify-center gap-3">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white p-2.5 rounded-xl hover:scale-110 transition-transform shadow-lg"
                            title="Alterar Logo"
                          >
                            <ImageIcon className="w-4 h-4 text-slate-900" />
                          </button>
                          <button
                            onClick={() => {
                              setSettings({ ...settings, logoUrl: null });
                              localStorage.removeItem('label_generator_logo');
                            }}
                            className="bg-white p-2.5 rounded-xl hover:scale-110 transition-transform shadow-lg group/trash"
                            title="Remover Logo"
                          >
                            <Trash2 className="w-4 h-4 text-red-500 group-hover/trash:text-red-600" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-brand-blue/40 transition-all flex flex-col items-center justify-center gap-3 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-5 h-5 text-slate-300 group-hover:text-brand-blue transition-colors" />
                        </div>
                        <span className="text-[9px] font-semibold uppercase text-slate-400 tracking-widest group-hover:text-brand-blue transition-colors">Vincular Logotipo</span>
                      </button>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase mb-3 tracking-wide flex items-center gap-2">
                    <Layout className="w-3 h-3" /> Formato do Papel
                  </label>
                  <select
                    value={settings.size}
                    onChange={(e) => setSettings({ ...settings, size: e.target.value as LabelSize })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl p-3.5 font-medium uppercase outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all appearance-none cursor-pointer"
                  >
                    <option value={LabelSize.PIMACO_365}>Standard: Pimaco A4365 (99x67.7)</option>
                    <option value={LabelSize.LARGE}>Pasta: Lombo Largo (153x48)</option>
                    <option value={LabelSize.SMALL}>Pasta: Lombo Estreito (118x30)</option>
                    <option value={LabelSize.SMALL_FILE}>Sinalização: Pasta Suspensa (50x30)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase mb-3 tracking-wide flex items-center gap-2">
                    <Palette className="w-3 h-3" /> Estilo de Design
                  </label>
                  <select
                    value={settings.template}
                    onChange={(e) => setSettings({ ...settings, template: e.target.value as LabelTemplate })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl p-3.5 font-medium uppercase outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all appearance-none cursor-pointer"
                  >
                    <option value={LabelTemplate.INDUSTRIAL}>Layout Industrial v2</option>
                    <option value={LabelTemplate.CORPORATE}>Corporativo Clean</option>
                    <option value={LabelTemplate.BADGE}>Badge de Expedição</option>
                    <option value={LabelTemplate.GRID}>Grade de Controles (8 Itens)</option>
                    <option value={LabelTemplate.STRIPED}>Ident. Listrada (High-Vis)</option>
                    <option value={LabelTemplate.MINIMAL}>Essencial Minimalista</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase mb-3 tracking-wide flex items-center gap-2">
                    <Type className="w-3 h-3" /> Densidade Tipográfica
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: LabelFontSize.DISCRETE, label: 'Small' },
                      { val: LabelFontSize.NORMAL, label: 'Med' },
                      { val: LabelFontSize.PROMINENT, label: 'Large' }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => setSettings({ ...settings, fontSize: opt.val as LabelFontSize })}
                        className={`py-3 rounded-xl text-[9px] font-semibold uppercase tracking-tighter transition-all border-2 ${settings.fontSize === opt.val
                          ? 'border-brand-blue bg-brand-blue/5 text-brand-blue'
                          : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:text-slate-600'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase mb-3 tracking-wide flex items-center gap-2">
                    <Grid3X3 className="w-3 h-3" /> Linhas de Corte
                  </label>
                  <button
                    onClick={() => setSettings({ ...settings, showDashedLines: !settings.showDashedLines })}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${settings.showDashedLines
                      ? 'border-brand-blue bg-brand-blue/5 text-brand-blue'
                      : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-widest pl-2">
                      {settings.showDashedLines ? 'Exibir Tracejado' : 'Ocultar Tracejado'}
                    </span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.showDashedLines ? 'bg-brand-blue' : 'bg-slate-200'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.showDashedLines ? 'left-6' : 'left-1'}`}></div>
                    </div>
                  </button>
                </div>
              </div>
            </section>
          </aside>

          <div className="lg:col-span-8 space-y-10">
            {labels.length > 0 ? (
              <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 md:top-[88px] z-40 backdrop-blur-sm bg-white/90">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-brand-blue flex items-center justify-center text-white shadow-lg shadow-brand-blue/20">
                      <TableIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-slate-900 font-semibold uppercase text-sm tracking-widest">Painel de Composição</h2>
                      <p className="text-slate-400 text-[9px] font-medium uppercase tracking-widest mt-0.5">{labels.length} Etiquetas geradas</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (labels.length > 0 && confirm('Tem certeza que deseja remover todas as etiquetas do pack atual? Esta ação não pode ser desfeita.')) {
                        setLabels([]);
                      }
                    }}
                    aria-label="Limpar pack de etiquetas"
                    className="flex items-center gap-2 text-[10px] bg-slate-100/50 hover:bg-brand-red hover:text-white px-6 py-3 rounded-xl font-semibold uppercase tracking-widest transition-colors active:scale-95 group shadow-sm shadow-slate-100 focus-visible:ring-4 focus-visible:ring-brand-red/20 focus-visible:outline-none"
                  >
                    <Trash2 aria-hidden="true" className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Limpar Pack
                  </button>
                </div>

                <div className="bg-slate-50 p-10 flex items-center justify-center min-h-[500px] overflow-hidden border-b border-slate-100">
                  <div className="relative w-full flex justify-center items-start">
                    <div
                      className="origin-top transition-all duration-700 ease-out"
                      style={{
                        transform: 'scale(0.85)',
                        marginBottom: '-10%'
                      }}
                    >
                      <div className="shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] bg-white rounded-sm ring-1 ring-slate-900/5">
                        <LabelItem
                          label={labels.find(l => l.id === expandedRow) || labels[0]}
                          settings={settings}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-semibold border-b border-slate-100">
                        <th className="px-8 py-5">Identificação</th>
                        <th className="px-8 py-5 text-center">Referência</th>
                        <th className="px-8 py-5 text-center">Codificação</th>
                        <th className="px-8 py-5 w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {labels.map((label) => (
                        <React.Fragment key={label.id}>
                          <tr
                            onClick={() => setExpandedRow(expandedRow === label.id ? null : label.id)}
                            className={`group cursor-pointer transition-all duration-300 ${expandedRow === label.id
                              ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
                              : 'hover:bg-slate-50/80 bg-white text-slate-700'
                              }`}
                          >
                            <td className="px-8 py-6">
                              <div className="flex flex-col gap-1">
                                <span className={`text-[13px] font-semibold uppercase tracking-tight ${expandedRow === label.id ? 'text-white' : 'text-slate-900'}`}>
                                  {label.title}
                                </span>
                                <span className={`text-[10px] font-medium uppercase tracking-wide opacity-60`}>
                                  {label.subtitle}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest ${expandedRow === label.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                }`}>
                                {settings.template === LabelTemplate.INDUSTRIAL ? `SEQ ${label.volume}` : label.year}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex justify-center items-center">
                                <div
                                  className={`w-4 h-4 shadow-sm transition-transform group-hover:scale-110 ${expandedRow === label.id ? 'ring-2 ring-white/50' : 'ring-1 ring-slate-200'}`}
                                  style={{
                                    backgroundColor: label.markerColor,
                                    borderRadius: label.markerShape === MarkerShape.CIRCLE ? '50%' : '2px'
                                  }}
                                />
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className={`p-1.5 rounded-lg transition-colors ${expandedRow === label.id ? 'bg-white/20' : 'bg-slate-50'}`}>
                                {expandedRow === label.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 opacity-40" />}
                              </div>
                            </td>
                          </tr>

                          {expandedRow === label.id && (
                            <tr className="bg-white">
                              <td colSpan={4} className="p-0">
                                <div className="p-10 bg-gradient-to-b from-brand-blue/5 to-white animate-in slide-in-from-top-4 duration-500">
                                  <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                      <div className="flex items-center gap-3 border-b border-brand-blue/10 pb-3">
                                        <Type className="w-4 h-4 text-brand-blue" />
                                        <h4 className="text-[10px] font-semibold uppercase tracking-widest text-brand-blue">Configuração de Texto</h4>
                                      </div>
                                      <div className="space-y-5">
                                        <div>
                                          <label className="block text-[9px] font-medium text-slate-400 uppercase mb-2 tracking-wide">Título Principal</label>
                                          <input
                                            type="text"
                                            value={label.title}
                                            onChange={e => updateLabel(label.id, 'title', e.target.value.toUpperCase())}
                                            className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs font-medium uppercase outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all shadow-sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[9px] font-medium text-slate-400 uppercase mb-2 tracking-wide">Subtítulo / Cliente</label>
                                          <input
                                            type="text"
                                            value={label.subtitle}
                                            onChange={e => updateLabel(label.id, 'subtitle', e.target.value.toUpperCase())}
                                            className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs font-medium uppercase outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all shadow-sm"
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <label className="block text-[9px] font-medium text-slate-400 uppercase mb-2 tracking-wide">Info Adicional</label>
                                            <input
                                              type="text"
                                              value={label.info}
                                              onChange={e => updateLabel(label.id, 'info', e.target.value)}
                                              className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs font-medium uppercase outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all shadow-sm"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[9px] font-medium text-slate-400 uppercase mb-2 tracking-wide">{settings.template === LabelTemplate.INDUSTRIAL ? 'Volume' : 'Ano'}</label>
                                            <input
                                              type={settings.template === LabelTemplate.INDUSTRIAL ? 'number' : 'text'}
                                              value={settings.template === LabelTemplate.INDUSTRIAL ? label.volume : label.year}
                                              onFocus={e => e.target.select()}
                                              onChange={e => updateLabel(label.id, settings.template === LabelTemplate.INDUSTRIAL ? 'volume' : 'year', e.target.value)}
                                              className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs font-medium uppercase outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all shadow-sm"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-6">
                                      <div className="flex items-center gap-3 border-b border-brand-blue/10 pb-3">
                                        <Palette className="w-4 h-4 text-brand-blue" />
                                        <h4 className="text-[10px] font-semibold uppercase tracking-widest text-brand-blue">Estilização do Marcador</h4>
                                      </div>
                                      <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-5">
                                          <div>
                                            <label className="block text-[9px] font-medium text-slate-400 uppercase mb-2 tracking-wide">Cor do Identificador</label>
                                            <div className="flex gap-2">
                                              <div className="relative group/color">
                                                <input
                                                  type="color"
                                                  value={label.markerColor}
                                                  onChange={e => updateLabel(label.id, 'markerColor', e.target.value)}
                                                  className="h-11 w-12 cursor-pointer bg-white rounded-xl border border-slate-200 p-1"
                                                />
                                              </div>
                                              <input
                                                type="text"
                                                value={label.markerColor}
                                                onChange={e => updateLabel(label.id, 'markerColor', e.target.value)}
                                                className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-[10px] font-mono font-medium uppercase outline-none focus:border-brand-blue transition-all shadow-sm"
                                              />
                                            </div>
                                          </div>
                                          <div>
                                            <label className="block text-[9px] font-medium text-slate-400 uppercase mb-2 tracking-wide">Geometria</label>
                                            <select
                                              value={label.markerShape}
                                              onChange={e => updateLabel(label.id, 'markerShape', e.target.value)}
                                              className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs font-medium uppercase outline-none focus:border-brand-blue transition-all appearance-none cursor-pointer shadow-sm"
                                            >
                                              <option value={MarkerShape.CIRCLE}>Círculo</option>
                                              <option value={MarkerShape.SQUARE}>Quadrado</option>
                                              <option value={MarkerShape.TRIANGLE}>Triângulo</option>
                                              <option value={MarkerShape.NONE}>Nenhum</option>
                                            </select>
                                          </div>
                                        </div>

                                        <div className="pt-4 border-t border-brand-blue/5">
                                          <button
                                            onClick={() => removeLabel(label.id)}
                                            className="w-full flex items-center justify-center gap-3 p-4 rounded-xl text-[10px] font-semibold uppercase tracking-widest text-brand-red bg-brand-red/5 border border-brand-red/10 hover:bg-brand-red/10 transition-all group/del"
                                          >
                                            <Trash2 className="w-4 h-4 group-hover/del:rotate-12 transition-transform" />
                                            Eliminar Etiqueta do Pack
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    {settings.template === LabelTemplate.GRID && (
                                      <div className="col-span-1 md:col-span-2 mt-4 space-y-6 bg-slate-900 rounded-2xl p-8 shadow-2xl">
                                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                          <Grid3X3 className="w-5 h-5 text-brand-blue/60" />
                                          <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white">Conteúdo da Grade de Dados</h4>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                          {(label.gridItems || Array(8).fill('')).map((item, idx) => (
                                            <div key={idx}>
                                              <label className="block text-[8px] font-medium text-slate-500 uppercase mb-2 tracking-widest">Canal {idx + 1}</label>
                                              <input
                                                type="text"
                                                value={item}
                                                onChange={e => updateGridItem(label.id, idx, e.target.value.toUpperCase())}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] font-semibold text-white uppercase outline-none focus:border-brand-blue focus:bg-white/10 transition-all"
                                                placeholder="---"
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[600px] border-2 border-dashed border-slate-200 rounded-[40px] bg-white p-20 text-center animate-in fade-in zoom-in duration-700">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 relative">
                  <Package className="w-10 h-10 text-slate-200" />
                  <div className="absolute inset-0 border-2 border-slate-100 rounded-full animate-ping opacity-20"></div>
                </div>
                <h3 className="text-xl font-semibold uppercase tracking-[0.3em] text-slate-800 mb-3">Aguardando Lote</h3>
                <p className="text-slate-400 text-[11px] max-w-sm leading-relaxed font-medium uppercase tracking-widest opacity-60">
                  Inicie a composição do seu pack industrial através do painel de controle lateral ou adicione itens manuais.
                </p>
                <div className="mt-10 flex gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-blue animate-bounce"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-blue/60 animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-blue/30 animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div >

      <div className="print-only">
        <LabelSheet labels={labels} settings={settings} />
      </div>

      {/* Footer / Status Bar */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 px-10 fixed bottom-0 w-full z-50 flex items-center justify-between shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2" aria-live="polite">
            <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse shadow-[0_0_8px_rgba(0,96,182,0.5)]"></div>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-brand-blue/60">System Ready</span>
          </div>
          <div className="h-3 w-px bg-slate-200"></div>
          <span className="text-[9px] font-semibold uppercase tracking-widest text-brand-blue/30">Padrão: {isPimaco365 ? 'Pimaco A4365' : settings.size}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300">
          <Sparkles className="w-3 h-3" />
          <span className="text-[9px] font-semibold uppercase tracking-widest text-brand-blue/40">Smart Label Pro v2.5</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
