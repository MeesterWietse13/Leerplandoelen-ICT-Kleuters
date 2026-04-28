import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  CheckCircle2, ChevronUp, Info, Lightbulb,
  LayoutList, Save, AlertCircle, PlayCircle, Loader2, Cloud,
  Baby, Rocket
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { LEERPLAN_DATA } from './data';

const GROUPS = {
  kleuters: { name: 'Kleuters', ages: ['Leeftijd 3-4', 'Leeftijd 4-5', 'Leeftijd 5-6'], icon: Baby, color: 'bg-pink-500' }
};

const THEME_COLORS = {
  "Digitale informatievaardigheid": { bg: "bg-sky-50", border: "border-sky-300", header: "bg-sky-600", text: "text-sky-800" },
  "Mediawijsheid": { bg: "bg-rose-50", border: "border-rose-300", header: "bg-rose-600", text: "text-rose-800" },
  "Computationeel denken": { bg: "bg-purple-50", border: "border-purple-300", header: "bg-purple-600", text: "text-purple-800" },
  "Digitale creatie": { bg: "bg-amber-50", border: "border-amber-300", header: "bg-amber-600", text: "text-amber-800" }
};

const FormattedText = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let currentList = [];

  const pushList = () => {
    if (currentList.length > 0) {
      elements.push(<ul key={`ul-${elements.length}`} className="list-disc pl-5 mb-3 space-y-1.5 text-slate-700">{[...currentList]}</ul>);
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      currentList.push(<li key={index} className="pl-1">{trimmed.substring(1).trim()}</li>);
    } else {
      pushList();
      if (trimmed) elements.push(<p key={index} className="mb-1.5 font-semibold text-slate-800">{trimmed}</p>);
    }
  });
  pushList();
  return <div className="mt-1 text-sm">{elements}</div>;
};

const GoalRow = ({ goal, currentStatus, onStatusChange, concreet, onConcreetSave, leerlijn, onLeerlijnSave, lesideeen, onLesideeSave }) => {
  const [expanded, setExpanded] = useState(false);
  const [showConcreet, setShowConcreet] = useState(false);
  const [showLesideeen, setShowLesideeen] = useState(false);
  const [showLeerlijn, setShowLeerlijn] = useState(false);

  const [localConcreet, setLocalConcreet] = useState(concreet || '');
  const [localLeerlijn, setLocalLeerlijn] = useState(leerlijn || '');
  
  const [newLesideeTitel, setNewLesideeTitel] = useState('');
  const [newLesideeTekst, setNewLesideeTekst] = useState('');

  const hasExtraInfo = goal.mia || goal.begrippen || goal.voorbeelden;

  // Sync local state when props change (e.g. after load)
  useEffect(() => { setLocalConcreet(concreet || ''); }, [concreet]);
  useEffect(() => { setLocalLeerlijn(leerlijn || ''); }, [leerlijn]);

  const handleAddLesidee = () => {
    if (!newLesideeTitel.trim() || !newLesideeTekst.trim()) return;
    const updated = [...(lesideeen || []), { title: newLesideeTitel, content: newLesideeTekst, id: Date.now() }];
    onLesideeSave(goal.id, updated);
    setNewLesideeTitel('');
    setNewLesideeTekst('');
  };

  const handleDeleteLesidee = (id) => {
    const updated = (lesideeen || []).filter(item => item.id !== id);
    onLesideeSave(goal.id, updated);
  };

  return (
    <div className="flex flex-col border-b border-slate-200 hover:bg-white transition-colors bg-white/50">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between p-4 gap-4">
        <div className="flex-grow flex items-start gap-4">
          <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded mt-1 shrink-0 border border-slate-200">
            {goal.id}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800 leading-snug">
              {goal.leerdoel}
              {goal.niveau && (
                <span className={`inline-flex ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border align-middle tracking-wider ${
                  goal.niveau === 'B' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                  goal.niveau === 'G' ? 'bg-teal-100 text-teal-800 border-teal-300' :
                  goal.niveau === 'E' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                  'bg-slate-100 text-slate-800 border-slate-300'
                }`}>
                  {goal.niveau === 'B' ? 'Begrijpen' : goal.niveau === 'G' ? 'Gebruiken' : goal.niveau === 'E' ? 'Engageren' : goal.niveau}
                </span>
              )}
            </span>
            {goal.leeftijdsgroepen && (
              <div className="flex flex-wrap gap-2 mt-1.5">
                {goal.leeftijdsgroepen.map(age => (
                  <span key={age} className="text-[10px] font-bold text-slate-400 border-l-2 border-slate-200 pl-1.5 py-0">
                    {age.replace('Leeftijd ', '')}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-3 mt-3">
              {hasExtraInfo && (
                <button onClick={() => setExpanded(!expanded)} className="text-xs font-medium text-slate-500 hover:text-blue-600 flex items-center w-max">
                  {expanded ? <ChevronUp size={14} className="mr-1"/> : <Info size={14} className="mr-1"/>}
                  {expanded ? "Verberg info" : "Toon details"}
                </button>
              )}
              <button 
                onClick={() => setShowConcreet(!showConcreet)} 
                className={`text-xs font-medium flex items-center px-2 py-1 rounded transition-colors ${showConcreet ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:text-blue-600'}`}
              >
                <LayoutList size={14} className="mr-1"/> Concreet
              </button>
              <button 
                onClick={() => setShowLesideeen(!showLesideeen)} 
                className={`text-xs font-medium flex items-center px-2 py-1 rounded transition-colors ${showLesideeen ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:text-amber-600'}`}
              >
                <Lightbulb size={14} className="mr-1"/> Lesideeën
              </button>
              <button 
                onClick={() => setShowLeerlijn(!showLeerlijn)} 
                className={`text-xs font-medium flex items-center px-2 py-1 rounded transition-colors ${showLeerlijn ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:text-purple-600'}`}
              >
                <Rocket size={14} className="mr-1"/> Leerlijn
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 shrink-0 self-end xl:self-auto">
          <button onClick={() => onStatusChange(goal.id, 'goed')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center border transition-all ${currentStatus === 'goed' ? 'bg-green-100 border-green-500 text-green-700 shadow-inner' : 'bg-white border-slate-300 text-slate-500 hover:bg-green-50'}`}>
            <CheckCircle2 size={14} className={`mr-1.5 ${currentStatus === 'goed' ? 'text-green-600' : 'text-slate-400'}`}/> Doen we al
          </button>
          <button onClick={() => onStatusChange(goal.id, 'iets')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center border transition-all ${currentStatus === 'iets' ? 'bg-blue-100 border-blue-500 text-blue-700 shadow-inner' : 'bg-white border-slate-300 text-slate-500 hover:bg-blue-50'}`}>
            <PlayCircle size={14} className={`mr-1.5 ${currentStatus === 'iets' ? 'text-blue-600' : 'text-slate-400'}`}/> Deels
          </button>
          <button onClick={() => onStatusChange(goal.id, 'blinde_vlek')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center border transition-all ${currentStatus === 'blinde_vlek' ? 'bg-rose-100 border-rose-500 text-rose-700 shadow-inner' : 'bg-white border-slate-300 text-slate-500 hover:bg-rose-50'}`}>
            <AlertCircle size={14} className={`mr-1.5 ${currentStatus === 'blinde_vlek' ? 'text-rose-600' : 'text-slate-400'}`}/> Werkpunt
          </button>
        </div>
      </div>

      {/* Details Section */}
      {expanded && hasExtraInfo && (
        <div className="px-14 pb-5 pt-3 bg-slate-50/80 text-slate-700 space-y-4 border-t border-slate-200">
          {goal.mia && <div><strong className="text-slate-900 block border-b pb-1 mb-2 uppercase text-xs">MIA</strong><FormattedText text={goal.mia} /></div>}
          {goal.begrippen && <div><strong className="text-slate-900 block border-b pb-1 mb-2 uppercase text-xs">Begrippen</strong><p className="text-sm">{goal.begrippen}</p></div>}
          {goal.voorbeelden && <div><strong className="text-slate-900 block border-b pb-1 mb-2 uppercase text-xs">Voorbeelden</strong><FormattedText text={goal.voorbeelden} /></div>}
        </div>
      )}

      {/* Concreet Section */}
      {showConcreet && (
        <div className="px-14 pb-5 pt-3 bg-blue-50 border-t border-blue-200">
          <strong className="text-blue-900 block border-b border-blue-200 pb-1 mb-2 uppercase text-xs">Concreet</strong>
          <textarea 
            value={localConcreet} 
            onChange={(e) => setLocalConcreet(e.target.value)}
            placeholder="Vul hier aan hoe je dit doel concreet maakt..."
            className="w-full min-h-[120px] p-3 text-sm border border-blue-200 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <div className="flex justify-end mt-2">
            <button 
              onClick={() => onConcreetSave(goal.id, localConcreet)}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center hover:bg-blue-700 transition-colors"
            >
              <Save size={14} className="mr-1.5"/> Opslaan
            </button>
          </div>
        </div>
      )}

      {/* Lesideeën Section */}
      {showLesideeen && (
        <div className="px-14 pb-5 pt-3 bg-amber-50 border-t border-amber-200">
          <strong className="text-amber-900 block border-b border-amber-200 pb-1 mb-2 uppercase text-xs">Lesideeën</strong>
          
          <div className="space-y-4 mb-4">
            {(lesideeen || []).map((idee) => (
              <div key={idee.id} className="bg-white p-4 rounded-lg border border-amber-200 shadow-sm relative group">
                <button onClick={() => handleDeleteLesidee(idee.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                  <AlertCircle size={16} />
                </button>
                <h4 className="font-bold text-slate-800 mb-1">{idee.title}</h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{idee.content}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/60 p-4 rounded-lg border border-dashed border-amber-300">
            <input 
              type="text" 
              value={newLesideeTitel}
              onChange={(e) => setNewLesideeTitel(e.target.value)}
              placeholder="Titel van het lesidee..."
              className="w-full p-2 mb-2 text-sm border border-amber-200 rounded-md focus:ring-1 focus:ring-amber-500 outline-none"
            />
            <textarea 
              value={newLesideeTekst}
              onChange={(e) => setNewLesideeTekst(e.target.value)}
              placeholder="Omschrijving van het lesidee..."
              className="w-full min-h-[150px] p-3 text-sm border border-amber-200 rounded-md focus:ring-1 focus:ring-amber-500 outline-none"
            />
            <div className="flex justify-end mt-2">
              <button 
                onClick={handleAddLesidee}
                className="bg-amber-600 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center hover:bg-amber-700 transition-colors"
              >
                <Save size={14} className="mr-1.5"/> Lesidee opslaan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leerlijn Section */}
      {showLeerlijn && (
        <div className="px-14 pb-5 pt-3 bg-purple-50 border-t border-purple-200">
          <strong className="text-purple-900 block border-b border-purple-200 pb-1 mb-2 uppercase text-xs">Leerlijn</strong>
          <input 
            type="text"
            value={localLeerlijn}
            onChange={(e) => setLocalLeerlijn(e.target.value)}
            placeholder="Bijv: 2e kleuterklas trimester 2"
            className="w-full p-3 text-sm border border-purple-200 rounded-md bg-white focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <div className="flex justify-end mt-2">
            <button 
              onClick={() => onLeerlijnSave(goal.id, localLeerlijn)}
              className="bg-purple-600 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center hover:bg-purple-700 transition-colors"
            >
              <Save size={14} className="mr-1.5"/> Opslaan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SubthemeGroup = ({ onderwerp, subthema, goals, statuses, note, onStatusChange, onNoteChange, onNoteBlur, concreetData, onConcreetSave, leerlijnData, onLeerlijnSave, lesideeenData, onLesideeSave }) => {
  const theme = THEME_COLORS[onderwerp] || THEME_COLORS["Digitale informatievaardigheid"];
  return (
    <div className={`mb-8 rounded-xl overflow-hidden shadow-md border ${theme.border}`}>
      <div className={`${theme.header} px-5 py-3 text-white flex justify-between items-center`}>
        <h3 className="font-bold text-lg">{subthema}</h3>
      </div>
      <div className={theme.bg}>
        {goals.map(g => (
          <GoalRow 
            key={g.id} 
            goal={g} 
            currentStatus={statuses[g.id]} 
            onStatusChange={onStatusChange}
            concreet={concreetData?.[g.id]}
            onConcreetSave={onConcreetSave}
            leerlijn={leerlijnData?.[g.id]}
            onLeerlijnSave={onLeerlijnSave}
            lesideeen={lesideeenData?.[g.id]}
            onLesideeSave={onLesideeSave}
          />
        ))}
      </div>
      <div className="p-5 bg-white border-t border-slate-200">
        <label className={`block text-sm font-bold uppercase mb-2 flex items-center ${theme.text}`}>
          <Lightbulb size={16} className="mr-2" /> Onze gezamenlijke aanpak voor "{subthema}"
        </label>
        <textarea value={note || ''} onChange={(e) => onNoteChange(subthema, e.target.value)} onBlur={onNoteBlur} placeholder="Typ hier jullie afspraken of lesintegratie..." className="w-full min-h-[100px] p-3 border rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
        <div className="flex justify-end mt-1 text-slate-400 text-[10px] font-bold uppercase"><Cloud size={12} className="mr-1"/> Slaat automatisch op</div>
      </div>
    </div>
  );
};

export default function App() {
  const [selectedGroup, setSelectedGroup] = useState('kleuters'); // Default to kleuters
  const [loadingDb, setLoadingDb] = useState(false);
  const [statuses, setStatuses] = useState({});
  const [notes, setNotes] = useState({});
  const [concreet, setConcreet] = useState({});
  const [lesideeen, setLesideeen] = useState({});
  const [leerlijn, setLeerlijn] = useState({});

  useEffect(() => {
    if (!selectedGroup) return;
    setLoadingDb(true);
    
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('ict_plan')
        .select('*')
        .eq('groep', selectedGroup)
        .single();

      if (data) {
        setStatuses(data.statuses || {});
        setNotes(data.notes || {});
        setConcreet(data.concreet || {});
        setLesideeen(data.lesideeen || {});
        setLeerlijn(data.leerlijn || {});
      } else {
        setStatuses({});
        setNotes({});
        setConcreet({});
        setLesideeen({});
        setLeerlijn({});
      }
      setLoadingDb(false);
    };
    fetchData();
  }, [selectedGroup]);

  const filteredData = useMemo(() => {
    if (!selectedGroup) return [];
    const ages = GROUPS[selectedGroup].ages;
    return LEERPLAN_DATA.filter(d => d.leeftijdsgroepen.some(age => ages.includes(age)));
  }, [selectedGroup]);

  const onderwerpen = useMemo(() => [...new Set(filteredData.map(d => d.onderwerp))], [filteredData]);
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    if (onderwerpen.length > 0 && !activeTab) setActiveTab(onderwerpen[0]);
  }, [onderwerpen, activeTab]);

  const persistData = async (updates) => {
    await supabase.from('ict_plan').upsert({
      groep: selectedGroup,
      statuses,
      notes,
      concreet,
      lesideeen,
      leerlijn,
      ...updates
    }, { onConflict: 'groep' });
  };

  const handleStatusChange = async (goalId, newStatus) => {
    const statusToSet = statuses[goalId] === newStatus ? null : newStatus;
    const newStatuses = { ...statuses, [goalId]: statusToSet };
    setStatuses(newStatuses);
    persistData({ statuses: newStatuses });
  };

  const handleNoteChange = (subthema, newNote) => setNotes(prev => ({ ...prev, [subthema]: newNote }));
  const handleNoteBlur = async () => persistData({ notes });

  const handleConcreetSave = (goalId, value) => {
    const updated = { ...concreet, [goalId]: value };
    setConcreet(updated);
    persistData({ concreet: updated });
  };

  const handleLeerlijnSave = (goalId, value) => {
    const updated = { ...leerlijn, [goalId]: value };
    setLeerlijn(updated);
    persistData({ leerlijn: updated });
  };

  const handleLesideeSave = (goalId, list) => {
    const updated = { ...lesideeen, [goalId]: list };
    setLesideeen(updated);
    persistData({ lesideeen: updated });
  };

  const groupedGoals = useMemo(() => {
    if (!selectedGroup) return {};
    const goalsForTab = filteredData.filter(d => d.onderwerp === activeTab);
    const groups = {};
    goalsForTab.forEach(goal => {
      if (!groups[goal.subthema]) groups[goal.subthema] = [];
      groups[goal.subthema].push(goal);
    });
    return groups;
  }, [filteredData, activeTab, selectedGroup]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col md:flex-row">
      {/* Sticky Sidebar */}
      <div className="w-full md:w-72 bg-white shadow-md flex-shrink-0 flex flex-col z-10 md:sticky md:top-0 md:h-screen">
        <div className="p-6 border-b border-slate-100 bg-slate-800 text-white relative">
          <h1 className="text-xl font-extrabold mb-1">{GROUPS[selectedGroup].name}</h1>
          <p className="text-slate-400 text-sm font-medium">ICT Leerplandoelen</p>
        </div>
        
        <div className="p-4 flex-grow overflow-y-auto">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Domeinen</h2>
          <nav className="space-y-2">
            {onderwerpen.map(onderwerp => {
              const theme = THEME_COLORS[onderwerp] || THEME_COLORS["Digitale informatievaardigheid"];
              return (
                <button key={onderwerp} onClick={() => { setActiveTab(onderwerp); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`w-full text-left px-3 py-3 rounded-lg text-sm font-bold transition-all border-l-4 ${ activeTab === onderwerp ? `${theme.bg} ${theme.text} ${theme.border} shadow-sm` : 'bg-white border-transparent text-slate-600 hover:bg-slate-50'}`}>
                  {onderwerp}
                </button>
              );
            })}
          </nav>
          <div className="mt-8 pt-6 border-t border-slate-200">
            <button 
              onClick={() => { setActiveTab('Leerlijn Overzicht'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center shadow-md ${ activeTab === 'Leerlijn Overzicht' ? 'bg-purple-600 text-white' : 'bg-white border text-slate-800 hover:bg-slate-50'}`}
            >
              <Rocket size={18} className="mr-2" /> Leerlijn Overzicht
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Natural Scroll */}
      <div className="flex-grow bg-slate-100 min-h-screen">
        {loadingDb ? (
          <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-blue-500 w-10 h-10" /></div>
        ) : (
          <div className="max-w-5xl mx-auto p-6 md:p-10 pb-20">
            {activeTab === 'Leerlijn Overzicht' ? (
              <div className="animate-in fade-in duration-300">
                <div className="mb-8 flex justify-between items-center">
                  <h2 className="text-3xl font-extrabold text-slate-800">Leerlijn Overzicht</h2>
                  <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-bold border border-purple-200">
                    Totaal gepland: {Object.values(leerlijn).filter(v => v && v.trim() !== '').length} doelen
                  </div>
                </div>

                <div className="space-y-10">
                  {onderwerpen.map(onderwerp => {
                    const goalsInOnderwerp = filteredData.filter(d => d.onderwerp === onderwerp);
                    return (
                      <div key={onderwerp} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className={`${THEME_COLORS[onderwerp]?.header || 'bg-slate-800'} px-6 py-4 text-white uppercase tracking-wider text-sm font-black`}>
                          {onderwerp}
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-3 font-bold text-slate-600 w-24">ID</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Leerplandoel</th>
                                <th className="px-6 py-3 font-bold text-purple-700 bg-purple-50/50">Wanneer (Leerlijn)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {goalsInOnderwerp.map(goal => (
                                <tr key={goal.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-6 py-4 font-mono text-xs text-slate-400 align-top">{goal.id}</td>
                                  <td className="px-6 py-4">
                                    <div className="text-slate-700 font-medium leading-relaxed mb-1.5">{goal.leerdoel}</div>
                                    {goal.leeftijdsgroepen && (
                                      <div className="flex flex-wrap gap-2">
                                        {goal.leeftijdsgroepen.map(age => (
                                          <span key={age} className="text-[10px] font-bold text-slate-400 border-l-2 border-slate-200 pl-1.5 leading-none">
                                            {age.replace('Leeftijd ', '')}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 bg-purple-50/30 align-top">
                                    {leerlijn[goal.id] ? (
                                      <span className="text-purple-800 font-bold">{leerlijn[goal.id]}</span>
                                    ) : (
                                      <span className="text-slate-300 italic">Nog niet ingevuld</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <div className="mb-8">
                  <h2 className={`text-3xl font-extrabold mb-2 ${THEME_COLORS[activeTab]?.text || 'text-slate-800'}`}>{activeTab}</h2>
                </div>
                <div className="space-y-8">
                  {Object.entries(groupedGoals).map(([subthema, goals]) => (
                    <SubthemeGroup 
                      key={subthema} 
                      onderwerp={activeTab} 
                      subthema={subthema} 
                      goals={goals} 
                      statuses={statuses} 
                      note={notes[subthema]} 
                      onStatusChange={handleStatusChange} 
                      onNoteChange={handleNoteChange} 
                      onNoteBlur={handleNoteBlur}
                      concreetData={concreet}
                      onConcreetSave={handleConcreetSave}
                      leerlijnData={leerlijn}
                      onLeerlijnSave={handleLeerlijnSave}
                      lesideeenData={lesideeen}
                      onLesideeSave={handleLesideeSave}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
