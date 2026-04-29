import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  CheckCircle2, ChevronUp, Info, Lightbulb,
  LayoutList, Save, AlertCircle, PlayCircle, Loader2, Cloud,
  Baby, Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './supabaseClient';
import { LEERPLAN_DATA } from './data';

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
  
  const [concreetSaved, setConcreetSaved] = useState(false);
  const [lesideeSaved, setLesideeSaved] = useState(false);
  const [leerlijnSaved, setLeerlijnSaved] = useState(false);

  const [concreetError, setConcreetError] = useState(false);
  const [lesideeError, setLesideeError] = useState(false);
  const [leerlijnError, setLeerlijnError] = useState(false);

  const [newLesideeTitel, setNewLesideeTitel] = useState('');
  const [newLesideeTekst, setNewLesideeTekst] = useState('');

  const hasExtraInfo = goal.mia || goal.begrippen || goal.voorbeelden;

  // Sync local state when props change (e.g. after load)
  useEffect(() => { setLocalConcreet(concreet || ''); }, [concreet]);
  useEffect(() => { setLocalLeerlijn(leerlijn || ''); }, [leerlijn]);

  const handleConcreetSaveAction = async () => {
    const success = await onConcreetSave(goal.id, localConcreet);
    if (success) {
      setConcreetSaved(true);
      setConcreetError(false);
      setTimeout(() => setConcreetSaved(false), 2000);
    } else {
      setConcreetError(true);
      setTimeout(() => setConcreetError(false), 3000);
    }
  };

  const handleAddLesidee = async () => {
    if (!newLesideeTitel.trim() || !newLesideeTekst.trim()) return;
    const updated = [...(lesideeen || []), { title: newLesideeTitel, content: newLesideeTekst, id: Date.now() }];
    const success = await onLesideeSave(goal.id, updated);
    if (success) {
      setLesideeSaved(true);
      setLesideeError(false);
      setTimeout(() => setLesideeSaved(false), 2000);
      setNewLesideeTitel('');
      setNewLesideeTekst('');
    } else {
      setLesideeError(true);
      setTimeout(() => setLesideeError(false), 3000);
    }
  };

  const handleLeerlijnSaveAction = async () => {
    const success = await onLeerlijnSave(goal.id, localLeerlijn);
    if (success) {
      setLeerlijnSaved(true);
      setLeerlijnError(false);
      setTimeout(() => setLeerlijnSaved(false), 2000);
    } else {
      setLeerlijnError(true);
      setTimeout(() => setLeerlijnError(false), 3000);
    }
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
              onClick={handleConcreetSaveAction}
              disabled={concreetSaved}
              className={`${concreetSaved ? 'bg-green-600' : concreetError ? 'bg-red-600 animate-bounce' : 'bg-blue-600 hover:bg-blue-700'} text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center transition-all duration-300`}
            >
              {concreetSaved ? (
                <>
                  <CheckCircle2 size={14} className="mr-1.5 animate-in zoom-in duration-300"/> Opgeslagen!
                </>
              ) : concreetError ? (
                <>
                  <AlertCircle size={14} className="mr-1.5"/> Fout bij opslaan
                </>
              ) : (
                <>
                  <Save size={14} className="mr-1.5"/> Opslaan
                </>
              )}
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
                disabled={lesideeSaved}
                className={`${lesideeSaved ? 'bg-green-600' : lesideeError ? 'bg-red-600 animate-bounce' : 'bg-amber-600 hover:bg-amber-700'} text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center transition-all duration-300`}
              >
                {lesideeSaved ? (
                  <>
                    <CheckCircle2 size={14} className="mr-1.5 animate-in zoom-in duration-300"/> Opgeslagen!
                  </>
                ) : lesideeError ? (
                  <>
                    <AlertCircle size={14} className="mr-1.5"/> Fout bij opslaan
                  </>
                ) : (
                  <>
                    <Save size={14} className="mr-1.5"/> Lesidee opslaan
                  </>
                )}
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
              onClick={handleLeerlijnSaveAction}
              disabled={leerlijnSaved}
              className={`${leerlijnSaved ? 'bg-green-600' : leerlijnError ? 'bg-red-600 animate-bounce' : 'bg-purple-600 hover:bg-purple-700'} text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center transition-all duration-300`}
            >
              {leerlijnSaved ? (
                <>
                  <CheckCircle2 size={14} className="mr-1.5 animate-in zoom-in duration-300"/> Opgeslagen!
                </>
              ) : leerlijnError ? (
                <>
                  <AlertCircle size={14} className="mr-1.5"/> Fout bij opslaan
                </>
              ) : (
                <>
                  <Save size={14} className="mr-1.5"/> Opslaan
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SubthemeGroup = ({ onderwerp, subthema, goals, statuses, note, onNoteSave, onStatusChange, concreetData, onConcreetSave, leerlijnData, onLeerlijnSave, lesideeenData, onLesideeSave }) => {
  const theme = THEME_COLORS[onderwerp] || THEME_COLORS["Digitale informatievaardigheid"];
  const [localNote, setLocalNote] = useState(note || '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLocalNote(note || '');
  }, [note]);

  const handleSave = async () => {
    const success = await onNoteSave(subthema, localNote);
    if (success) {
      setSaved(true);
      setError(false);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

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
        <textarea 
          value={localNote} 
          onChange={(e) => setLocalNote(e.target.value)} 
          placeholder="Typ hier jullie afspraken of lesintegratie..." 
          className="w-full min-h-[120px] p-4 border rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
        />
        <div className="flex justify-end mt-3">
          <button 
            onClick={handleSave}
            disabled={saved}
            className={`${saved ? 'bg-green-600' : error ? 'bg-red-600 animate-bounce' : 'bg-slate-800 hover:bg-slate-900'} text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center transition-all duration-300 shadow-md`}
          >
            {saved ? (
              <>
                <CheckCircle2 size={16} className="mr-2 animate-in zoom-in duration-300"/> Afspraak opgeslagen!
              </>
            ) : error ? (
              <>
                <AlertCircle size={16} className="mr-2"/> Fout bij opslaan
              </>
            ) : (
              <>
                <Save size={16} className="mr-2"/> Afspraak opslaan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [schoolLevel, setSchoolLevel] = useState(null); // null (Menu), 'kleuter', 'lager'
  const [selectedGroup, setSelectedGroup] = useState('kleuter');
  const [loadingDb, setLoadingDb] = useState(false);
  const [statuses, setStatuses] = useState({});
  const [notes, setNotes] = useState({});
  const [concreet, setConcreet] = useState({});
  const [lesideeen, setLesideeen] = useState({});
  const [leerlijn, setLeerlijn] = useState({});

  // Lager school specific filters
  const [lagerAges, setLagerAges] = useState([
    'Leeftijd 3-4', 'Leeftijd 4-5', 'Leeftijd 5-6',
    'Leeftijd 6-7', 'Leeftijd 7-8', 'Leeftijd 8-9', 'Leeftijd 9-10', 'Leeftijd 10-11', 'Leeftijd 11-12'
  ]);

  useEffect(() => {
    if (!schoolLevel) return;
    
    const dbKey = schoolLevel; // 'kleuter' or 'lager'
    setSelectedGroup(dbKey);
    setLoadingDb(true);
    
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('ict_plan')
        .select('*')
        .eq('groep', dbKey)
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

    // Realtime subscription setup
    const channel = supabase
      .channel(`ict_plan_realtime_${dbKey}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ict_plan',
          filter: `groep=eq.${dbKey}`,
        },
        (payload) => {
          if (payload.new) {
            setStatuses(payload.new.statuses || {});
            setNotes(payload.new.notes || {});
            setConcreet(payload.new.concreet || {});
            setLesideeen(payload.new.lesideeen || {});
            setLeerlijn(payload.new.leerlijn || {});
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [schoolLevel]);

  const filteredData = useMemo(() => {
    if (!schoolLevel) return [];
    
    if (schoolLevel === 'kleuter') {
      const kleuterAges = ['Leeftijd 3-4', 'Leeftijd 4-5', 'Leeftijd 5-6'];
      return LEERPLAN_DATA.filter(d => d.leeftijdsgroepen.some(age => kleuterAges.includes(age)));
    } else {
      // Lager: Filter by selected ages
      return LEERPLAN_DATA.filter(d => d.leeftijdsgroepen.some(age => lagerAges.includes(age)));
    }
  }, [schoolLevel, lagerAges]);

  const onderwerpen = useMemo(() => [...new Set(LEERPLAN_DATA.map(d => d.onderwerp))], []);
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    if (onderwerpen.length > 0 && !activeTab) setActiveTab(onderwerpen[0]);
  }, [onderwerpen, activeTab]);

  const persistData = async (updates) => {
    if (!schoolLevel) return false;
    const dbKey = schoolLevel;

    // Smart Saving: Fetch latest state first to prevent overwriting other people's work
    const { data: latestData } = await supabase
      .from('ict_plan')
      .select('*')
      .eq('groep', dbKey)
      .single();

    const mergedData = {
      groep: dbKey,
      statuses: { ...(latestData?.statuses || {}), ...(updates.statuses || statuses) },
      notes: { ...(latestData?.notes || {}), ...(updates.notes || notes) },
      concreet: { ...(latestData?.concreet || {}), ...(updates.concreet || concreet) },
      lesideeen: { ...(latestData?.lesideeen || {}), ...(updates.lesideeen || lesideeen) },
      leerlijn: { ...(latestData?.leerlijn || {}), ...(updates.leerlijn || leerlijn) }
    };

    const { error } = await supabase.from('ict_plan').upsert(mergedData, { onConflict: 'groep' });

    if (error) {
      console.error('Opslaan mislukt:', error);
      return false;
    }
    return true;
  };

  const handleStatusChange = async (goalId, newStatus) => {
    const statusToSet = statuses[goalId] === newStatus ? null : newStatus;
    const newStatuses = { ...statuses, [goalId]: statusToSet };
    setStatuses(newStatuses);
    return await persistData({ statuses: newStatuses });
  };

  const handleNoteSave = async (subthema, newNote) => {
    const updated = { ...notes, [subthema]: newNote };
    setNotes(updated);
    return await persistData({ notes: updated });
  };

  const handleConcreetSave = async (goalId, value) => {
    const updated = { ...concreet, [goalId]: value };
    setConcreet(updated);
    return await persistData({ concreet: updated });
  };

  const handleLeerlijnSave = async (goalId, value) => {
    const updated = { ...leerlijn, [goalId]: value };
    setLeerlijn(updated);
    return await persistData({ leerlijn: updated });
  };

  const handleLesideeSave = async (goalId, list) => {
    const updated = { ...lesideeen, [goalId]: list };
    setLesideeen(updated);
    return await persistData({ lesideeen: updated });
  };

  const toggleLagerAge = (age) => {
    setLagerAges(prev => 
      prev.includes(age) ? prev.filter(a => a !== age) : [...prev, age]
    );
  };

  const groupedGoals = useMemo(() => {
    if (!schoolLevel) return {};
    const goalsForTab = filteredData.filter(d => d.onderwerp === activeTab);
    const groups = {};
    goalsForTab.forEach(goal => {
      if (!groups[goal.subthema]) groups[goal.subthema] = [];
      groups[goal.subthema].push(goal);
    });
    return groups;
  }, [filteredData, activeTab, schoolLevel]);

  return (
    <AnimatePresence mode="wait">
      {!schoolLevel ? (
        <motion.div 
          key="menu"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="min-h-screen bg-slate-100 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-slate-100 to-purple-100"
        >
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 flex flex-col items-center text-center group cursor-pointer" 
              onClick={() => setSchoolLevel('kleuter')}
            >
              <div className="bg-pink-500 p-6 rounded-2xl mb-6 shadow-lg shadow-pink-200 group-hover:rotate-6 transition-transform">
                <Baby size={64} className="text-white" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-4">Kleuterschool</h2>
              <p className="text-slate-500 mb-8 text-sm leading-relaxed">ICT-leerdoelen voor de jongste ontdekkers.<br/>Focus op spelend leren en eerste digitale ervaringen.</p>
              <button className="bg-pink-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-pink-600 transition-colors">Starten</button>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100 flex flex-col items-center text-center group cursor-pointer" 
              onClick={() => setSchoolLevel('lager')}
            >
              <div className="bg-blue-600 p-6 rounded-2xl mb-6 shadow-lg shadow-blue-200 group-hover:-rotate-6 transition-transform">
                <Rocket size={64} className="text-white" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-4">Lagere School</h2>
              <p className="text-slate-500 mb-8 text-sm leading-relaxed">ICT-leerdoelen voor 6 tot 12 jaar.<br/>Ontwikkeling van vaardigheden, creatie en mediawijsheid.</p>
              <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-colors">Starten</button>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col md:flex-row"
        >
          {/* Sticky Sidebar */}
          <div className="w-full md:w-72 bg-white shadow-md flex-shrink-0 flex flex-col z-10 md:sticky md:top-0 md:h-screen transition-all">
            <div className={`p-6 border-b border-slate-100 text-white relative ${schoolLevel === 'kleuter' ? 'bg-pink-600' : 'bg-blue-700'}`}>
              <button onClick={() => setSchoolLevel(null)} className="absolute top-2 right-2 text-white/50 hover:text-white transition-colors">
                <LayoutList size={16} />
              </button>
              <h1 className="text-xl font-extrabold mb-1">{schoolLevel === 'kleuter' ? 'Kleuterschool' : 'Lagere School'}</h1>
              <p className="text-white/70 text-xs font-medium uppercase tracking-widest">Digitale Competenties</p>
            </div>
            
            <div className="p-4 flex-grow overflow-y-auto">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Domeinen</h2>
              <nav className="space-y-1">
                {onderwerpen.map(onderwerp => {
                  const theme = THEME_COLORS[onderwerp] || THEME_COLORS["Digitale informatievaardigheid"];
                  return (
                    <button 
                      key={onderwerp} 
                      onClick={() => { setActiveTab(onderwerp); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold transition-all border-l-4 ${ activeTab === onderwerp ? `${theme.bg} ${theme.text} ${theme.border} shadow-sm` : 'bg-white border-transparent text-slate-600 hover:bg-slate-50'}`}
                    >
                      {onderwerp}
                    </button>
                  );
                })}
              </nav>
              <div className="mt-6 pt-6 border-t border-slate-100">
                <button 
                  onClick={() => { setActiveTab('Leerlijn Overzicht'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center shadow-lg ${ activeTab === 'Leerlijn Overzicht' ? 'bg-purple-600 text-white' : 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-50'}`}
                >
                  <Rocket size={18} className="mr-2" /> Leerlijn Overzicht
                </button>
              </div>
              
              <div className="mt-8">
                <button onClick={() => setSchoolLevel(null)} className="w-full text-center text-slate-400 hover:text-slate-600 text-xs font-bold uppercase transition-colors">
                  Terug naar hoofdmenu
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-grow bg-slate-50 min-h-screen">
            {loadingDb ? (
              <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-blue-500 w-10 h-10" /></div>
            ) : (
              <div className="max-w-5xl mx-auto p-6 md:p-8 pb-20">
                {schoolLevel === 'lager' && activeTab !== 'Leerlijn Overzicht' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 mr-2">
                        <Baby size={16} className="text-pink-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Kleuter:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['Leeftijd 3-4', 'Leeftijd 4-5', 'Leeftijd 5-6'].map(age => (
                          <button 
                            key={age} 
                            onClick={() => toggleLagerAge(age)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${lagerAges.includes(age) ? 'bg-pink-500 border-pink-500 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-pink-300'}`}
                          >
                            {age.replace('Leeftijd ', '')}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 mr-2">
                        <Rocket size={16} className="text-blue-600" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Lager:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['Leeftijd 6-7', 'Leeftijd 7-8', 'Leeftijd 8-9', 'Leeftijd 9-10', 'Leeftijd 10-11', 'Leeftijd 11-12'].map(age => (
                          <button 
                            key={age} 
                            onClick={() => toggleLagerAge(age)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${lagerAges.includes(age) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-300'}`}
                          >
                            {age.replace('Leeftijd ', '')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                <AnimatePresence mode="wait">
                  {activeTab === 'Leerlijn Overzicht' ? (
                    <motion.div 
                      key="overzicht"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-3xl font-black text-slate-800">Leerlijn Overzicht</h2>
                        <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl text-xs font-bold border border-purple-200 shadow-sm">
                          Totaal gepland: {Object.values(leerlijn).filter(v => v && v.trim() !== '').length} doelen
                        </div>
                      </div>

                      <div className="space-y-8">
                        {onderwerpen.map(onderwerp => {
                          const goalsInOnderwerp = filteredData.filter(d => d.onderwerp === onderwerp);
                          if (goalsInOnderwerp.length === 0) return null;
                          return (
                            <div key={onderwerp} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                              <div className={`${THEME_COLORS[onderwerp]?.header || 'bg-slate-800'} px-6 py-4 text-white uppercase tracking-wider text-xs font-black`}>
                                {onderwerp}
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                  <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                      <th className="px-6 py-3 font-bold text-slate-400 w-24 text-[10px] uppercase">ID</th>
                                      <th className="px-6 py-3 font-bold text-slate-400 text-[10px] uppercase">Leerplandoel</th>
                                      <th className="px-6 py-3 font-bold text-purple-700 bg-purple-50/50 text-[10px] uppercase">Wanneer</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {goalsInOnderwerp.map(goal => (
                                      <tr key={goal.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-300 align-top">{goal.id}</td>
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
                                        <td className="px-6 py-4 bg-purple-50/20 align-top">
                                          {leerlijn[goal.id] ? (
                                            <span className="text-purple-800 font-bold">{leerlijn[goal.id]}</span>
                                          ) : (
                                            <span className="text-slate-300 italic">Open</span>
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
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="goals"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mb-8">
                        <h2 className={`text-4xl font-black mb-2 ${THEME_COLORS[activeTab]?.text || 'text-slate-800'}`}>{activeTab}</h2>
                        <p className="text-slate-400 text-sm font-medium">Beheer en specificeer de leerplandoelen voor dit domein.</p>
                      </div>
                      <div className="space-y-8">
                        {Object.keys(groupedGoals).length > 0 ? (
                          Object.entries(groupedGoals).map(([subthema, goals]) => (
                          <SubthemeGroup 
                            key={subthema} 
                            onderwerp={activeTab} 
                            subthema={subthema} 
                            goals={goals} 
                            statuses={statuses} 
                            note={notes[subthema]} 
                            onStatusChange={handleStatusChange} 
                            onNoteSave={handleNoteSave} 
                            concreetData={concreet}
                            onConcreetSave={handleConcreetSave}
                            leerlijnData={leerlijn}
                            onLeerlijnSave={handleLeerlijnSave}
                            lesideeenData={lesideeen}
                            onLesideeSave={handleLesideeSave}
                          />
                          ))
                        ) : (
                          <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
                            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Info size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Geen leerdoelen gevonden</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">Er zijn voor de geselecteerde leeftijden geen leerdoelen gedefinieerd in dit domein.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
