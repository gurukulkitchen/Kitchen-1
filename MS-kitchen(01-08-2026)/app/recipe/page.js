"use client";
import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormStore } from '@/lib/store';
import { useCompany } from '@/context/CompanyContext';
import CompanyFilter from '../../components/CompanyFilter';
import {
    UtensilsCrossed,
    Plus,
    Search,
    Users,
    ChevronDown,
    X,
    Trash2,
    BookOpen,
    Edit3,
    ArrowRight,
    ChefHat,
    Scale,
    Youtube,
    Play,
    Calendar,
    ClipboardCheck,
    History,
    Info,
    Calculator,
    Package
} from 'lucide-react';

import MasterDataManager from '../../components/MasterDataManager';

// --- Shared Constants ---
const PERSON_STYLES = {
    students: { color: 'text-orange-500', bg: 'bg-orange-50', dot: 'bg-orange-500' },
    haribhakts: { color: 'text-emerald-500', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
    vvip: { color: 'text-amber-500', bg: 'bg-amber-50', dot: 'bg-amber-500' },
    others: { color: 'text-muted-foreground', bg: 'bg-muted', dot: 'bg-muted0' },
    guest: { color: 'text-purple-500', bg: 'bg-purple-50', dot: 'bg-purple-500' },
    staff: { color: 'text-blue-500', bg: 'bg-blue-50', dot: 'bg-blue-500' },
    vip: { color: 'text-rose-500', bg: 'bg-rose-50', dot: 'bg-rose-500' }
};

const getStyle = (name) => {
    const key = name.toLowerCase();
    return PERSON_STYLES[key] || { color: 'text-primary', bg: 'bg-primary/5', dot: 'bg-primary' };
};

export default function RecipePage() {
    const [activeTab, setActiveTab] = useState('recipes'); // 'recipes' | 'events'
    const [recipes, setRecipes] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [events, setEvents] = useState([]);
    const [recipientCategories, setRecipientCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isReadOnly } = useCompany();
    const [isMasterManagerOpen, setIsMasterManagerOpen] = useState(false);
    const searchParams = useSearchParams();
    const companyId = searchParams.get('companyId');

    const { setFormData, forms } = useFormStore();
    const [isHydrated, setIsHydrated] = useState(false);

    // Sync with persistent store
    useEffect(() => {
        const persistedData = forms['recipe'];
        if (persistedData) {
            if (persistedData.activeTab) setActiveTab(persistedData.activeTab);
            if (persistedData.recipeSubTab) setRecipeSubTab(persistedData.recipeSubTab);
        }
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated) {
            setFormData('recipe', { activeTab, recipeSubTab });
        }
    }, [activeTab, recipeSubTab, isHydrated]);

    // Filter/Tab state for Recipes
    const [recipeSubTab, setRecipeSubTab] = useState('my-recipes'); // 'my-recipes' | 'global'

    // Fetch Data
    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch basic data needed for both tabs
                // For recipes tab, we might need all recipes or filtered.
                // For events tab, we need recipes and event plans.
                let recipesUrl = recipeSubTab === 'global' ? '/api/recipes?all=true' : '/api/recipes';
                if (companyId && recipeSubTab === 'global') {
                    recipesUrl += `&companyId=${companyId}`;
                }

                const [recipesRes, inventoryRes, eventsRes, recipientRes] = await Promise.all([
                    fetch(recipesUrl),
                    fetch('/api/kitchen/items'),
                    fetch('/api/event-plans'),
                    fetch('/api/recipient-categories')
                ]);

                const recipesData = await recipesRes.json();
                const inventoryData = await inventoryRes.json();
                const eventsData = await eventsRes.json();
                const recipientData = await recipientRes.json();

                const formattedRecipes = Array.isArray(recipesData) ? recipesData.map(r => ({ ...r, id: r._id })) : [];
                const formattedInventory = Array.isArray(inventoryData) ? inventoryData.map(i => ({ ...i, id: i._id })) : [];
                const formattedEvents = Array.isArray(eventsData) ? eventsData.map(e => ({ ...e, id: e._id })) : [];

                setRecipes(formattedRecipes);
                setInventory(formattedInventory);
                setEvents(formattedEvents);
                setRecipientCategories(recipientData);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeTab, recipeSubTab, companyId, isMasterManagerOpen]);

    return (
        <main className="flex-1 p-4 md:p-10 mb-20 md:mb-0 bg-[#fdfcfb]">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
                            {activeTab === 'recipes' ? (
                                <ChefHat className="text-orange-500" size={24} />
                            ) : (
                                <Calendar className="text-orange-500" size={24} />
                            )}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight uppercase">
                            {activeTab === 'recipes' ? 'Recipe Master' : 'Event Planner'}
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ">
                        {activeTab === 'recipes' ? 'Recipe Management & Quantity Templates' : 'Meal Requirements & Attendance Mapping'}
                    </p>
                </div>

                <div className="flex bg-card p-1 rounded-2xl shadow-sm">
                    {!isReadOnly && (
                        <button
                            onClick={() => setIsMasterManagerOpen(true)}
                            className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-orange-600 transition-all"
                            title="Manage recipient categories"
                        >
                            Master Data
                        </button>
                    )}
                    <div className="w-[1px] h-6 bg-muted self-center mx-1" />
                    <button
                        onClick={() => setActiveTab('recipes')}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'recipes' ? 'bg-slate-900 text-white shadow-md' : 'text-muted-foreground hover:text-muted-foreground'
                            }`}
                    >
                        Recipes
                    </button>
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'events' ? 'bg-orange-600 text-white shadow-md' : 'text-muted-foreground hover:text-muted-foreground'
                            }`}
                    >
                        Events
                    </button>
                </div>
            </header>

            {isMasterManagerOpen && (
                <MasterDataManager
                    onClose={() => setIsMasterManagerOpen(false)}
                    allowedTabs={['recipientCategories']}
                    onRefresh={() => {
                        // Refresh will happen due to dependency on isMasterManagerOpen in useEffect
                    }}
                />
            )}

            <AnimatePresence mode="wait">
                {activeTab === 'recipes' ? (
                    <RecipesTab
                        key="recipes"
                        recipes={recipes}
                        setRecipes={setRecipes}
                        inventory={inventory}
                        subTab={recipeSubTab}
                        setSubTab={setRecipeSubTab}
                        recipientCategories={recipientCategories}
                        setIsMasterManagerOpen={setIsMasterManagerOpen}
                    />
                ) : (
                    <EventsTab
                        key="events"
                        events={events}
                        setEvents={setEvents}
                        recipes={recipes} // Needs recipes for dropdown
                        recipientCategories={recipientCategories}
                    />
                )}
            </AnimatePresence>
        </main>
    );
}

// --- RECIPES TAB COMPONENT ---
function RecipesTab({ recipes, setRecipes, inventory, subTab, setSubTab, recipientCategories, setIsMasterManagerOpen }) {
    const { isReadOnly } = useCompany();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingRecipe, setEditingRecipe] = useState(null);
    const [videoModal, setVideoModal] = useState({ isOpen: false, videoSrc: null, title: '' });

    // Form states
    const [recipeName, setRecipeName] = useState('');
    const [recipeDescription, setRecipeDescription] = useState('');
    const [youtubeLink, setYoutubeLink] = useState('');
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [inventorySearch, setInventorySearch] = useState('');
    const [isInventoryFocused, setIsInventoryFocused] = useState(false);

    const { setFormData, forms } = useFormStore();
    const [isHydrated, setIsHydrated] = useState(false);

    // Sync with persistent store for RecipesTab
    useEffect(() => {
        const persistedData = forms['recipe-tab'];
        if (persistedData) {
            if (persistedData.searchTerm) setSearchTerm(persistedData.searchTerm);
            if (persistedData.recipeName) setRecipeName(persistedData.recipeName);
            if (persistedData.recipeDescription) setRecipeDescription(persistedData.recipeDescription);
            if (persistedData.youtubeLink) setYoutubeLink(persistedData.youtubeLink);
            if (persistedData.selectedIngredients) setSelectedIngredients(persistedData.selectedIngredients);
            if (persistedData.baseSize) setBaseSize(persistedData.baseSize);
            if (persistedData.recipeUnit) setRecipeUnit(persistedData.recipeUnit);
            if (persistedData.peopleCounts) setPeopleCounts(persistedData.peopleCounts);
        }
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated) {
            setFormData('recipe-tab', {
                searchTerm, recipeName, recipeDescription, youtubeLink,
                selectedIngredients, baseSize, recipeUnit, peopleCounts
            });
        }
    }, [searchTerm, recipeName, recipeDescription, youtubeLink, selectedIngredients, baseSize, recipeUnit, peopleCounts, isHydrated]);

    // New UI specific states
    const [baseSize, setBaseSize] = useState(1);
    const [recipeUnit, setRecipeUnit] = useState('Kg');
    const [peopleCounts, setPeopleCounts] = useState({});

    React.useEffect(() => {
        if (isModalOpen && !editingRecipe) {
            const initial = {};
            (recipientCategories || []).forEach(cat => initial[cat.name] = '');
            setPeopleCounts(initial);
        }
    }, [isModalOpen, recipientCategories, editingRecipe]);

    const handlePeopleCountChange = (catName, value) => {
        setPeopleCounts(prev => ({ ...prev, [catName]: value }));
    };

    const filteredRecipes = useMemo(() => {
        return recipes.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [recipes, searchTerm]);

    const inventoryResults = useMemo(() => {
        const available = inventory.filter(item =>
            !selectedIngredients.some(si => si.itemId === item.id)
        );
        if (!inventorySearch) return available;
        return available.filter(item =>
            item.name.toLowerCase().includes(inventorySearch.toLowerCase())
        );
    }, [inventorySearch, selectedIngredients, inventory]);

    const handleAddIngredient = (item) => {
        const initialQtd = {};
        recipientCategories.forEach(cat => initialQtd[cat.name] = '');

        setSelectedIngredients([...selectedIngredients, {
            itemId: item.id,
            name: item.name,
            unit: item.unit,
            qty: '',
            rate: '',
            qtd: initialQtd
        }]);
        setInventorySearch('');
        setIsInventoryFocused(false);
    };

    const handleRemoveIngredient = (itemId) => {
        setSelectedIngredients(selectedIngredients.filter(si => si.itemId !== itemId));
    };

    const handleSingleQtyChange = (itemId, value) => {
        setSelectedIngredients(selectedIngredients.map(si => {
            if (si.itemId === itemId) {
                const newQtd = {};
                recipientCategories.forEach(cat => newQtd[cat.name] = value);
                return { ...si, qty: value, qtd: newQtd };
            }
            return si;
        }));
    };

    const handleRateChange = (itemId, value) => {
        setSelectedIngredients(selectedIngredients.map(si => {
            if (si.itemId === itemId) {
                return { ...si, rate: value };
            }
            return si;
        }));
    };

    const handleUnitChange = (itemId, value) => {
        setSelectedIngredients(selectedIngredients.map(si => {
            if (si.itemId === itemId) {
                return { ...si, unit: value };
            }
            return si;
        }));
    };

    const getVideoSrc = (url) => {
        if (!url) return null;
        // Check for YouTube
        const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const ytMatch = url.match(ytRegExp);
        if (ytMatch && ytMatch[2].length === 11) {
            return `https://www.youtube.com/embed/${ytMatch[2]}?autoplay=1`;
        }
        // Check for Google Drive
        const gdRegExp = /drive\.google\.com\/(?:file\/d\/|open\?id=)([-\w]+)/;
        const gdMatch = url.match(gdRegExp);
        if (gdMatch && gdMatch[1]) {
            return `https://drive.google.com/file/d/${gdMatch[1]}/preview`;
        }
        return null;
    };

    const handleSaveRecipe = async (e) => {
        e.preventDefault();
        if (isReadOnly) return;
        if (!recipeName || selectedIngredients.length === 0) return;

        const payload = {
            name: recipeName,
            description: recipeDescription,
            baseSize: baseSize,
            recipeUnit: recipeUnit,
            peopleCounts: peopleCounts,
            ingredients: selectedIngredients,
            youtubeLink: youtubeLink
        };

        try {
            if (editingRecipe) {
                const res = await fetch('/api/recipes', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, id: editingRecipe.id })
                });
                if (res.ok) {
                    const updated = await res.json();
                    setRecipes(recipes.map(r => r.id === editingRecipe.id ? { ...updated, id: updated._id } : r));
                }
            } else {
                const res = await fetch('/api/recipes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    const created = await res.json();
                    setRecipes([{ ...created, id: created._id }, ...recipes]);
                }
            }
            closeModal();
        } catch (error) {
            console.error("Error saving recipe:", error);
            alert("Failed to save recipe");
        }
    };

    const openModal = (recipe = null, viewOnly = false) => {
        setIsViewMode(viewOnly);
        if (recipe) {
            setEditingRecipe(recipe);
            setRecipeName(recipe.name);
            setRecipeDescription(recipe.description || '');
            setBaseSize(recipe.baseSize || 1);
            setRecipeUnit(recipe.recipeUnit || 'Kg');
            setPeopleCounts(recipe.peopleCounts || {});
            setYoutubeLink(recipe.youtubeLink || '');
            const mappedIn = recipe.ingredients.map(ing => {
               const firstVal = ing.qtd ? Object.values(ing.qtd)[0] : '';
               return {
                   ...ing,
                   qty: ing.qty !== undefined ? ing.qty : firstVal,
                   rate: ing.rate || ''
               }
            });
            setSelectedIngredients(mappedIn);
        } else {
            setEditingRecipe(null);
            setRecipeName('');
            setRecipeDescription('');
            setYoutubeLink('');
            setSelectedIngredients([]);
            setBaseSize(1);
            setRecipeUnit('Kg');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsViewMode(false);
        setEditingRecipe(null);
        setRecipeName('');
        setRecipeDescription('');
        setYoutubeLink('');
        setSelectedIngredients([]);
        setInventorySearch('');
        setBaseSize(1);
        setRecipeUnit('Kg');
    };

    const handleDeleteRecipe = async (id) => {
        if (isReadOnly) return;
        if (confirm('Delete this recipe?')) {
            try {
                const res = await fetch(`/api/recipes?id=${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setRecipes(recipes.filter(r => r.id !== id));
                } else {
                    alert("Failed to delete");
                }
            } catch (error) {
                console.error("Error deleting:", error);
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8 justify-between w-full">
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-focus-within:text-[#df6a1f] transition-colors" />
                        <input
                            type="text"
                            placeholder="Quick Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-48 sm:w-64 pl-10 pr-6 py-2 bg-card border border-border rounded-full text-sm outline-none focus:ring-2 focus:ring-[#df6a1f]/20 focus:border-[#df6a1f] transition-all placeholder:text-slate-600 font-medium shadow-sm"
                        />
                    </div>
                    <button className="px-6 py-2 bg-[#4a4a4a] text-white rounded-full text-sm font-medium hover:bg-[#3a3a3a] transition-all shadow-sm">
                        Scale
                    </button>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 bg-transparent">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setSubTab('my-recipes')}
                            className={`px-4 sm:px-5 py-2 rounded-full text-[13px] font-bold transition-all shadow-sm ${subTab === 'my-recipes' ? 'bg-[#df6a1f] text-white' : 'bg-transparent text-[#718096] hover:text-[#2d3748]'
                                }`}
                        >
                            My Recipe
                        </button>
                        <button
                            onClick={() => setSubTab('global')}
                            className={`px-4 sm:px-5 py-2 rounded-full text-[13px] font-bold transition-all shadow-sm ${subTab === 'global' ? 'bg-[#df6a1f] text-white' : 'bg-transparent text-[#718096] hover:text-[#2d3748]'
                                }`}
                        >
                            Global Recipe
                        </button>
                    </div>

                    {subTab === 'global' && <CompanyFilter />}

                    {subTab === 'my-recipes' && !isReadOnly && (
                        <button
                            onClick={() => openModal()}
                            className="flex items-center gap-2 text-[#718096] hover:text-[#df6a1f] transition-all text-[13px] font-bold pr-2"
                        >
                            New Recipe
                            <span className="w-5 h-5 flex items-center justify-center rounded-full border-[1.5px] border-[#df6a1f] text-[#df6a1f] hover:bg-[#df6a1f] hover:text-white transition-colors">
                                <Plus size={14} strokeWidth={2.5} />
                            </span>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 px-1">
                <AnimatePresence>
                    {filteredRecipes.map((recipe) => (
                        <motion.div
                            key={recipe.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-card rounded-[16px] overflow-hidden flex flex-col group transition-all duration-300 border border-border/60 shadow-[0_2px_12px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgb(223,106,31,0.12)]"
                        >
                            <div className="p-6 pb-5 flex flex-col items-center flex-1">
                                <div className="flex items-center justify-center gap-4 w-full mb-5">
                                    <div className="w-12 h-12 bg-muted rounded-[10px] flex items-center justify-center text-muted-foreground group-hover:bg-[#df6a1f] group-hover:text-white transition-colors duration-300 shrink-0">
                                        <ChefHat size={22} strokeWidth={2} />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        {subTab === 'global' && recipe.companyId?.name && (
                                            <span className="text-[10px] font-bold text-muted-foreground mb-0.5 truncate max-w-[150px]">
                                                {recipe.companyId.name}
                                            </span>
                                        )}
                                        <h3 className="text-[20px] font-serif text-[#4a5568] tracking-tight truncate max-w-[160px] leading-tight">
                                            {recipe.name}
                                        </h3>
                                        <div className="flex gap-2 mt-1.5">
                                            <span className="text-[8px] font-bold text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-[4px] uppercase tracking-widest whitespace-nowrap leading-relaxed">
                                                {recipe.ingredients.length} INGREDS
                                            </span>
                                            <span className="text-[8px] font-bold text-[#ea580c] bg-[#ffedd5] px-2 py-0.5 rounded-[4px] uppercase tracking-widest whitespace-nowrap leading-relaxed">
                                                1 SERVINGS
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center gap-3 mt-auto w-full">
                                    {subTab === 'my-recipes' && !isReadOnly && (
                                        <>
                                            <button onClick={() => openModal(recipe)} className="flex h-10 w-10 items-center justify-center rounded-2xl border transition-all border-orange-200 bg-orange-50 text-orange-500 hover:bg-orange-100 hover:border-orange-300 shadow-sm group-hover:shadow-md group-hover:scale-105 active:scale-95">
                                                <Edit3 size={12} strokeWidth={2.5} />
                                            </button>
                                            <button onClick={() => handleDeleteRecipe(recipe.id)} className="w-[28px] h-[28px] rounded-full border border-red-200 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                                                <Trash2 size={12} strokeWidth={2.5} />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (recipe.youtubeLink && getVideoSrc(recipe.youtubeLink)) {
                                                setVideoModal({
                                                    isOpen: true,
                                                    videoSrc: getVideoSrc(recipe.youtubeLink),
                                                    title: recipe.name
                                                });
                                            }
                                        }}
                                        className={`w-[28px] h-[28px] rounded-full flex items-center justify-center text-white transition-colors shadow-sm ${recipe.youtubeLink && getVideoSrc(recipe.youtubeLink) ? 'bg-[#ef4444] hover:bg-red-600' : 'bg-[#ef4444] hover:bg-red-600 opacity-80'}`}
                                        title={recipe.youtubeLink ? "Watch Video" : "No Video"}
                                    >
                                        <Play size={10} fill="currentColor" className="ml-0.5" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mt-auto">
                                <button 
                                    onClick={() => openModal(recipe, subTab === 'global')}
                                    className="w-full py-[10px] bg-[#4a4a4a] text-white text-[13px] font-medium flex items-center justify-center gap-2 group-hover:bg-[#df6a1f] transition-colors duration-300"
                                >
                                    Scale Recipe <ArrowRight size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Modal for Creating/Editing Recipe */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="bg-slate-900/60 backdrop-blur-md absolute inset-0"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-card w-full max-w-4xl rounded-2xl shadow-2xl relative flex flex-col max-h-[95vh] sm:max-h-[90vh]"
                        >
                            {/* Orange Header */}
                            <div className="bg-[#e67022] w-full px-8 py-5 relative shrink-0 rounded-t-2xl">
                                <button type="button" onClick={closeModal} className="absolute top-5 right-6 text-white hover:text-white/80 transition-colors">
                                    <X size={26} strokeWidth={2.5} />
                                </button>
                                <h2 className="text-[28px] font-sans font-medium text-white tracking-wide">
                                    {isViewMode ? 'Recipe Details' : (editingRecipe ? 'Modify Recipe' : 'New Recipe')}
                                </h2>
                                <p className="text-white text-[11px] font-serif mt-1">
                                    Recipe(English / Hindi / Gujarati supported)
                                </p>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col rounded-b-2xl">
                                <form onSubmit={handleSaveRecipe} className="flex flex-col">
                                    
                                    {/* Beige Top Section */}
                                    <div className="bg-[#f0ece5] w-full px-8 pt-8 pb-10 flex flex-col gap-10">
                                        {/* Top Row: Recipe Name, Base Size, Unity */}
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="flex items-center gap-3 w-full md:w-auto">
                                                <label className="text-[14px] font-serif font-bold text-foreground whitespace-nowrap">Recipe Name :</label>
                                                <input
                                                    type="text"
                                                    required={!isViewMode}
                                                    readOnly={isViewMode}
                                                    value={recipeName}
                                                    onChange={(e) => setRecipeName(e.target.value)}
                                                    className="w-full md:w-56 px-3 py-1.5 bg-card rounded-[4px] border border-border outline-none focus:border-[#df6a1f] font-serif text-[#d47b33] font-bold shadow-sm text-[15px]"
                                                    placeholder={isViewMode ? '' : 'Khaman'}
                                                />
                                            </div>
                                            <div className="flex items-center gap-6 md:gap-10 w-full md:w-auto">
                                                <div className="flex items-center gap-3">
                                                    <label className="text-[14px] font-serif font-bold text-foreground whitespace-nowrap">Base Size :</label>
                                                    <input
                                                        type="number"
                                                        value={baseSize}
                                                        onChange={(e) => setBaseSize(e.target.value)}
                                                        disabled={isViewMode}
                                                        className="w-16 px-2 py-1.5 bg-card rounded-[4px] border border-border outline-none focus:border-[#df6a1f] font-serif text-center shadow-sm text-[15px]"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <label className="text-[14px] font-serif font-bold text-foreground whitespace-nowrap">Unity :</label>
                                                    <select
                                                        value={recipeUnit}
                                                        onChange={(e) => setRecipeUnit(e.target.value)}
                                                        disabled={isViewMode}
                                                        className="w-20 px-2 py-1.5 bg-card rounded-[4px] border border-border outline-none focus:border-[#df6a1f] font-serif shadow-sm text-[15px]"
                                                    >
                                                        <option value="Kg">Kg</option>
                                                        <option value="gm">gm</option>
                                                        <option value="Ltr">Ltr</option>
                                                        <option value="ml">ml</option>
                                                        <option value="Pcs">Pcs</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="w-full border-b-[1.5px] border-border/40 shadow-[0_1px_0_rgba(255,255,255,0.8)] border-dashed"></div>

                                        {/* Number of People */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-[16px] font-serif text-[#d6752d]">Number of People :</h3>
                                                {!isViewMode && (
                                                    <button type="button" onClick={() => setIsMasterManagerOpen(true)} className="text-[11px] font-serif font-bold text-[#4a4a4a] hover:text-[#df6a1f] flex items-center transition-colors">
                                                        Add People Category <Plus size={16} className="text-[#df6a1f] stroke-[3px]" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-8">
                                                {(recipientCategories || []).map(p => (
                                                    <div key={p._id} className="flex flex-col items-center gap-2">
                                                        <label className="text-[13px] font-serif font-bold text-[#d6752d] capitalize">{p.name}</label>
                                                        <input
                                                            type="number"
                                                            value={peopleCounts[p.name] || ''}
                                                            onChange={(e) => handlePeopleCountChange(p.name, e.target.value)}
                                                            disabled={isViewMode}
                                                            className="w-[84px] px-2 py-2 bg-card rounded-[4px] border border-border outline-none focus:border-[#df6a1f] font-serif font-bold text-center shadow-sm text-[15px] text-foreground"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* White Bottom Section */}
                                    <div className="bg-card w-full px-8 py-8 space-y-10">
                                        {/* Ingredients */}
                                        <div className="space-y-6">
                                            <h3 className="text-[22px] font-serif text-foreground">
                                                <span className="text-[#d6752d]">{recipeName ? `${recipeName} ` : ''}{baseSize}{recipeUnit}</span> Recipe
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[16px] font-serif text-[#d6752d]">Ingredients List :</h4>
                                                {!isViewMode && (
                                                    <div className="relative">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setIsInventoryFocused(!isInventoryFocused)}
                                                            className="w-8 h-8 bg-[#e67022] text-white rounded-[4px] flex items-center justify-center hover:bg-[#c85a1a] transition-colors shadow-sm"
                                                        >
                                                            <Plus size={20} className="stroke-[3px]" />
                                                        </button>
                                                        {isInventoryFocused && (
                                                            <div className="absolute right-0 top-full mt-2 w-72 bg-card rounded-xl shadow-2xl z-[100] max-h-60 overflow-y-auto p-2 ring-1 ring-slate-200 border border-border">
                                                                 <input
                                                                    type="text"
                                                                    placeholder="Search from inventory..."
                                                                    value={inventorySearch}
                                                                    onChange={(e) => setInventorySearch(e.target.value)}
                                                                    className="w-full px-4 py-2 bg-muted rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#df6a1f]/20 outline-none transition-all placeholder:text-muted-foreground mb-2 border border-border"
                                                                    autoFocus
                                                                />
                                                                {inventoryResults.map(item => (
                                                                    <button
                                                                        key={item.id}
                                                                        type="button"
                                                                        onClick={() => handleAddIngredient(item)}
                                                                        className="w-full text-left px-4 py-2.5 hover:bg-orange-50 hover:text-[#df6a1f] rounded-lg transition-all text-xs font-black uppercase flex items-center justify-between group"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <Package size={12} className="text-slate-600 group-hover:text-[#df6a1f]" />
                                                                            <span>{item.name}</span>
                                                                        </div>
                                                                        <Plus size={14} className="text-[#df6a1f] scale-0 group-hover:scale-100 transition-transform" />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                {selectedIngredients.map((ing) => (
                                                    <div key={ing.itemId} className="flex flex-wrap md:flex-nowrap items-center gap-4 bg-[#fffaf5] px-4 py-3 rounded-xl border border-[#f3d2be]">
                                                        <input
                                                            type="text"
                                                            readOnly
                                                            value={ing.name}
                                                            className="flex-1 w-full md:w-auto px-4 py-2 bg-card rounded-[4px] border border-[#f0d8ca] outline-none font-serif text-[#d6752d] text-[15px] font-bold cursor-default"
                                                        />
                                                        <input
                                                            type="number"
                                                            value={ing.qty || ''}
                                                            onChange={(e) => handleSingleQtyChange(ing.itemId, e.target.value)}
                                                            disabled={isViewMode}
                                                            className="w-[100px] px-2 py-2 bg-card rounded-[4px] border border-[#f0d8ca] outline-none focus:border-[#df6a1f] font-serif text-center font-bold text-foreground text-[15px]"
                                                        />
                                                        <select
                                                            value={ing.unit}
                                                            onChange={(e) => handleUnitChange(ing.itemId, e.target.value)}
                                                            disabled={isViewMode}
                                                            className="w-[100px] px-2 py-2 bg-card rounded-[4px] border border-[#f0d8ca] outline-none focus:border-[#df6a1f] font-serif font-bold text-foreground text-[15px]"
                                                        >
                                                            <option value="Kg">Kg</option>
                                                            <option value="gm">gm</option>
                                                            <option value="Ltr">Ltr</option>
                                                            <option value="ml">ml</option>
                                                            <option value="Pcs">Pcs</option>
                                                            <option value={ing.unit}>{ing.unit}</option>
                                                        </select>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-serif text-[12px] font-bold">₹</span>
                                                            <input
                                                                type="number"
                                                                value={ing.rate || ''}
                                                                onChange={(e) => handleRateChange(ing.itemId, e.target.value)}
                                                                disabled={isViewMode}
                                                                className="w-[100px] pl-[22px] pr-2 py-2 bg-card rounded-[4px] border border-[#f0d8ca] outline-none focus:border-[#df6a1f] font-serif text-center font-bold text-foreground text-[15px]"
                                                            />
                                                        </div>
                                                        {!isViewMode && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveIngredient(ing.itemId)}
                                                                className="p-1 text-[#ef4444] hover:text-red-700 transition-colors"
                                                            >
                                                                <Trash2 size={16} strokeWidth={2.5} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                {selectedIngredients.length === 0 && (
                                                    <div className="py-8 text-center bg-[#fffaf5] border border-[#f3d2be] rounded-xl border-dashed">
                                                        <p className="text-sm font-serif text-[#df6a1f]">Click '+' to select ingredients</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Recipe Method */}
                                        <div className="space-y-3">
                                            <h4 className="text-[14px] font-serif text-[#d6752d]">Recipe Method :</h4>
                                            <textarea
                                                value={recipeDescription}
                                                onChange={(e) => setRecipeDescription(e.target.value)}
                                                readOnly={isViewMode}
                                                placeholder="Write steps here..."
                                                rows={3}
                                                className="w-full px-5 py-4 bg-[#fffaf5] rounded-[10px] border border-[#f3d2be] focus:border-[#df6a1f] outline-none transition-colors font-serif text-[15px] resize-none text-foreground"
                                            />
                                        </div>

                                        {/* Video Link */}
                                        <div className="space-y-3">
                                            <h4 className="text-[14px] font-serif text-[#d6752d]">Video Link (YouTube / Google Drive) :</h4>
                                            <input
                                                type="text"
                                                value={youtubeLink}
                                                onChange={(e) => setYoutubeLink(e.target.value)}
                                                readOnly={isViewMode}
                                                placeholder="https://www.youtube.com/watch?v=..."
                                                className="w-full px-5 py-3 bg-[#fffaf5] rounded-[10px] border border-[#f3d2be] focus:border-[#df6a1f] outline-none transition-colors font-serif text-[15px] text-[#4a4a4a] font-bold"
                                            />
                                        </div>

                                        {/* Footer buttons */}
                                        <div className="pt-6 flex items-center justify-end gap-6">
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="text-[14px] font-serif font-bold text-[#4a4a4a] hover:text-foreground transition-colors"
                                            >
                                                {isViewMode ? 'Close' : 'Cancel'}
                                            </button>
                                            {!isViewMode && !isReadOnly && (
                                                <button
                                                    type="submit"
                                                    className="px-8 py-2.5 bg-[#e67022] text-white rounded-[4px] font-serif font-bold text-[14px] hover:bg-[#c85a1a] transition-colors"
                                                >
                                                    Save Receipt
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Video Modal */}
            <AnimatePresence>
                {videoModal.isOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setVideoModal({ ...videoModal, isOpen: false })}
                            className="bg-black/80 backdrop-blur-md absolute inset-0"
                        />
                        <button
                            onClick={() => setVideoModal({ ...videoModal, isOpen: false })}
                            className="absolute top-6 right-6 z-[120] w-12 h-12 bg-card/10 hover:bg-card/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all"
                        >
                            <X size={24} />
                        </button>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-black w-full max-w-4xl aspect-video rounded-3xl shadow-2xl relative overflow-hidden"
                        >
                            <iframe
                                width="100%"
                                height="100%"
                                src={videoModal.videoSrc}
                                title={videoModal.title}
                                frameBorder="0"
                                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full bg-black/5"
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// --- EVENTS TAB COMPONENT ---
function EventsTab({ events, setEvents, recipes, recipientCategories }) {
    const { isReadOnly } = useCompany();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRasoiId, setSelectedRasoiId] = useState('');
    const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
    const [personCounts, setPersonCounts] = useState(() => {
        const initial = {};
        (recipientCategories || []).forEach(cat => initial[cat.name] = '');
        return initial;
    });

    React.useEffect(() => {
        if (isModalOpen) {
            const initial = {};
            (recipientCategories || []).forEach(cat => initial[cat.name] = '');
            setPersonCounts(initial);
        }
    }, [isModalOpen, recipientCategories]);

    const selectedRasoi = useMemo(() => {
        return recipes.find(r => r.id === selectedRasoiId);
    }, [selectedRasoiId, recipes]);

    const calculations = useMemo(() => {
        if (!selectedRasoi) return [];

        return selectedRasoi.ingredients.map(ing => {
            let total = 0;
            const categoryTotals = {};

            Object.keys(personCounts).forEach(cat => {
                const count = Number(personCounts[cat]) || 0;
                const qtyPerPerson = (ing.qtd || {})[cat] || 0;
                const catTotal = count * qtyPerPerson;
                total += catTotal;
                categoryTotals[cat] = catTotal;
            });

            return {
                name: ing.name,
                unit: ing.unit,
                ...categoryTotals,
                total: total.toFixed(3)
            };
        });
    }, [selectedRasoi, personCounts]);

    const totalAttendance = Object.values(personCounts).reduce((acc, val) => acc + (Number(val) || 0), 0);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (isReadOnly) return;
        if (!selectedRasoiId || totalAttendance === 0) return;

        const payload = {
            date: eventDate,
            recipeId: selectedRasoiId,
            eventName: selectedRasoi.name,
            counts: personCounts,
            companyId: isReadOnly ? undefined : selectedCompanyIds[0] // Added companyId to payload
        };

        try {
            const res = await fetch('/api/event-plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const newEvent = await res.json();
                setEvents([{ ...newEvent, id: newEvent._id }, ...events]);
                closeModal();
            } else {
                alert("Failed to create event");
            }
        } catch (error) {
            console.error("Error creating event", error);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRasoiId('');
        const initial = {};
        (recipientCategories || []).forEach(cat => initial[cat.name] = '');
        setPersonCounts(initial);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            {!isReadOnly && (
                <div className="flex justify-end mb-8">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-orange-100 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <Plus size={18} strokeWidth={3} /> Plan New Event
                    </button>
                </div>
            )}

            {/* Event History List */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <History size={18} className="text-muted-foreground" />
                    <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Recent Planned Events</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {events.map((event) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-card rounded-[2.5rem] shadow-sm p-8 hover:shadow-md transition-shadow group"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-muted rounded-2xl flex flex-col items-center justify-center text-foreground">
                                            <span className="text-[8px] font-black uppercase leading-none mb-1 text-muted-foreground">
                                                {new Date(event.date).toLocaleDateString(undefined, { month: 'short' })}
                                            </span>
                                            <span className="text-lg font-black leading-none">
                                                {new Date(event.date).getDate()}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-foreground tracking-tight uppercase">{event.rasoiName}</h3>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Planned for {event.totalPersons} total persons</p>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-110 transition-transform">
                                        <ClipboardCheck size={20} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                    {(recipientCategories || []).map(p => {
                                        const style = getStyle(p.name);
                                        return (
                                            <div key={p._id} className={`${style.bg} rounded-2xl p-3 text-center`}>
                                                <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${style.color}`}>{p.name}</p>
                                                <p className="text-sm font-black text-foreground">{(event.counts || {})[p.name] || 0}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Planning Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="bg-slate-900/60 backdrop-blur-md absolute inset-0"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-card w-full max-w-6xl rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col lg:flex-row max-h-[95vh] sm:max-h-[90vh]"
                        >
                            {/* Input Form Side */}
                            <div className="flex-[4] p-6 lg:p-10 overflow-y-auto no-scrollbar order-2 lg:order-1">
                                <header className="mb-8">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3">
                                        <Calculator size={12} /> Resource Projection
                                    </div>
                                    <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Quantify Event Needs</h2>
                                </header>

                                <form onSubmit={handleCreateEvent} className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Select Rasoi Template</label>
                                            <div className="relative">
                                                <UtensilsCrossed size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500" />
                                                <select
                                                    required
                                                    value={selectedRasoiId}
                                                    onChange={(e) => setSelectedRasoiId(e.target.value)}
                                                    className="w-full pl-14 pr-6 py-4 bg-muted rounded-2xl focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-black text-sm uppercase appearance-none"
                                                >
                                                    <option value="">Choose a recipe portfolio...</option>
                                                    {recipes.map(r => (
                                                        <option key={r.id} value={r.id}>{r.name}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Event Date</label>
                                            <div className="relative">
                                                <Calendar size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500" />
                                                <input
                                                    type="date"
                                                    required
                                                    value={eventDate}
                                                    onChange={(e) => setEventDate(e.target.value)}
                                                    className="w-full pl-14 pr-6 py-4 bg-muted rounded-2xl focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-black text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 px-2">
                                            <Users size={16} className="text-muted-foreground" />
                                            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest underline decoration-orange-500/30 underline-offset-4">Attendance Matrix</h3>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {(recipientCategories || []).map(p => {
                                                const style = getStyle(p.name);
                                                return (
                                                    <div key={p._id} className="space-y-2 group">
                                                        <div className="flex items-center gap-1.5 ml-1">
                                                            <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                                                            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{p.name}</label>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            placeholder="0"
                                                            value={personCounts[p.name] || ''}
                                                            onChange={(e) => setPersonCounts({ ...personCounts, [p.name]: e.target.value })}
                                                            className="w-full px-5 py-5 bg-muted rounded-2xl text-center font-black text-lg text-foreground focus:ring-2 focus:ring-orange-500/20 outline-none transition-all focus:bg-card"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Real-time Calculation Display */}
                                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden min-h-[300px]">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-[80px]" />

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-center mb-8">
                                                <div>
                                                    <h4 className="text-xl font-black tracking-tight uppercase">Required Inventory</h4>
                                                    <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mt-1">Calculated based on {totalAttendance} persons</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-3xl font-black text-orange-500 tracking-tighter tabular-nums">{totalAttendance}</span>
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase block tracking-widest -mt-1">Total Pack</span>
                                                </div>
                                            </div>

                                            {calculations.length > 0 ? (
                                                <div className="space-y-4">
                                                    {calculations.map((calc, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-4 bg-card/5 rounded-2xl hover:bg-card/10 transition-colors">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-500 flex items-center justify-center font-black text-xs uppercase">
                                                                    {calc.name[0]}
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-sm uppercase tracking-tight">{calc.name}</p>
                                                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Projection for tomorrow</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-lg font-black text-orange-400 tracking-tight tabular-nums">
                                                                    {calc.total} <span className="text-[10px] text-muted-foreground uppercase ml-1">{calc.unit}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-10 opacity-30">
                                                    <Scale size={48} className="mb-4" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">Select Rasoi to see projections</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all"
                                        >
                                            Cancel Planning
                                        </button>
                                        {!isReadOnly && (
                                            <button
                                                type="submit"
                                                disabled={!selectedRasoiId || totalAttendance === 0}
                                                className="flex-[2] py-5 rounded-2xl bg-orange-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-100 disabled: disabled:cursor-not-allowed hover:scale-[1.02] transition-all active:scale-95"
                                            >
                                                Confirm Event Log
                                            </button>
                                         )}
                                    </div>
                                </form>
                            </div>

                            {/* Info Side Context */}
                            <div className="flex-[2] bg-[#fdfcfb] p-8 lg:p-12 border-slate-50 flex flex-col order-1 lg:order-2">
                                <button onClick={closeModal} className="self-end p-3 bg-card rounded-2xl text-muted-foreground hover:text-foreground transition-colors mb-12">
                                    <X size={20} />
                                </button>

                                <div className="space-y-8">
                                    <div className="w-16 h-16 bg-orange-50 rounded-[1.8rem] flex items-center justify-center text-orange-600">
                                        <Info size={32} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-foreground tracking-tight uppercase leading-tight mb-4">Smart <br /> Meal Logistics</h3>
                                        <p className="text-muted-foreground text-xs font-medium leading-relaxed">
                                            This tool performs <span className="text-orange-600 font-black uppercase">Real-Time Weight Calculation</span> based on the individual requirements defined in Recipe Management & Quantity Templates.
                                        </p>
                                    </div>

                                    <div className="space-y-4 pt-8">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">1</div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed mt-1">Select a stored recipe template</p>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">2</div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed mt-1">Input person counts for each category</p>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">3</div>
                                            <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-relaxed mt-1">View total stock requirements instantly</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-10">
                                    <div className="p-6 bg-card rounded-[2rem] shadow-sm">
                                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1 text-center">Current Session Stats</p>
                                        <div className="flex justify-around items-center h-12">
                                            <div className="text-center">
                                                <p className="text-xs font-black text-foreground">{recipes.length}</p>
                                                <p className="text-[7px] font-black text-muted-foreground uppercase">Recipes</p>
                                            </div>
                                            <div className="w-px h-6 bg-muted" />
                                            <div className="text-center">
                                                <p className="text-xs font-black text-foreground">{events.length + 1}</p>
                                                <p className="text-[7px] font-black text-muted-foreground uppercase">Planned</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
