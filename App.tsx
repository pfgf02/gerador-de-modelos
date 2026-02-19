
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Printer, ImageIcon, Sparkles, Settings2, Layout, Table as TableIcon, Eye, Download, Type, Palette, FolderOpen, Grid3X3, ChevronDown, ChevronUp } from 'lucide-react';
import { LabelData, LabelSize, LabelTemplate, AppSettings, LabelFontSize } from './types';
import { LabelSheet } from './components/LabelSheet';
import { LabelItem } from './components/LabelItem';

const DEFAULT_LOGO_SVG = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjMkIxRDkyIi8+CjxwYXRoIGQ9Ik03MCAzMEM5MCAzMCAxMDAgNTAgMTAwIDcwQzEwMCA5MCA4MCAxMDAgNjAgMTAwQzQwIDEwMCAzMCA4MCAzMCA2MEMzMCA0MCA1MCAzMCA3MCAzMFoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMiIvPgo8cGF0aCBkPSJNMjUwIDExMEw0MDAgMzkwSDExMEwyNTAgMTEwWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTAgNDBDNDAgMjAgNjAgNjAgMTAwIDQwQzE0MCAyMCAxNjAgNjAgMjAwIDQwQzI0MCAyMCAyNjAgNjAgMzAwIDQwQzM0MCAyMCAzNjAgNjAgNDAwIDQwQzQ0MCAyMCA0NjAgNjAgNTAwIDQwVjBIMFY0MFoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOCIvPgo8L3N2Zz4=`;

const DEFAULT_LABELS: LabelData[] = [
  { id: '1', title: 'ALMOXARIFADO', subtitle: 'MATERIAIS DE ESCRITÓRIO', info: 'PEDIDOS SEMANAIS', year: '', markerColor: '#ed1c24', showMarker: true, gridItems: Array(8).fill('') },
  { id: '2', title: 'CONTABILIDADE', subtitle: 'BALANCETES MENSAIS', info: 'EXERCÍCIO 2024', year: '', markerColor: '#2b1d92', showMarker: true, gridItems: Array(8).fill('') },
  { id: '3', title: 'LOGÍSTICA', subtitle: 'CONTROLE DE FROTAS', info: 'MANUTENÇÃO PREVENTIVA', year: '', markerColor: '#ed1c24', showMarker: false, gridItems: Array(8).fill('') },
];

const App: React.FC = () => {
  const [labels, setLabels] = useState<LabelData[]>(DEFAULT_LABELS);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    size: LabelSize.LARGE,
    fontSize: LabelFontSize.NORMAL,
    template: LabelTemplate.CORPORATE,
    primaryColor: '#2b1d92',
    logoUrl: DEFAULT_LOGO_SVG,
    globalTitle: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLabel = () => {
    const newLabel: LabelData = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'NOVA ETIQUETA',
      subtitle: 'Descrição principal',
      info: 'Informações detalhadas',
      year: '',
      markerColor: settings.primaryColor,
      showMarker: true,
      gridItems: Array(8).fill('')
    };
    setLabels([...labels, newLabel]);
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
        const newGrid = [...(l.gridItems || Array(8).fill(''))];
        newGrid[index] = value;
        return { ...l, gridItems: newGrid };
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
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = async () => {
    setIsGenerating(true);

    // Pequeno delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 500));

    // Método nativo: disparar o diálogo de impressão diretamente
    // Com as classes CSS corretas no index.html, o navegador cuida de tudo
    window.print();

    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <div className="no-print flex-grow pb-20">
        <header className="shadow-2xl mb-8 relative">
          <div className="h-2 bg-[#ed1c24] w-full"></div>
          <div className="bg-[#2b1d92] text-white p-6 border-b-4 border-white">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white p-1 rounded-lg shadow-inner flex items-center justify-center">
                  <img src={settings.logoUrl || DEFAULT_LOGO_SVG} className="max-h-full max-w-full" alt="Logo" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">ETiquetas</h1>
                  <p className="text-blue-200 text-xs font-bold mt-1 tracking-widest uppercase opacity-80">Padronização Profissional</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handlePrint}
                  disabled={isGenerating}
                  className={`flex items-center gap-3 ${isGenerating ? 'bg-slate-400' : 'bg-[#ed1c24] hover:bg-red-700'} text-white px-10 py-4 rounded-md font-black transition-all shadow-lg active:scale-95 group uppercase text-sm tracking-widest`}
                >
                  <Printer className={`w-5 h-5 ${isGenerating ? 'animate-bounce' : 'group-hover:animate-pulse'}`} />
                  {isGenerating ? 'Preparando...' : 'Imprimir Etiquetas'}
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 space-y-6">
            <section className="bg-white rounded-none border-l-8 border-[#2b1d92] shadow-md overflow-hidden">
              <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Visualização Real</span>
                <Eye className="w-4 h-4 text-[#2b1d92]" />
              </div>
              <div className="p-8 flex justify-center bg-slate-200/50 relative min-h-[160px]">
                <div className="scale-[0.45] sm:scale-[0.55] origin-center shadow-2xl flex items-center justify-center">
                  <LabelItem
                    label={labels.find(l => l.id === expandedRow) || labels[0] || DEFAULT_LABELS[0]}
                    settings={settings}
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-none border-l-8 border-[#ed1c24] shadow-md p-6 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Settings2 className="w-5 h-5 text-[#ed1c24]" />
                <h2 className="font-black uppercase text-sm tracking-wider text-slate-800">Painel de Controle</h2>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Tipo de Etiqueta</label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => setSettings({ ...settings, size: LabelSize.LARGE })}
                      className={`py-2 px-3 text-[10px] font-bold uppercase border-2 transition-all text-left flex justify-between items-center ${settings.size === LabelSize.LARGE ? 'bg-[#2b1d92] text-white border-[#2b1d92]' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                    >
                      Lombo Largo (153x48)
                      <Layout className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, size: LabelSize.SMALL })}
                      className={`py-2 px-3 text-[10px] font-bold uppercase border-2 transition-all text-left flex justify-between items-center ${settings.size === LabelSize.SMALL ? 'bg-[#2b1d92] text-white border-[#2b1d92]' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                    >
                      Lombo Estreito (118x30)
                      <Layout className="w-3 h-3 scale-y-75" />
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, size: LabelSize.SMALL_FILE })}
                      className={`py-2 px-3 text-[10px] font-bold uppercase border-2 transition-all text-left flex justify-between items-center ${settings.size === LabelSize.SMALL_FILE ? 'bg-[#2b1d92] text-white border-[#2b1d92]' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                    >
                      Suspensa (50x30)
                      <FolderOpen className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Template de Design</label>
                  <select
                    value={settings.template}
                    onChange={(e) => setSettings({ ...settings, template: e.target.value as LabelTemplate })}
                    className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 text-xs rounded-none p-3 font-bold uppercase transition-all focus:border-[#2b1d92] outline-none"
                  >
                    <option value={LabelTemplate.CORPORATE}>Corporativo</option>
                    <option value={LabelTemplate.MINIMAL}>Minimalista</option>
                    <option value={LabelTemplate.STRIPED}>Banda Lateral</option>
                    <option value={LabelTemplate.BADGE}>Emblema</option>
                    <option value={LabelTemplate.GRID}>Tabela Informativa (8 Itens)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Impacto Visual</label>
                  <select
                    value={settings.fontSize}
                    onChange={(e) => setSettings({ ...settings, fontSize: e.target.value as LabelFontSize })}
                    className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 text-xs rounded-none p-3 font-bold uppercase transition-all focus:border-[#2b1d92] outline-none"
                  >
                    <option value={LabelFontSize.DISCRETE}>Discreta</option>
                    <option value={LabelFontSize.NORMAL}>Normal</option>
                    <option value={LabelFontSize.PROMINENT}>Exibida</option>
                  </select>
                </div>
              </div>
            </section>
          </aside>

          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white shadow-md border-t-4 border-[#2b1d92] overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TableIcon className="w-5 h-5 text-[#2b1d92]" />
                  <h2 className="text-slate-800 font-black uppercase text-xs tracking-[0.2em]">Editor de Lotes</h2>
                </div>
                <button
                  onClick={addLabel}
                  className="flex items-center gap-2 text-[10px] bg-[#2b1d92] hover:bg-blue-800 text-white px-6 py-3 font-black uppercase tracking-widest transition-all active:scale-95 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Inserir Etiqueta
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[9px] uppercase tracking-[0.2em] font-black border-b border-slate-200">
                      <th className="px-6 py-4">Estrutura</th>
                      <th className="px-6 py-4">Conteúdo</th>
                      <th className="px-6 py-4 w-24 text-center">Tag</th>
                      <th className="px-6 py-4 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {labels.map((label) => (
                      <React.Fragment key={label.id}>
                        <tr className={`transition-colors group ${expandedRow === label.id ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1">
                              <input
                                type="text"
                                value={label.title}
                                onChange={(e) => updateLabel(label.id, 'title', e.target.value)}
                                className="w-full bg-transparent border-b border-transparent focus:border-[#2b1d92] px-2 py-0.5 text-xs font-black text-slate-800 uppercase outline-none"
                                placeholder="TÍTULO"
                              />
                              <input
                                type="text"
                                value={label.subtitle}
                                onChange={(e) => updateLabel(label.id, 'subtitle', e.target.value)}
                                className="w-full bg-transparent border-b border-transparent focus:border-[#2b1d92] px-2 py-0.5 text-xs text-slate-600 font-bold outline-none"
                                placeholder="SUBTÍTULO"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={label.info}
                                onChange={(e) => updateLabel(label.id, 'info', e.target.value)}
                                className="flex-1 bg-transparent border-b border-transparent focus:border-[#2b1d92] px-2 py-1 text-xs text-slate-500 outline-none"
                                placeholder="INFO EXTRA"
                              />
                              {settings.template === LabelTemplate.GRID && (
                                <button
                                  onClick={() => setExpandedRow(expandedRow === label.id ? null : label.id)}
                                  className={`p-2 rounded-md transition-all ${expandedRow === label.id ? 'bg-[#2b1d92] text-white shadow-md' : 'text-[#2b1d92] bg-blue-50 hover:bg-blue-100'}`}
                                  title="Editar Grade de Informações"
                                >
                                  <Grid3X3 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center gap-3 justify-center">
                              <input
                                type="checkbox"
                                checked={label.showMarker}
                                onChange={(e) => updateLabel(label.id, 'showMarker', e.target.checked)}
                                className="accent-[#2b1d92] w-4 h-4 cursor-pointer"
                              />
                              <div className="relative">
                                <div
                                  className="w-5 h-5 rounded-sm border shadow-sm"
                                  style={{ backgroundColor: label.markerColor }}
                                />
                                <input
                                  type="color"
                                  value={label.markerColor}
                                  onChange={(e) => updateLabel(label.id, 'markerColor', e.target.value)}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 pr-6">
                            <button
                              onClick={() => removeLabel(label.id)}
                              className="p-2 text-slate-300 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                        {expandedRow === label.id && settings.template === LabelTemplate.GRID && (
                          <tr className="bg-blue-50/40 border-l-4 border-[#2b1d92]">
                            <td colSpan={4} className="px-8 py-6">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Array(8).fill(0).map((_, idx) => (
                                  <div key={idx} className="flex flex-col gap-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                      Campo {idx + 1}
                                    </label>
                                    <input
                                      type="text"
                                      value={(label.gridItems || Array(8).fill(''))[idx]}
                                      onChange={(e) => updateGridItem(label.id, idx, e.target.value)}
                                      className="bg-white border border-slate-200 text-xs p-2 focus:ring-1 focus:ring-[#2b1d92] outline-none shadow-sm"
                                      placeholder={`Item ${idx + 1}`}
                                    />
                                  </div>
                                ))}
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
          </div>
        </main>
      </div>

      <div className="print-only">
        <LabelSheet labels={labels} settings={settings} />
      </div>
    </div>
  );
};

export default App;
