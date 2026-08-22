import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Sun, 
  Moon, 
  Calendar, 
  CloudSnow, 
  Clock, 
  Settings, 
  Edit3, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Check, 
  History, 
  ArrowLeft, 
  ArrowRight, 
  AlertTriangle, 
  Info,
  Save,
  CheckCircle,
  X
} from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';
import Button from '../components/common/Button';
import * as routineService from '../services/routineService';

export default function PersonalizedRoutine() {
  const crumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Personalized Routine', path: '/dashboard/routine' }
  ];

  // Screen modes: 'display' (show generated routine) or 'wizard' (the 28-question form)
  const [screenMode, setScreenMode] = useState('display'); 
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Questionnaire state
  const defaultFormData = {
    age_group: '25–34',
    skin_type: 'Combination',
    sensitivity: 'Slightly sensitive',
    concerns: [],
    acne_severity: 'None',
    oiliness: 'Slightly oily',
    dryness: 'Slightly dry',
    redness_frequency: 'Rarely',
    has_routine: 'Yes',
    current_products: [],
    routine_frequency: 'Every day',
    skincare_irritation: 'No',
    active_ingredients: [],
    sleep_hours: '7–8',
    water_intake: '1–2 L',
    stress_level: 'Moderate',
    exercise_frequency: '3–4 times/week',
    outdoor_hours: '1–2 hours',
    climate: 'Moderate',
    pollution_exposure: 'Moderate',
    sunlight_exposure: 'Moderate',
    has_allergies: 'No',
    avoid_ingredients: '',
    has_allergic_reaction: 'No',
    skincare_time: '5–10 minutes',
    routine_preference: 'Moderate',
    budget: 'Moderate',
    skincare_goal: 'Maintain healthy skin'
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [profileSummary, setProfileSummary] = useState(null);

  // Active routine details
  const [routine, setRoutine] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedItems, setEditedItems] = useState([]);
  
  // History logs state
  const [history, setHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Options lists for rendering selects
  const OPTIONS = {
    age_group: ['Under 18', '18–24', '25–34', '35–44', '45+'],
    skin_type: ['Oily', 'Dry', 'Combination', 'Normal', 'Not sure'],
    sensitivity: ['Not sensitive', 'Slightly sensitive', 'Moderately sensitive', 'Very sensitive'],
    concerns: ['Acne', 'Blackheads', 'Whiteheads', 'Dark spots', 'Post-acne marks', 'Uneven skin tone', 'Open pores', 'Redness', 'Fine lines/wrinkles', 'Dark circles', 'Dehydration', 'Excess oil', 'None'],
    acne_severity: ['None', 'Mild', 'Moderate', 'Severe', 'Very severe'],
    oiliness: ['Not oily', 'Slightly oily', 'Moderately oily', 'Very oily'],
    dryness: ['Not dry', 'Slightly dry', 'Moderately dry', 'Very dry'],
    redness_frequency: ['Never', 'Rarely', 'Sometimes', 'Frequently'],
    has_routine: ['Yes', 'No'],
    current_products: ['Cleanser', 'Moisturizer', 'Sunscreen', 'Serum', 'Exfoliant', 'Retinol', 'Acne treatment', 'Eye cream', 'Other'],
    routine_frequency: ['Every day', '4–6 days/week', '2–3 days/week', 'Rarely'],
    skincare_irritation: ['Yes', 'No', 'Not sure'],
    active_ingredients: ['Vitamin C', 'Niacinamide', 'Salicylic acid', 'AHA', 'Retinoids', 'Benzoyl peroxide', 'Other', 'None', 'Not sure'],
    sleep_hours: ['<5', '5–6', '6–7', '7–8', '>8'],
    water_intake: ['<1 L', '1–2 L', '2–3 L', '>3 L'],
    stress_level: ['Low', 'Moderate', 'High', 'Very high'],
    exercise_frequency: ['Never', '1–2 times/week', '3–4 times/week', '5+ times/week'],
    outdoor_hours: ['<1 hour', '1–2 hours', '2–4 hours', '>4 hours'],
    climate: ['Hot & humid', 'Hot & dry', 'Cold & dry', 'Moderate', 'Not sure'],
    pollution_exposure: ['Low', 'Moderate', 'High'],
    sunlight_exposure: ['Very little', 'Low', 'Moderate', 'High'],
    has_allergies: ['Yes', 'No'],
    has_allergic_reaction: ['Yes', 'No'],
    skincare_time: ['<5 minutes', '5–10 minutes', '10–20 minutes', '20+ minutes'],
    routine_preference: ['Minimal', 'Moderate', 'Detailed'],
    budget: ['Budget', 'Moderate', 'Premium'],
    skincare_goal: ['Clear acne', 'Reduce oiliness', 'Improve hydration', 'Reduce dark spots', 'Improve skin texture', 'Reduce signs of aging', 'Reduce redness/sensitivity', 'Maintain healthy skin', 'Other']
  };

  // Load profile and routine data on mount
  const loadInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch user's questionnaire profile
      const profile = await routineService.getRoutineProfile();
      setFormData(profile);
      setProfileSummary(profile);
      
      // 2. Fetch user's current routine card
      const currRoutine = await routineService.getCurrentRoutine();
      setRoutine(currRoutine);
      setEditedItems(currRoutine.items || []);
      setScreenMode('display');
    } catch (err) {
      if (err.response?.status === 404) {
        // No questionnaire completed -> direct to questionnaire wizard
        setScreenMode('wizard');
      } else {
        toast.error('Error loading skincare routine.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch history list
  const loadHistory = async () => {
    try {
      const data = await routineService.getRoutineHistory();
      setHistory(data);
    } catch (err) {
      toast.error('Failed to load past routines list.');
    }
  };

  // Toggle multi-select array checkboxes
  const handleCheckboxToggle = (field, option) => {
    let currentList = [...formData[field]];
    if (option === 'None') {
      // CASE 1: If selecting "None", clear all other choices
      if (currentList.includes('None')) {
        currentList = [];
      } else {
        currentList = ['None'];
      }
    } else {
      // CASE 2: If selecting any other option, clear "None"
      if (currentList.includes(option)) {
        currentList = currentList.filter(item => item !== option);
      } else {
        currentList = currentList.filter(item => item !== 'None');
        currentList.push(option);
      }
    }
    setFormData({
      ...formData,
      [field]: currentList
    });
  };

  // Save questionnaire answers to db
  const handleSaveProfile = async () => {
    setLoading(true);
    // CASE 3: Treat empty arrays for None questions as ['None'] on submit
    const submissionData = {
      ...formData,
      concerns: formData.concerns.length === 0 ? ['None'] : formData.concerns,
      active_ingredients: formData.active_ingredients.length === 0 ? ['None'] : formData.active_ingredients
    };
    try {
      const savedProfile = await routineService.saveRoutineProfile(submissionData);
      setProfileSummary(savedProfile);
      toast.success('Skin profile questionnaire saved.');
      
      // Auto-generate new routine using profile
      const newRoutine = await routineService.generateRoutine();
      setRoutine(newRoutine);
      setEditedItems(newRoutine.items || []);
      setScreenMode('display');
      toast.success('Your personalized routine has been generated!');
    } catch (err) {
      toast.error('Failed to save profile answers.');
    } finally {
      setLoading(false);
    }
  };

  // Manual update submission
  const handleSaveManualEdits = async () => {
    if (!routine) return;
    setLoading(true);
    try {
      const updated = await routineService.updateRoutineManually(routine.id, editedItems);
      setRoutine(updated);
      setEditedItems(updated.items || []);
      setEditMode(false);
      toast.success('Manual changes saved successfully!');
    } catch (err) {
      toast.error('Failed to save manual changes.');
    } finally {
      setLoading(false);
    }
  };

  // Add custom routine step manually
  const handleAddCustomStep = (routineType) => {
    const list = editedItems.filter(i => i.routine_type === routineType);
    const newOrder = list.length + 1;
    const newItem = {
      routine_type: routineType,
      category: 'TREATMENT',
      step_order: newOrder,
      name: 'Custom Product Step',
      description: 'Add instructions on how or when to apply.',
      frequency: 'Daily',
      notes: 'User modified',
      is_enabled: true
    };
    setEditedItems([...editedItems, newItem]);
    toast.success(`Added new step to ${routineType.toLowerCase()} routine.`);
  };

  // Delete active custom step manually
  const handleDeleteStep = (indexToDelete) => {
    const updated = editedItems.filter((_, idx) => idx !== indexToDelete);
    // Recalculate step order
    const morningList = updated.filter(i => i.routine_type === 'MORNING');
    const eveningList = updated.filter(i => i.routine_type === 'EVENING');
    
    morningList.forEach((item, idx) => item.step_order = idx + 1);
    eveningList.forEach((item, idx) => item.step_order = idx + 1);
    
    setEditedItems([...morningList, ...eveningList, ...updated.filter(i => i.routine_type !== 'MORNING' && i.routine_type !== 'EVENING')]);
    toast.success('Step removed.');
  };

  // Explicitly regenerate routine
  const handleRegenerate = async () => {
    if (!routine) return;
    if (!window.confirm('Warning: Regenerating will replace your current routine steps. Any manual edits on this card will be overwritten. Proceed?')) {
      return;
    }
    setLoading(true);
    try {
      const regenerated = await routineService.regenerateRoutine(routine.id);
      setRoutine(regenerated);
      setEditedItems(regenerated.items || []);
      setEditMode(false);
      toast.success('Routine regenerated using updated profile rules!');
    } catch (err) {
      toast.error('Failed to regenerate routine.');
    } finally {
      setLoading(false);
    }
  };

  // View specific history routine
  const handleViewHistoricalRoutine = async (id) => {
    setLoading(true);
    try {
      const data = await routineService.getRoutineDetails(id);
      setRoutine(data);
      setEditedItems(data.items || []);
      setShowHistoryModal(false);
      toast.success(`Loaded routine from history logs.`);
    } catch (err) {
      toast.error('Failed to load routine details.');
    } finally {
      setLoading(false);
    }
  };

  // Delete historical routine card
  const handleDeleteHistoryCard = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this historical routine card?')) return;
    try {
      await routineService.deleteRoutine(id);
      toast.success('Historical routine card removed.');
      loadHistory();
      if (routine?.id === id) {
        setRoutine(null);
      }
    } catch (err) {
      toast.error('Failed to delete history card.');
    }
  };

  // Form input change helper
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Check if allergies trigger visual warnings
  const showDermWarning = (
    formData.acne_severity in { 'Severe': 1, 'Very severe': 1 } ||
    formData.has_allergic_reaction === 'Yes' ||
    formData.sensitivity === 'Very sensitive'
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
            Personalized Routine
          </h1>
          <p className="text-sm text-brand-850">
            Tailored skincare guidance generated strictly from your 28-question profile metrics.
          </p>
        </div>

        <div className="flex gap-2">
          {screenMode === 'display' && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  loadHistory();
                  setShowHistoryModal(true);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold py-2"
              >
                <History className="w-3.5 h-3.5" />
                History Log
              </Button>
              <Button
                onClick={() => {
                  setCurrentStep(1);
                  setScreenMode('wizard');
                }}
                className="flex items-center gap-1.5 text-xs font-semibold py-2"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </Button>
            </>
          )}
        </div>
      </div>

      {loading && (
        <div className="py-16 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-brand-850 font-semibold">Processing routine data...</span>
        </div>
      )}

      {/* ==================================================
          DISPLAY MODE: SHOW CURRENT GENERATED ROUTINE
          ================================================== */}
      {!loading && screenMode === 'display' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Summary of profile info & clinical cautions */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Display profile properties used */}
            {profileSummary && (
              <div className="glass-effect p-6 rounded-3xl border border-brand-100 shadow-sm bg-white space-y-4">
                <div>
                  <h3 className="font-display text-sm font-bold text-brand-950">Generation Profile Metrics</h3>
                  <p className="text-[10px] text-brand-800">Parameters used by rule engine for recommendation</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-brand-50/50 p-2.5 rounded-xl border border-brand-100">
                    <span className="block text-[10px] text-brand-650 font-bold uppercase tracking-wider">Skin Type</span>
                    <span className="font-semibold text-slate-800">{profileSummary.skin_type}</span>
                  </div>
                  <div className="bg-brand-50/50 p-2.5 rounded-xl border border-brand-100">
                    <span className="block text-[10px] text-brand-650 font-bold uppercase tracking-wider">Sensitivity</span>
                    <span className="font-semibold text-slate-800">{profileSummary.sensitivity}</span>
                  </div>
                  <div className="bg-brand-50/50 p-2.5 rounded-xl border border-brand-100 col-span-2">
                    <span className="block text-[10px] text-brand-650 font-bold uppercase tracking-wider">Skincare Goal</span>
                    <span className="font-semibold text-slate-800">{profileSummary.skincare_goal}</span>
                  </div>
                  <div className="bg-brand-50/50 p-2.5 rounded-xl border border-brand-100">
                    <span className="block text-[10px] text-brand-650 font-bold uppercase tracking-wider">Pref Complexity</span>
                    <span className="font-semibold text-slate-800">{profileSummary.routine_preference}</span>
                  </div>
                  <div className="bg-brand-50/50 p-2.5 rounded-xl border border-brand-100">
                    <span className="block text-[10px] text-brand-650 font-bold uppercase tracking-wider">Time Limit</span>
                    <span className="font-semibold text-slate-800">{profileSummary.skincare_time}</span>
                  </div>
                </div>

                {/* Exclusions checklist */}
                {profileSummary.has_allergies === 'Yes' && profileSummary.avoid_ingredients && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-2xl flex gap-2.5 items-start">
                    <AlertTriangle className="w-5 h-5 text-red-650 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-xs font-bold text-red-950">Safety Allergy Exclusions</span>
                      <p className="text-[10.5px] text-red-800 leading-normal mt-0.5">
                        Avoided: <span className="font-semibold">{profileSummary.avoid_ingredients}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Doctor/Clinic caution reminder */}
            {showDermWarning && (
              <div className="glass-effect p-6 rounded-3xl border border-amber-200/80 shadow-sm bg-amber-50/20 space-y-3">
                <div className="flex gap-2.5 items-start">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">Dermatologist Referral Advice</h4>
                    <p className="text-[11px] text-amber-900 leading-normal mt-1">
                      Your profile reports severe acne, previous allergic irritation, or highly sensitive skin traits. 
                       skincares generate superficial cosmetic support. We strongly recommend consulting a board-certified dermatologist for prescription therapy.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* General guidance disclaimer */}
            <div className="text-xs text-slate-500 bg-brand-50/50 p-4 rounded-3xl leading-relaxed border border-brand-100 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-brand-650 shrink-0 mt-0.5" />
              <span>
                <strong>skincare guidance disclaimer:</strong> Recommendations display cosmetic ingredient groups and step order classes (e.g. cleansers, zinc oxide sunscreen) instead of branded commercial products.
              </span>
            </div>
            
          </div>

          {/* Right Column: Display of routines */}
          <div className="lg:col-span-8 space-y-6">
            
            {routine ? (
              <div className="space-y-6">
                
                {/* Routine status block */}
                <div className="glass-effect p-4 rounded-3xl border border-brand-100 shadow-sm bg-white flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${routine.is_user_modified ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <span className="text-xs font-bold text-slate-900">
                      Status: {routine.is_user_modified ? 'User Modified' : 'System Generated'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      (Created: {new Date(routine.generated_at).toLocaleDateString()})
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {!editMode ? (
                      <>
                        <button
                          onClick={() => {
                            setEditedItems(routine.items || []);
                            setEditMode(true);
                          }}
                          className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          Edit Routine Steps
                        </button>
                        <button
                          onClick={handleRegenerate}
                          className="px-3.5 py-1.5 bg-brand-50 border border-brand-150 text-brand-700 rounded-xl hover:bg-brand-100 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer animate-pulse"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Regenerate Routine
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleSaveManualEdits}
                          className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save Changes
                        </button>
                        <button
                          onClick={() => {
                            setEditedItems(routine.items || []);
                            setEditMode(false);
                          }}
                          className="px-3.5 py-1.5 bg-red-50 text-red-650 rounded-xl hover:bg-red-100 transition-colors text-[11px] font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* AM & PM timelines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* MORNING (AM) ROUTINE */}
                  <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm bg-white space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-brand-100">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-brand-100 text-brand-650 rounded-xl">
                          <Sun className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-display text-sm font-extrabold text-slate-900">Morning Routine (AM)</h3>
                          <span className="text-[9px] text-brand-650 font-bold uppercase tracking-widest">Protection & Barrier Support</span>
                        </div>
                      </div>
                      {editMode && (
                        <button
                          type="button"
                          onClick={() => handleAddCustomStep('MORNING')}
                          className="p-1.5 bg-brand-50 border border-brand-150 text-brand-700 rounded-lg hover:bg-brand-100 cursor-pointer"
                          title="Add Morning Step"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4 pt-2 pl-3 border-l border-brand-100/80 ml-3">
                      {editedItems
                        .filter(i => i.routine_type === 'MORNING')
                        .sort((a, b) => a.step_order - b.step_order)
                        .map((item, idx) => (
                          <div key={idx} className={`relative space-y-1 ${!item.is_enabled ? 'opacity-40' : ''}`}>
                            <div className="absolute -left-[18px] top-1 w-2 h-2 rounded-full bg-brand-500 border-2 border-white" />
                            
                            {editMode ? (
                              <div className="p-3 border border-brand-100 rounded-2xl bg-brand-50/20 space-y-2 mt-2">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-bold text-brand-650">Step {item.step_order} ({item.category})</span>
                                  <div className="flex gap-1.5">
                                    <input 
                                      type="checkbox"
                                      checked={item.is_enabled}
                                      onChange={(e) => {
                                        const copy = [...editedItems];
                                        const target = copy.find(i => i.id === item.id || (i.routine_type === item.routine_type && i.step_order === item.step_order));
                                        if (target) target.is_enabled = e.target.checked;
                                        setEditedItems(copy);
                                      }}
                                    />
                                    <button 
                                      type="button" 
                                      onClick={() => handleDeleteStep(editedItems.indexOf(item))}
                                      className="text-red-500 hover:text-red-650 p-0.5"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <input 
                                  type="text" 
                                  value={item.name}
                                  onChange={(e) => {
                                    const copy = [...editedItems];
                                    const target = copy.find(i => i.id === item.id || (i.routine_type === item.routine_type && i.step_order === item.step_order));
                                    if (target) target.name = e.target.value;
                                    setEditedItems(copy);
                                  }}
                                  className="w-full text-xs p-1.5 border border-brand-200 rounded-lg focus:outline-none"
                                  placeholder="Product category name"
                                />
                                <textarea 
                                  value={item.description}
                                  onChange={(e) => {
                                    const copy = [...editedItems];
                                    const target = copy.find(i => i.id === item.id || (i.routine_type === item.routine_type && i.step_order === item.step_order));
                                    if (target) target.description = e.target.value;
                                    setEditedItems(copy);
                                  }}
                                  className="w-full text-[10.5px] p-1.5 border border-brand-200 rounded-lg focus:outline-none h-14"
                                  placeholder="Step instructions"
                                />
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-brand-650 uppercase tracking-widest">
                                  <Clock className="w-3 h-3" />
                                  <span>Step {item.step_order} • {item.category}</span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                                <p className="text-[10.5px] text-brand-900">{item.description}</p>
                                {item.notes && <p className="text-[9.5px] text-slate-500 italic">Instruction note: {item.notes}</p>}
                              </>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* EVENING (PM) ROUTINE */}
                  <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm bg-white space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-brand-100">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-55 bg-brand-50/50 text-indigo-700 rounded-xl">
                          <Moon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-display text-sm font-extrabold text-slate-900">Evening Routine (PM)</h3>
                          <span className="text-[9px] text-indigo-700 font-bold uppercase tracking-widest">Hydration & Active repair</span>
                        </div>
                      </div>
                      {editMode && (
                        <button
                          type="button"
                          onClick={() => handleAddCustomStep('EVENING')}
                          className="p-1.5 bg-brand-50 border border-brand-150 text-brand-700 rounded-lg hover:bg-brand-100 cursor-pointer"
                          title="Add Evening Step"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4 pt-2 pl-3 border-l border-indigo-100 ml-3">
                      {editedItems
                        .filter(i => i.routine_type === 'EVENING')
                        .sort((a, b) => a.step_order - b.step_order)
                        .map((item, idx) => (
                          <div key={idx} className={`relative space-y-1 ${!item.is_enabled ? 'opacity-40' : ''}`}>
                            <div className="absolute -left-[18px] top-1 w-2 h-2 rounded-full bg-indigo-500 border-2 border-white" />
                            
                            {editMode ? (
                              <div className="p-3 border border-indigo-100 rounded-2xl bg-indigo-50/10 space-y-2 mt-2">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-bold text-indigo-700">Step {item.step_order} ({item.category})</span>
                                  <div className="flex gap-1.5">
                                    <input 
                                      type="checkbox"
                                      checked={item.is_enabled}
                                      onChange={(e) => {
                                        const copy = [...editedItems];
                                        const target = copy.find(i => i.id === item.id || (i.routine_type === item.routine_type && i.step_order === item.step_order));
                                        if (target) target.is_enabled = e.target.checked;
                                        setEditedItems(copy);
                                      }}
                                    />
                                    <button 
                                      type="button" 
                                      onClick={() => handleDeleteStep(editedItems.indexOf(item))}
                                      className="text-red-500 hover:text-red-650 p-0.5"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <input 
                                  type="text" 
                                  value={item.name}
                                  onChange={(e) => {
                                    const copy = [...editedItems];
                                    const target = copy.find(i => i.id === item.id || (i.routine_type === item.routine_type && i.step_order === item.step_order));
                                    if (target) target.name = e.target.value;
                                    setEditedItems(copy);
                                  }}
                                  className="w-full text-xs p-1.5 border border-indigo-200 rounded-lg focus:outline-none"
                                  placeholder="Product category name"
                                />
                                <textarea 
                                  value={item.description}
                                  onChange={(e) => {
                                    const copy = [...editedItems];
                                    const target = copy.find(i => i.id === item.id || (i.routine_type === item.routine_type && i.step_order === item.step_order));
                                    if (target) target.description = e.target.value;
                                    setEditedItems(copy);
                                  }}
                                  className="w-full text-[10.5px] p-1.5 border border-indigo-200 rounded-lg focus:outline-none h-14"
                                  placeholder="Step instructions"
                                />
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-700 uppercase tracking-widest">
                                  <Clock className="w-3 h-3" />
                                  <span>Step {item.step_order} • {item.category}</span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                                <p className="text-[10.5px] text-brand-900">{item.description}</p>
                                {item.notes && <p className="text-[9.5px] text-slate-500 italic">Instruction note: {item.notes}</p>}
                              </>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Weekly plan & Seasonal recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* WEEKLY PLAN */}
                  <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm bg-white space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-brand-100">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-extrabold text-slate-900">Weekly Treatment Plan</h3>
                        <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest">Specialized active schedules</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {editedItems
                        .filter(i => i.routine_type === 'WEEKLY')
                        .sort((a, b) => a.step_order - b.step_order)
                        .map((item, idx) => (
                          <div key={idx} className="flex gap-3 text-xs leading-normal">
                            <span className="font-bold text-brand-900 shrink-0 w-20">{item.name}:</span>
                            <span className="text-slate-700">{item.description}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* SEASONAL GUIDANCE */}
                  <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm bg-white space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-brand-100">
                      <div className="p-2 bg-blue-50 text-blue-650 rounded-xl">
                        <CloudSnow className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-extrabold text-slate-900">Seasonal Climate Shifts</h3>
                        <span className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">Weather skin adaptations</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {editedItems
                        .filter(i => i.routine_type === 'SEASONAL')
                        .sort((a, b) => a.step_order - b.step_order)
                        .map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-slate-700 leading-normal pl-2.5">{item.description}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-16 text-center border-2 border-dashed border-brand-200 rounded-3xl bg-brand-50/5 flex flex-col items-center justify-center gap-3">
                <Calendar className="w-12 h-12 text-brand-400 animate-bounce" />
                <h3 className="font-display text-lg font-bold text-brand-950">No Skincare Routine Generated</h3>
                <p className="text-xs text-brand-800 max-w-xs leading-relaxed">
                  Generate your routine from your saved skin profile questionnaire to begin.
                </p>
                <Button 
                  onClick={() => handleSaveProfile()} 
                  className="py-2 text-xs w-auto px-4 cursor-pointer"
                >
                  Generate Skincare Routine
                </Button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ==================================================
          WIZARD MODE: 7-STEP 28-QUESTION QUESTIONNAIRE
          ================================================== */}
      {!loading && screenMode === 'wizard' && (
        <div className="max-w-3xl mx-auto glass-effect p-6 sm:p-8 rounded-3xl border border-brand-100 shadow-sm bg-white space-y-6">
          
          {/* Header progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-brand-950">
              <span>Step {currentStep} of 7: {
                currentStep === 1 ? 'Skin Profile' :
                currentStep === 2 ? 'Skin Concerns' :
                currentStep === 3 ? 'Current Skincare' :
                currentStep === 4 ? 'Lifestyle' :
                currentStep === 5 ? 'Environment' :
                currentStep === 6 ? 'Allergies & Safety' :
                'Routine Preferences'
              }</span>
              <span>{Math.round((currentStep / 7) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-brand-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-brand-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 7) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-6 min-h-[300px]">
            {/* STEP 1: SKIN PROFILE */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-brand-950 border-b border-brand-100 pb-2">Step 1 — Skin Profile</h3>
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Q1. What is your age group?</label>
                  <select 
                    value={formData.age_group}
                    onChange={(e) => handleInputChange('age_group', e.target.value)}
                    className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-brand-50/10"
                  >
                    {OPTIONS.age_group.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Q2. What is your skin type?</label>
                  <select 
                    value={formData.skin_type}
                    onChange={(e) => handleInputChange('skin_type', e.target.value)}
                    className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-brand-50/10"
                  >
                    {OPTIONS.skin_type.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Q3. How sensitive is your skin?</label>
                  <select 
                    value={formData.sensitivity}
                    onChange={(e) => handleInputChange('sensitivity', e.target.value)}
                    className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-brand-50/10"
                  >
                    {OPTIONS.sensitivity.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* STEP 2: SKIN CONCERNS */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-brand-950 border-b border-brand-100 pb-2">Step 2 — Skin Concerns</h3>
                
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">Q4. What are your main skin concerns? (Select all that apply)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {OPTIONS.concerns.map(opt => (
                      <label key={opt} className="flex items-center gap-2 p-2.5 border border-brand-200 rounded-xl cursor-pointer hover:bg-brand-50/30 text-xs">
                        <input 
                          type="checkbox"
                          checked={formData.concerns.includes(opt)}
                          onChange={() => handleCheckboxToggle('concerns', opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">Q5. How severe is your acne?</label>
                    <select 
                      value={formData.acne_severity}
                      onChange={(e) => handleInputChange('acne_severity', e.target.value)}
                      className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none bg-brand-50/10"
                    >
                      {OPTIONS.acne_severity.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">Q6. How oily does your skin feel during the day?</label>
                    <select 
                      value={formData.oiliness}
                      onChange={(e) => handleInputChange('oiliness', e.target.value)}
                      className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none bg-brand-50/10"
                    >
                      {OPTIONS.oiliness.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">Q7. How dry or dehydrated does your skin feel?</label>
                    <select 
                      value={formData.dryness}
                      onChange={(e) => handleInputChange('dryness', e.target.value)}
                      className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none bg-brand-50/10"
                    >
                      {OPTIONS.dryness.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">Q8. How frequently do you experience skin redness?</label>
                    <select 
                      value={formData.redness_frequency}
                      onChange={(e) => handleInputChange('redness_frequency', e.target.value)}
                      className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none bg-brand-50/10"
                    >
                      {OPTIONS.redness_frequency.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: CURRENT SKINCARE */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-brand-950 border-b border-brand-100 pb-2">Step 3 — Current Skincare</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">Q9. Do you currently follow a skincare routine?</label>
                    <select 
                      value={formData.has_routine}
                      onChange={(e) => handleInputChange('has_routine', e.target.value)}
                      className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none bg-brand-50/10"
                    >
                      {OPTIONS.has_routine.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">Q11. How often do you follow your skincare routine?</label>
                    <select 
                      value={formData.routine_frequency}
                      onChange={(e) => handleInputChange('routine_frequency', e.target.value)}
                      className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none bg-brand-50/10"
                    >
                      {OPTIONS.routine_frequency.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">Q10. Which products do you currently use?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {OPTIONS.current_products.map(opt => (
                      <label key={opt} className="flex items-center gap-2 p-2.5 border border-brand-200 rounded-xl cursor-pointer hover:bg-brand-50/30 text-xs">
                        <input 
                          type="checkbox"
                          checked={formData.current_products.includes(opt)}
                          onChange={() => handleCheckboxToggle('current_products', opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Q12. Have you experienced irritation from skincare products before?</label>
                  <select 
                    value={formData.skincare_irritation}
                    onChange={(e) => handleInputChange('skincare_irritation', e.target.value)}
                    className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none bg-brand-50/10"
                  >
                    {OPTIONS.skincare_irritation.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">Q13. Are you currently using any active ingredients?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {OPTIONS.active_ingredients.map(opt => (
                      <label key={opt} className="flex items-center gap-2 p-2.5 border border-brand-200 rounded-xl cursor-pointer hover:bg-brand-50/30 text-xs">
                        <input 
                          type="checkbox"
                          checked={formData.active_ingredients.includes(opt)}
                          onChange={() => handleCheckboxToggle('active_ingredients', opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: LIFESTYLE */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-brand-950 border-b border-brand-100 pb-2">Step 4 — Lifestyle</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">Q14. How many hours do you usually sleep?</label>
                    <select 
                      value={formData.sleep_hours}
                      onChange={(e) => handleInputChange('sleep_hours', e.target.value)}
                      className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none bg-brand-50/10"
                    >
                      {OPTIONS.sleep_hours.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">Q15. How much water do you drink daily?</label>
                    <select 
                      value={formData.water_intake}
                      onChange={(e) => handleInputChange('water_intake', e.target.value)}
                      className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none bg-brand-50/10"
                    >
                      {OPTIONS.water_intake.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">Q16. How would you describe your daily stress level?</label>
                    <select 
                      value={formData.stress_level}
                      onChange={(e) => handleInputChange('stress_level', e.target.value)}
                      className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none bg-brand-50/10"
                    >
                      {OPTIONS.stress_level.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">Q17. How often do you exercise?</label>
                    <select 
                      value={formData.exercise_frequency}
                      onChange={(e) => handleInputChange('exercise_frequency', e.target.value)}
                      className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none bg-brand-50/10"
                    >
                      {OPTIONS.exercise_frequency.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-800">Q18. How many hours do you spend outdoors each day?</label>
                    <select 
                      value={formData.outdoor_hours}
                      onChange={(e) => handleInputChange('outdoor_hours', e.target.value)}
                      className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none bg-brand-50/10"
                    >
                      {OPTIONS.outdoor_hours.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: ENVIRONMENT */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-brand-950 border-b border-brand-100 pb-2">Step 5 — Environment</h3>
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Q19. What type of climate do you live in?</label>
                  <select 
                    value={formData.climate}
                    onChange={(e) => handleInputChange('climate', e.target.value)}
                    className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none bg-brand-50/10"
                  >
                    {OPTIONS.climate.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Q20. How would you describe your exposure to air pollution?</label>
                  <select 
                    value={formData.pollution_exposure}
                    onChange={(e) => handleInputChange('pollution_exposure', e.target.value)}
                    className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none bg-brand-50/10"
                  >
                    {OPTIONS.pollution_exposure.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Q21. How much direct sunlight do you usually receive?</label>
                  <select 
                    value={formData.sunlight_exposure}
                    onChange={(e) => handleInputChange('sunlight_exposure', e.target.value)}
                    className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none bg-brand-50/10"
                  >
                    {OPTIONS.sunlight_exposure.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* STEP 6: ALLERGIES & SAFETY */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-brand-950 border-b border-brand-100 pb-2">Step 6 — Allergies & Safety</h3>
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Q22. Do you have any known skincare/product allergies?</label>
                  <select 
                    value={formData.has_allergies}
                    onChange={(e) => handleInputChange('has_allergies', e.target.value)}
                    className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none bg-brand-50/10"
                  >
                    {OPTIONS.has_allergies.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                {formData.has_allergies === 'Yes' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-red-800">Q23. Which ingredients or products should be avoided? (e.g. Salicylic acid, Vitamin C, Retinol)</label>
                    <textarea 
                      value={formData.avoid_ingredients}
                      onChange={(e) => handleInputChange('avoid_ingredients', e.target.value)}
                      className="w-full text-xs p-2.5 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-red-50/5 h-20"
                      placeholder="Type ingredient names separated by commas..."
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Q24. Have you experienced severe allergic irritation from a skincare product before?</label>
                  <select 
                    value={formData.has_allergic_reaction}
                    onChange={(e) => handleInputChange('has_allergic_reaction', e.target.value)}
                    className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none bg-brand-50/10"
                  >
                    {OPTIONS.has_allergic_reaction.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* STEP 7: ROUTINE PREFERENCES */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-brand-950 border-b border-brand-100 pb-2">Step 7 — Preferences & Goals</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">Q25. How much time can you spend on skincare each day?</label>
                    <select 
                      value={formData.skincare_time}
                      onChange={(e) => handleInputChange('skincare_time', e.target.value)}
                      className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none bg-brand-50/10"
                    >
                      {OPTIONS.skincare_time.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">Q26. What type of routine do you prefer?</label>
                    <select 
                      value={formData.routine_preference}
                      onChange={(e) => handleInputChange('routine_preference', e.target.value)}
                      className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none bg-brand-50/10"
                    >
                      {OPTIONS.routine_preference.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">Q27. What is your approximate skincare budget?</label>
                    <select 
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none bg-brand-50/10"
                    >
                      {OPTIONS.budget.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">Q28. What is your primary skincare goal?</label>
                    <select 
                      value={formData.skincare_goal}
                      onChange={(e) => handleInputChange('skincare_goal', e.target.value)}
                      className="w-full text-xs p-2.5 border border-brand-200 rounded-xl focus:outline-none bg-brand-50/10"
                    >
                      {OPTIONS.skincare_goal.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center border-t border-brand-100 pt-4">
            <Button
              variant="outline"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="flex items-center gap-1.5 text-xs py-2 cursor-pointer disabled:opacity-30"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </Button>
            
            {currentStep < 7 ? (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="flex items-center gap-1.5 text-xs py-2 cursor-pointer"
              >
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                onClick={handleSaveProfile}
                className="flex items-center gap-1.5 text-xs py-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Save & Generate Routine
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ==================================================
          MODAL: HISTORY LOGS LISTING
          ================================================== */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-brand-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-brand-100 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-brand-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-brand-650" />
                Routine History Log
              </h3>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="p-1 text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 divide-y divide-brand-50">
              {history.length > 0 ? (
                history.map((h, idx) => (
                  <div 
                    key={h.id}
                    onClick={() => handleViewHistoricalRoutine(h.id)}
                    className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 cursor-pointer hover:bg-brand-50/40 px-2 -mx-2 rounded-xl transition-colors group"
                  >
                    <div>
                      <span className="text-xs font-semibold block text-slate-800">
                        Routine Card #{idx + 1}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Generated: {new Date(h.generated_at).toLocaleString()}
                      </span>
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] bg-brand-50 border border-brand-100 text-brand-700">
                        {h.is_user_modified ? 'Modified' : 'System'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDeleteHistoryCard(h.id, e)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-bold text-brand-650">Load →</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  No routine logs stored in database history yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
