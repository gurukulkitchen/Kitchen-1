
// app\recipe-qty\page.js

"use client";
import SearchableSelect from '../../components/SearchableSelect';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import { ShieldAlert } from 'lucide-react';
import usePermissions from "@/hooks/usePermissions";
import PermissionWrapper from "@/components/PermissionWrapper";
import TableActionButton from "@/components/TableActionButton";
import { motion, AnimatePresence } from 'framer-motion';
import { useCompany } from '@/context/CompanyContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addStandardHeader } from '@/lib/pdfGenerator';
import MasterDataManager from '@/components/MasterDataManager';
import {
    PlusCircle,
    Utensils,
    Scale,
    Trash2,
    Plus,
    X,
    ChevronDown,
    ChevronUp,
    Save,
    Calculator,
    ChefHat,
    ArrowRight,
    Check,
    ReceiptText,
    UserPlus,
    Search,
    Edit3,
    Edit,
    Play,
    Users,
    GraduationCap,
    Crown,
    Baby,
    Database
} from 'lucide-react';

import { formatIndianNumber } from '../../lib/formatters';
import { color } from 'highcharts';

export default function RecipesPage() {
    const { isReadOnly, selectedCompanyIds, companyName, companyAddress, companyPhone } = useCompany();
    const recipeResultsRef = useRef(null);
    const [activeTab, setActiveTab] = useState('manage');
    const [recipes, setRecipes] = useState([]);
    const [allRecipes, setAllRecipes] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { permissions, loading: permsLoading, hasPermission } = usePermissions();
    const [uploadingImage, setUploadingImage] = useState(false);
    const [recipeForm, setRecipeForm] = useState({
        id: null,
        name: '',
        baseQuantity: 1,
        baseUnit: 'kg',
        basePeople: {}, // { haribhakts: 10, students: 5, ... }
        ingredients: [],
        details: '',
        youtubeLink: '',
        image: ''
    });

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'recipes');

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.path) {
                setRecipeForm(prev => ({ ...prev, image: data.path }));
            } else {
                alert(data.error || 'Failed to upload image');
            }
        } catch (err) {
            console.error('Image upload error:', err);
            alert('Image upload failed');
        } finally {
            setUploadingImage(false);
        }
    };

    const [selectedRecipeId, setSelectedRecipeId] = useState('');
    const [targetQuantity, setTargetQuantity] = useState('');
    const [videoModal, setVideoModal] = useState({ isOpen: false, videoSrc: null, title: '' });

    const [ingredientInput, setIngredientInput] = useState({
        name: '',
        quantity: '',
        unit: 'kg',
        rate: ''
    });

    const [scaleMode, setScaleMode] = useState('people'); // 'people' or 'scale'
    const [peopleCategories, setPeopleCategories] = useState([]);
    const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editCategoryValue, setEditCategoryValue] = useState('');
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    const totalPeople = useMemo(() => {
        return peopleCategories.reduce((sum, cat) => sum + (Number(cat.count) || 0), 0);
    }, [peopleCategories]);

    const renderIcon = (iconName, size = 20) => {
        const icons = {
            Users: <Users size={size} />,
            GraduationCap: <GraduationCap size={size} />,
            Crown: <Crown size={size} />,
            UserPlus: <UserPlus size={size} />,
            Baby: <Baby size={size} />
        };
        return icons[iconName] || <Users size={size} />;
    };

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role === 'Super Admin') {
            setIsSuperAdmin(true);
        }
        fetchData();
        fetchPeopleCategories();
    }, [selectedCompanyIds]);

    const fetchPeopleCategories = async () => {
        try {
            const companyId = !isReadOnly && Array.isArray(selectedCompanyIds) && selectedCompanyIds.length > 0 ? selectedCompanyIds[0] : null;
            const url = `/api/people-categories${companyId ? `?companyId=${companyId}` : ''}`;
            const res = await fetch(url);
            let data = await res.json();

            if (res.ok && data.length === 0) {
                // Seed default categories if none exist
                const defaults = [
                    { name: 'Haribhakts', icon: 'Users' },
                    { name: 'Students', icon: 'GraduationCap' },
                    { name: 'VVIP', icon: 'Crown' },
                    { name: 'Others', icon: 'UserPlus' },
                    { name: 'Young', icon: 'Baby' }
                ];

                for (const d of defaults) {
                    await fetch('/api/people-categories', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...d, companyId })
                    });
                }
                const retryRes = await fetch(url);
                data = await retryRes.json();
            }

            if (res.ok) {
                setPeopleCategories(data.map(cat => ({ ...cat, id: cat._id, count: 0 })));
            }
        } catch (error) {
            console.error("Failed to fetch people categories:", error);
        }
    };

    const handleUpdateCategory = async (id, newName) => {
        if (!newName.trim()) return;
        try {
            const res = await fetch('/api/people-categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name: newName })
            });
            if (res.ok) {
                setEditingCategoryId(null);
                fetchPeopleCategories();
            }
        } catch (error) {
            console.error("Failed to update category:", error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [recipesRes, allRecipesRes, unitsRes] = await Promise.all([
                fetch('/api/recipes-qty'),
                fetch('/api/recipes-qty?isGlobal=true'),
                fetch('/api/units')
            ]);
            const recipesData = await recipesRes.json();
            const allRecipesData = await allRecipesRes.json();
            const unitsData = await unitsRes.json();

            setRecipes(Array.isArray(recipesData) ? recipesData.map(r => ({ ...r, id: r._id })) : []);
            setAllRecipes(Array.isArray(allRecipesData) ? allRecipesData.map(r => ({ ...r, id: r._id })) : []);
            setUnits(Array.isArray(unitsData) ? unitsData : []);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddIngredient = () => {
        if (!ingredientInput.name.trim() || !ingredientInput.quantity) return;
        setRecipeForm({
            ...recipeForm,
            ingredients: [...recipeForm.ingredients, { ...ingredientInput, tempId: Date.now() }]
        });
        setIngredientInput({ name: '', quantity: '', unit: 'kg', rate: '' });
    };

    const handleRemoveItem = (tempId, _id) => {
        setRecipeForm({
            ...recipeForm,
            ingredients: recipeForm.ingredients.filter(item =>
                _id ? item._id !== _id : item.tempId !== tempId
            )
        });
    };

    const handleItemChange = (tempId, _id, field, value) => {
        const updatedItems = recipeForm.ingredients.map(item => {
            const match = _id ? item._id === _id : item.tempId === tempId;
            return match ? { ...item, [field]: value } : item;
        });
        setRecipeForm({ ...recipeForm, ingredients: updatedItems });
    };

    const getIngredientUnitValue = (unit) => {
        if (!unit) return '';
        const unitStr = typeof unit === 'object' ? (unit._id || unit.name) : unit;
        if (!unitStr) return '';
        const found = units.find(u =>
            u._id?.toString() === unitStr?.toString() ||
            u.id?.toString() === unitStr?.toString() ||
            u.name?.toLowerCase() === unitStr?.toString()?.toLowerCase()
        );
        return found ? found._id : unitStr;
    };

    const handleEditRecipe = (recipe) => {
        const cleanedIngredients = (recipe.ingredients || []).map(item => {
            let unitVal = item.unit;
            if (unitVal) {
                const found = units.find(u =>
                    u._id?.toString() === (unitVal._id || unitVal)?.toString() ||
                    u.name?.toLowerCase() === (unitVal.name || unitVal)?.toString()?.toLowerCase()
                );
                if (found) unitVal = found._id;
            }
            return {
                ...item,
                unit: unitVal || '',
                tempId: item._id || Date.now() + Math.random()
            };
        });
        setRecipeForm({
            ...recipe,
            ingredients: cleanedIngredients,
            youtubeLink: recipe.youtubeLink || '',
            image: recipe.image || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmitRecipe = async (e) => {
        e.preventDefault();
        if (isReadOnly) return;
        if (!recipeForm.name.trim()) return;

        const cleanedIngredients = recipeForm.ingredients.map(item => {
            let unitId = typeof item.unit === 'object' ? item.unit?._id : item.unit;
            if (unitId && typeof unitId === 'string' && !/^[0-9a-fA-F]{24}$/.test(unitId)) {
                const found = units.find(u => u.name?.toLowerCase() === unitId.toLowerCase());
                if (found) {
                    unitId = found._id;
                }
            }
            return {
                name: item.name,
                quantity: Number(item.quantity) || 0,
                unit: unitId || undefined,
                rate: Number(item.rate) || 0
            };
        });

        try {
            const method = recipeForm.id ? 'PUT' : 'POST';
            const res = await fetch('/api/recipes-qty', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...recipeForm,
                    ingredients: cleanedIngredients,
                    companyId: isReadOnly ? undefined : selectedCompanyIds[0]
                })
            });

            if (res.ok) {
                await fetchData();
                setIsModalOpen(false);
                setRecipeForm({ id: null, name: '', baseQuantity: 1, baseUnit: 'kg', basePeople: {}, ingredients: [{ name: '', quantity: '', unit: '', rate: '', tempId: Date.now() }], details: '', youtubeLink: '', image: '' });
            } else {
                const data = await res.json();
                alert(data.error || "Failed to save recipe");
            }
        } catch (error) {
            console.error("Error saving recipe:", error);
        }
    };

    const deleteRecipe = async (id) => {
        if (isReadOnly) return;
        if (confirm('Are you sure you want to delete this recipe?')) {
            try {
                const res = await fetch(`/api/recipes-qty?id=${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setRecipes(recipes.filter(r => r.id !== id));
                    if (selectedRecipeId === id) setSelectedRecipeId('');
                } else {
                    alert("Failed to delete recipe");
                }
            } catch (error) {
                console.error("Error deleting recipe:", error);
            }
        }
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
        return url; // fallback to raw url
    };

    const handleShareImage = async () => {
        if (!recipeResultsRef.current || !selectedRecipe || !measurementResults) return;

        try {
            const element = recipeResultsRef.current;

            // Create wrapper with padding
            const wrapper = document.createElement("div");
            wrapper.style.background = "#ffffff";
            wrapper.style.padding = "40px"; // <-- padding from all sides
            wrapper.style.display = "inline-block";

            // Clone original content
            const clone = element.cloneNode(true);
            wrapper.appendChild(clone);

            // Add temporarily to body
            wrapper.style.position = "absolute";
            wrapper.style.left = "-9999px";
            document.body.appendChild(wrapper);

            const canvas = await html2canvas(wrapper, {
                scale: 4,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
                scrollX: 0,
                scrollY: 0
            });

            // Remove temp wrapper
            document.body.removeChild(wrapper);

            const fileName = `${selectedRecipe.name
                .replace(/[^a-z0-9]/gi, "_")
                .toLowerCase()}_recipe.png`;

            canvas.toBlob(async (blob) => {
                if (!blob) return;

                const file = new File([blob], fileName, { type: "image/png" });

                if (
                    navigator.share &&
                    navigator.canShare &&
                    navigator.canShare({ files: [file] })
                ) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: `${selectedRecipe.name} Recipe`,
                            text: `Shared Recipe: ${selectedRecipe.name} from KitchenPro`
                        });
                    } catch (shareError) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = fileName;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }
                } else {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }
            }, "image/png", 1.0);

        } catch (error) {
            console.error("Image gen error:", error);
            alert("Unable to generate photo in this browser. Please try taking a screenshot or use the PDF share option.");
        }
    };

    const handleShare = async (recipeArg = null, resultsArg = null) => {
        const recipeToShare = recipeArg || selectedRecipe;
        const resultsToShare = resultsArg || measurementResults;

        if (!recipeToShare || !resultsToShare) return;

        let logoDataUrl = null;
        try {
            const res = await fetch("/pdflogo.png");
            if (res.ok) {
                const blob = await res.blob();
                logoDataUrl = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            }
        } catch (e) {
            console.error("Failed to load logo", e);
        }

        const doc = new jsPDF();

        try {
            const [hindiFont, gujaratiFont] = await Promise.all([
                fetch("/fonts/NotoSansDevanagari-Regular.ttf").then(res => res.arrayBuffer()),
                fetch("/fonts/NotoSansGujarati-Regular.ttf").then(res => res.arrayBuffer()),
            ]);
            const toBinary = (buf) => Array.from(new Uint8Array(buf)).map(b => String.fromCharCode(b)).join('');
            doc.addFileToVFS("NotoSansDevanagari.ttf", toBinary(hindiFont));
            doc.addFont("NotoSansDevanagari.ttf", "NotoSansDevanagari", "normal");
            doc.addFileToVFS("NotoSansGujarati.ttf", toBinary(gujaratiFont));
            doc.addFont("NotoSansGujarati.ttf", "NotoSansGujarati", "normal");
        } catch (error) {
            console.error("Error loading fonts:", error);
        }

        const isGujarati = (recipeToShare.details || "").match(/[\u0A80-\u0AFF]/) ||
            resultsToShare.items.some(i => i.name.match(/[\u0A80-\u0AFF]/));
        const isHindi = (recipeToShare.details || "").match(/[\u0900-\u097F]/) ||
            resultsToShare.items.some(i => i.name.match(/[\u0900-\u097F]/));

        let selectedFont = "helvetica";
        if (isGujarati) selectedFont = "NotoSansGujarati";
        else if (isHindi) selectedFont = "NotoSansDevanagari";

        // --- PDF Header ---
        await addStandardHeader(doc, "Recipe Report", companyName, companyAddress, companyPhone);

        let currentY = 32;
        // --- Recipe Title & Meta ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(26);
        doc.setTextColor(28, 25, 23);
        doc.text(recipeToShare.name.toUpperCase(), 15, currentY);
        currentY += 10;

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        // Use either the shared target quantity or the recipe's base quantity
        const shareQty = recipeArg ? recipeToShare.baseQuantity : targetQuantity;
        doc.text(`SCALE: ${shareQty} ${recipeToShare.baseUnit || 'kg'}`, 15, currentY);

        // Right side stats box
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(125, 24, 70, 20, 3, 3, 'F');
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text("ESTIMATED GRAND TOTAL", 130, 30);
        doc.setFontSize(16);
        doc.setTextColor(230, 112, 34);
        doc.text(`₹ ${formatIndianNumber(resultsToShare.grandTotalCost)}`, 130, 38);

        currentY += 15;
        // --- Table ---
        const tableColumns = ["INGREDIENT", "SCALED QUANTITY", "EST. COST"];
        const cleanRows = resultsToShare.items.map(item => [
            String(item.name),
            item.formattedTotalQty,
            `Rs. ${formatIndianNumber(item.totalCost)}`
        ]);

        autoTable(doc, {
            head: [tableColumns],
            body: cleanRows,
            startY: currentY,
            margin: { left: 15, right: 15 },
            theme: 'striped',
            headStyles: {
                fillColor: [28, 25, 23],
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold',
                font: "helvetica",
                cellPadding: 5
            },
            bodyStyles: {
                font: selectedFont,
                fontSize: 11,
                textColor: [51, 65, 85],
                cellPadding: 5
            },
            columnStyles: {
                0: { fontStyle: 'bold', textColor: [230, 112, 34] },
                1: { halign: 'center' },
                2: { halign: 'right' }
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252]
            }
        });

        currentY = doc.lastAutoTable.finalY + 20;

        // --- Instructions ---
        if (recipeToShare.details) {
            if (currentY + 40 > 280) {
                doc.addPage();
                currentY = 20;
            }
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(28, 25, 23);
            doc.text("PREPARATION METHOD", 15, currentY);
            currentY += 8;

            doc.setFont(selectedFont, "normal");
            doc.setFontSize(11);
            doc.setTextColor(71, 85, 105);

            const wrappedText = doc.splitTextToSize(recipeToShare.details, 180);
            doc.text(wrappedText, 15, currentY);
            currentY += (wrappedText.length * 6) + 15;
        }

        // --- Video Section ---
        if (recipeToShare.youtubeLink) {
            if (currentY + 20 > 280) {
                doc.addPage();
                currentY = 20;
            }
            doc.setFillColor(254, 242, 242);
            doc.roundedRect(15, currentY, 180, 15, 2, 2, 'F');
            doc.setFont("helvetica", "bold");
            doc.setTextColor(220, 38, 38);
            doc.setFontSize(10);
            doc.text("VIDEO GUIDE:", 20, currentY + 9.5);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(185, 28, 28);
            doc.text(recipeToShare.youtubeLink, 48, currentY + 9.5);
        }

        // --- Footer ---
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(`KitchenPro by ${companyName} | Page ${i} of ${pageCount}`, 15, 287);
            doc.text("System Generated Recipe Report", 160, 287);
        }

        const fileName = `${recipeToShare.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_recipe.pdf`;
        const pdfBlob = doc.output('blob');
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
                files: [file],
                title: `${recipeToShare.name} Recipe PDF`,
                text: 'Recipe report from KitchenPro'
            }).catch(() => {
                doc.save(fileName);
            });
        } else {
            doc.save(fileName);
        }
    };

    const filteredRecipes = (activeTab === 'global' ? allRecipes : recipes).filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedRecipe = recipes.find(r => r.id === selectedRecipeId) || allRecipes.find(r => r.id === selectedRecipeId);

    const normalizeUnit = (qty, unit) => {
        const q = Number(qty) || 0;
        if (unit === 'kg') return { val: q * 1000, baseBase: 'g' };
        if (unit === 'lt') return { val: q * 1000, baseBase: 'ml' };
        return { val: q, baseBase: unit };
    };

    const getUnitName = (unit) => {
        if (!unit) return '';
        if (typeof unit === 'object') return unit.name || '';
        const found = units.find(u =>
            u._id === unit ||
            u.id === unit ||
            u._id?.toString() === unit?.toString() ||
            u.name?.toLowerCase() === unit?.toString()?.toLowerCase()
        );
        if (found) return found.name;
        if (typeof unit === 'string' && !/^[0-9a-fA-F]{24}$/.test(unit)) {
            return unit;
        }
        return '';
    };

    const formatScaledUnit = (qty, unit) => {
        const q = Number(qty) || 0;
        const unitName = getUnitName(unit);
        const u = unitName?.toLowerCase()?.trim();

        if (u === 'kg' || u === 'g' || u === 'gm' || u === 'gram' || u === 'grams') {
            const totalGrams = (u === 'kg') ? q * 1000 : q;
            if (totalGrams >= 1000) return `${(totalGrams / 1000).toFixed(2)} kg`;
            return `${totalGrams.toFixed(0)} g`;
        }
        if (u === 'lt' || u === 'ml' || u === 'l' || u === 'liter' || u === 'litre') {
            const totalMl = (u === 'lt' || u === 'l' || u === 'liter' || u === 'litre') ? q * 1000 : q;
            if (totalMl >= 1000) return `${(totalMl / 1000).toFixed(2)} lt`;
            return `${totalMl.toFixed(0)} ml`;
        }
        return `${q.toFixed(2)} ${unitName || 'kg'}`.trim();
    };

    const calculateRecipeResults = (recipe, target) => {
        if (!recipe || !target) return null;

        let multiplier = 0;
        if (scaleMode === 'people' && typeof target === 'object') {
            const basePeopleObj = recipe.basePeople || {};
            let hasAtLeastOneMatch = false;

            for (const [name, targetCount] of Object.entries(target)) {
                const baseCount = Number(basePeopleObj[name]) || 0;
                if (baseCount > 0) {
                    multiplier += (Number(targetCount) || 0) / baseCount;
                    hasAtLeastOneMatch = true;
                }
            }

            if (!hasAtLeastOneMatch) {
                const totalTargetPeople = Object.values(target).reduce((s, c) => s + (Number(c) || 0), 0);
                const totalBasePeople = Object.values(basePeopleObj).reduce((s, c) => s + (Number(c) || 0), 0);
                if (totalBasePeople > 0) {
                    multiplier = totalTargetPeople / totalBasePeople;
                } else {
                    multiplier = totalTargetPeople / (Number(recipe.baseQuantity) || 1);
                }
            }
        } else {
            const targetVal = Number(target) || 0;
            multiplier = targetVal / (Number(recipe.baseQuantity) || 1);
        }

        const calculatedItems = recipe.ingredients.map(item => {
            const qty = Number(item.quantity) || 0;
            const recipePrice = Number(item.rate) || 0;
            const totalQty = qty * multiplier;
            const totalCost = recipePrice * multiplier;
            return {
                ...item,
                totalQty,
                totalCost,
                formattedTotalQty: formatScaledUnit(totalQty, item.unit)
            };
        });

        const grandTotalCost = calculatedItems.reduce((acc, item) => acc + item.totalCost, 0);
        let totalWeightKg = 0;
        calculatedItems.forEach(item => {
            const q = Number(item.totalQty) || 0;
            const u = getUnitName(item.unit).toLowerCase().trim();
            if (u === 'kg') {
                totalWeightKg += q;
            } else if (u === 'g' || u === 'gm' || u === 'gram' || u === 'grams') {
                totalWeightKg += q / 1000;
            } else if (u === 'lt' || u === 'l' || u === 'liter' || u === 'litre') {
                totalWeightKg += q;
            } else if (u === 'ml') {
                totalWeightKg += q / 1000;
            } else {
                const displayStr = item.formattedTotalQty || '';
                const parts = displayStr.split(' ');
                const val = parseFloat(parts[0]) || 0;
                const dispUnit = (parts[1] || '').toLowerCase();
                if (dispUnit === 'kg' || dispUnit === 'lt') totalWeightKg += val;
                else if (dispUnit === 'g' || dispUnit === 'ml') totalWeightKg += val / 1000;
                else totalWeightKg += val;
            }
        });

        return { items: calculatedItems, grandTotalCost, totalWeightKg, multiplier };
    };

    const activePeopleCounts = useMemo(() => {
        const counts = {};
        peopleCategories.forEach(cat => {
            if (cat.count > 0) counts[cat.name] = cat.count;
        });
        return counts;
    }, [peopleCategories]);

    const measurementResults = useMemo(() => {
        if (!selectedRecipe) return null;
        if (scaleMode === 'people') {
            return calculateRecipeResults(selectedRecipe, activePeopleCounts);
        }
        return calculateRecipeResults(selectedRecipe, targetQuantity);
    }, [selectedRecipe, activePeopleCounts, targetQuantity, scaleMode]);

    if (permsLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold text-muted-foreground">Loading Recipe Data...</p>
                </div>
            </div>
        );
    }

    if (!hasPermission('read')) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                <div className="max-w-md w-full bg-card rounded-3xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert size={40} className="text-red-500" />
                    </div>
                    <h1 className="text-2xl font-black text-foreground mb-2">Access Denied</h1>
                    <p className="text-muted-foreground font-medium mb-8">
                        You don&apos;t have permission to view Recipe Quantities. Please contact your administrator for access.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-3 md:p-6" style={{ fontFamily: 'ITCAvantGardeStd' }}>
            <div className="bg-card rounded-lg shadow-2xl overflow-hidden mx-auto max-w-[1400px]">
                {/* 1. Top Bar - Tabs & Source Action */}
                <div className="flex justify-end items-center gap-6 px-6 py-2.5 bg-white dark:bg-[#252525] border-b border-[#882619]">
                    <div className="gradient-pill-input flex items-center p-1 shadow-sm shrink-0 bg-white dark:bg-zinc-800">
                        <button
                            type="button"
                            onClick={() => setActiveTab('manage')}
                            className={`px-6 py-2 rounded-[8px] text-xs font-bold transition-all cursor-pointer border-0 outline-none ${activeTab === 'manage'
                                ? 'bg-gradient-to-r from-[#882619] to-[#D4612D] text-white shadow-md'
                                : 'bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent hover:opacity-80'
                                }`}
                        >
                            My Recipe
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('measure')}
                            className={`px-6 py-2 rounded-[8px] text-xs font-bold transition-all cursor-pointer border-0 outline-none ${activeTab === 'measure'
                                ? 'bg-gradient-to-r from-[#882619] to-[#D4612D] text-white shadow-md'
                                : 'bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent hover:opacity-80'
                                }`}
                        >
                            Scale
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('global')}
                            className={`px-6 py-2 rounded-[8px] text-xs font-bold transition-all cursor-pointer border-0 outline-none ${activeTab === 'global'
                                ? 'bg-gradient-to-r from-[#882619] to-[#D4612D] text-white shadow-md'
                                : 'bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent hover:opacity-80'
                                }`}
                        >
                            Global Recipe
                        </button>
                    </div>

                    {!isReadOnly && (
                        <PermissionWrapper action="source">
                            <button
                                type="button"
                                onClick={() => setIsAddCategoryModalOpen(true)}
                                className="flex items-center gap-1.5 bg-transparent border-0 outline-none text-[#882619] dark:text-[#D4612D] font-extrabold text-xs hover:opacity-80 transition-opacity cursor-pointer"
                            >
                                <img src="/icons/action/Source.svg" className="w-6 h-6 block dark:hidden" alt="Source" />
                                <img src="/icons/action/SourceDark.svg" className="w-6 h-6 hidden dark:block" alt="Source" />
                                <span className="text-xs font-extrabold bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent">Source</span>
                            </button>
                        </PermissionWrapper>
                    )}
                </div>

                {/* 2. Main Header Banner Box */}
                {(activeTab === 'manage' || activeTab === 'global') ? (
                    <div className="bg-[#E5E5E5] dark:bg-[#252525] py-3.5 px-6 md:px-8 flex justify-between items-center border-b border-[#882619]">
                        <div className="gradient-pill-input flex items-center px-4 py-2 shadow-sm w-64 md:w-80">
                            <Search size={16} className="text-[#D4612D] shrink-0 mr-2" />
                            <input
                                type="text"
                                placeholder="Quick Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent text-slate-800 dark:text-zinc-100 text-xs font-semibold outline-none placeholder:text-[#C2C2C2]"
                            />
                        </div>

                        {activeTab === 'manage' && (
                            <PermissionWrapper action="write">
                                {!isReadOnly && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRecipeForm({ id: null, name: '', baseQuantity: 1, baseUnit: 'kg', ingredients: [{ name: '', quantity: '', unit: '', rate: '', tempId: Date.now() }], details: '', youtubeLink: '' });
                                            setIsModalOpen(true);
                                        }}
                                        className="flex flex-col items-center justify-center gap-0.5 group hover:opacity-80 transition-opacity cursor-pointer border-0 bg-transparent"
                                    >
                                        <img src="/icons/action/Add.svg" className="w-8 h-8 block dark:hidden" alt="New Recipe" />
                                        <img src="/icons/action/AddDark.svg" className="w-8 h-8 hidden dark:block" alt="New Recipe" />
                                        <span className="text-[10px] font-extrabold bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent leading-none">New Recipe</span>
                                    </button>
                                )}
                            </PermissionWrapper>
                        )}
                    </div>
                ) : (
                    <div className="bg-[#E3E3E3] dark:bg-[#252525] py-3.5 px-6 md:px-8 flex flex-wrap justify-between items-center gap-4 border-b border-[#882619]">
                        {/* Left side: Recipe Select & Video Play Icon */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block">Select Recipe</label>
                                <div className="gradient-pill-input w-64 md:w-80 px-3.5 py-1.5 bg-white dark:bg-zinc-800">
                                    <SearchableSelect
                                        options={[
                                            ...recipes.map(r => ({ value: r.id.toString(), label: r.name })),
                                            ...allRecipes.filter(ar => !recipes.some(r => r.id === ar.id)).map(ar => ({ value: ar.id.toString(), label: `${ar.name} (Global)` }))
                                        ]}
                                        value={selectedRecipeId}
                                        onChange={(val) => setSelectedRecipeId(val)}
                                        placeholder="Select Recipe"
                                        showSearchIcon={true}
                                        className="w-full text-xs font-bold text-slate-800 dark:text-zinc-100"
                                    />
                                </div>
                            </div>

                            {selectedRecipe?.youtubeLink && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const src = getVideoSrc(selectedRecipe.youtubeLink);
                                        if (src && (src.includes('embed') || src.includes('preview'))) {
                                            setVideoModal({ isOpen: true, videoSrc: src, title: selectedRecipe.name });
                                        } else {
                                            window.open(src, '_blank');
                                        }
                                    }}
                                    className="w-9 h-9 rounded-full bg-[#BA0000] text-white flex items-center justify-center hover:opacity-90 shadow cursor-pointer border-0 mt-4"
                                    title="Play Recipe Video"
                                >
                                    <Play size={16} fill="white" className="ml-0.5" />
                                </button>
                            )}
                        </div>

                        {/* Right side: Calculation Mode Switcher Pill */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-600 dark:text-zinc-300">Calculation Mode :</span>
                            <div className="gradient-pill-input p-1 inline-flex items-center bg-white dark:bg-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setScaleMode('people')}
                                    className={`px-6 py-1.5 rounded-md font-bold text-xs transition-all border-0 cursor-pointer ${scaleMode === 'people' ? 'bg-gradient-to-r from-[#882619] to-[#D4612D] text-white shadow-sm' : 'text-slate-600 dark:text-zinc-300 bg-transparent hover:text-slate-900'}`}
                                >
                                    People
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setScaleMode('scale')}
                                    className={`px-6 py-1.5 rounded-md font-bold text-xs transition-all border-0 cursor-pointer ${scaleMode === 'scale' ? 'bg-gradient-to-r from-[#882619] to-[#D4612D] text-white shadow-sm' : 'text-slate-600 dark:text-zinc-300 bg-transparent hover:text-slate-900'}`}
                                >
                                    Scale
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className=" bg-white dark:bg-[#1a1a1a]">
                    {(activeTab === 'manage' || activeTab === 'global') ? (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6 p-4 sm:p-6 md:p-8">
                                {filteredRecipes.map((recipe) => {
                                    const thumbnail = recipe.image;

                                    return (
                                        <div
                                            key={recipe.id}
                                            className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 shadow-[0_12px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_18px_36px_rgba(0,0,0,0.18)] transition-all duration-300 overflow-hidden flex flex-col group"
                                        >
                                            {/* Top: Image Container */}
                                            <div className="w-full h-36 sm:h-44 md:h-48 overflow-hidden relative bg-[#FCE8E8] dark:bg-rose-950/20 flex items-center justify-center">
                                                {thumbnail ? (
                                                    <img
                                                        src={thumbnail}
                                                        alt={recipe.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-[#E58989] dark:text-rose-400">
                                                        <img src="/icons/action/Image.svg" className="w-9 h-9 opacity-45" alt="No Image" />
                                                        <span className="text-xs font-semibold tracking-wide text-[#C87B7B] dark:text-rose-400">Image</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Middle: Title & Subtitle Info */}
                                            <div className="bg-[#EDEDED] dark:bg-[#252525] py-3.5 px-3 text-center rounded-xl -mt-2 relative z-10">
                                                <h3 className="text-xl sm:text-2xl font-normal text-[#BD4423] dark:text-[#D4612D] drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)] truncate px-1">
                                                    {recipe.name}
                                                </h3>
                                                <p className="text-xs sm:text-sm font-light text-[#9E9E9E] dark:text-zinc-400 mt-1">
                                                    {recipe.ingredients?.length || 0} Ingreds
                                                </p>
                                                {activeTab === 'global' && recipe.companyId?.name && (
                                                    <p className="text-[10px] font-bold text-[#D4612D] mt-0.5 truncate">
                                                        {recipe.companyId.name}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Bottom: Action Icons Bar */}
                                            <div className="bg-white dark:bg-[#1E1E1E] px-3 py-3 flex items-center justify-around mt-auto relative z-10">
                                                {/* 1. Scale Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => { setSelectedRecipeId(recipe.id.toString()); setActiveTab('measure'); }}
                                                    className="hover:scale-110 transition-transform cursor-pointer border-0 bg-transparent p-1 flex items-center justify-center w-8 h-8"
                                                    title="Scale Recipe"
                                                >
                                                    <img src="/icons/action/Scale.svg" className="w-6 h-6 block" alt="Scale" />
                                                </button>

                                                {/* 2. Edit Button */}
                                                {!isReadOnly && activeTab !== 'global' && (
                                                    <PermissionWrapper action="edit">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); handleEditRecipe(recipe); }}
                                                            className="hover:scale-110 transition-transform cursor-pointer border-0 bg-transparent p-1 flex items-center justify-center w-8 h-8"
                                                            title="Edit Recipe"
                                                        >
                                                            <img src="/icons/action/Edit.svg" className="w-6 h-6 block" alt="Edit" />
                                                        </button>
                                                    </PermissionWrapper>
                                                )}

                                                {/* 3. Delete Button */}
                                                {!isReadOnly && activeTab !== 'global' && (
                                                    <PermissionWrapper action="delete">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); deleteRecipe(recipe.id); }}
                                                            className="hover:scale-110 transition-transform cursor-pointer border-0 bg-transparent p-1 flex items-center justify-center w-8 h-8"
                                                            title="Delete Recipe"
                                                        >
                                                            <img src="/icons/action/delete1.svg" className="w-5 h-5 block dark:hidden" alt="Delete" />
                                                            <img src="/icons/action/deleteDark1.svg" className="w-5 h-5 hidden dark:block" alt="Delete" />
                                                        </button>
                                                    </PermissionWrapper>
                                                )}

                                                {/* 4. Play Video Button */}
                                                <button
                                                    type="button"
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
                                                    className={`hover:scale-110 transition-transform cursor-pointer border-0 bg-transparent p-1 flex items-center justify-center w-8 h-8 ${!recipe.youtubeLink ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                    title={recipe.youtubeLink ? "Watch Video" : "No Video Available"}
                                                    disabled={!recipe.youtubeLink}
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-[#B91C1C] flex items-center justify-center text-white shadow-sm shrink-0">
                                                        <Play size={10} fill="currentColor" className="ml-0.5 text-white" />
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-[#1a1a1a] p-4 sm:p-6 md:p-8  mx-auto">
                            <div ref={recipeResultsRef}>
                                {/* Number of People Section */}
                                {scaleMode === 'people' && (
                                    <div className="mb-6 space-y-3">
                                        <span className="text-2xl font-semibold text-black dark:text-white block mb-6">
                                            Number of People :
                                        </span>
                                        <div className="flex flex-wrap gap-4 sm:gap-8 items-center">
                                            {peopleCategories.map((cat) => (
                                                <div key={cat.id} className="flex flex-col items-center gap-1.5">
                                                    <span className="text-xs font-extrabold bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent">
                                                        {cat.name}
                                                    </span>
                                                    <div className="gradient-pill-input w-28 px-3 py-2 bg-white dark:bg-zinc-800 text-center">
                                                        <input
                                                            type="number"
                                                            value={cat.count === 0 ? '' : cat.count}
                                                            placeholder="0"
                                                            onFocus={(e) => e.target.select()}
                                                            onChange={(e) => {
                                                                const raw = e.target.value;
                                                                const val = raw === '' ? 0 : Math.max(0, parseInt(raw, 10) || 0);
                                                                setPeopleCategories(prev => prev.map(c => c.id === cat.id ? { ...c, count: val } : c));
                                                            }}
                                                            className="w-full bg-transparent text-center font-bold text-xs outline-none text-slate-800 dark:text-zinc-100"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Target Output section if Scale mode */}
                                {scaleMode === 'scale' && (
                                    <div className="mb-6 flex items-center gap-3">
                                        <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Target Output :</span>
                                        <div className="gradient-pill-input w-36 px-4 py-2 bg-white dark:bg-zinc-800 text-center flex items-center">
                                            <input
                                                type="number"
                                                value={targetQuantity === 0 || targetQuantity === '0' ? '' : targetQuantity}
                                                onFocus={(e) => e.target.select()}
                                                onChange={(e) => {
                                                    const raw = e.target.value;
                                                    setTargetQuantity(raw === '' ? '' : Math.max(0, parseFloat(raw) || 0));
                                                }}
                                                placeholder="0"
                                                className="w-full bg-transparent text-center font-bold text-xs outline-none text-[#D4612D]"
                                            />
                                            <span className="text-xs font-bold text-slate-500 ml-1">
                                                {selectedRecipe?.baseUnit ? (selectedRecipe.baseUnit.toLowerCase() === 'kg' ? 'kg' : selectedRecipe.baseUnit) : 'kg'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Red Horizontal Divider */}
                                <hr className="border-t border-[#882619]/30 my-6" />

                                {/* Results Area */}
                                {measurementResults ? (
                                    <div className="space-y-8">
                                        {/* Recipe Header Banner (Thumbnail, Name, Total People) */}
                                        <div className="flex flex-wrap items-center justify-between gap-6">
                                            <div className="flex items-center gap-4">
                                                {selectedRecipe?.image && (
                                                    <img
                                                        src={selectedRecipe.image}
                                                        alt={selectedRecipe.name}
                                                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-md border border-slate-200 dark:border-zinc-700"
                                                    />
                                                )}
                                                <div>
                                                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                                                        <span className="bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent">
                                                            {selectedRecipe.name}
                                                        </span>{" "}
                                                        <span className="text-slate-800 dark:text-white font-black">Recipe</span>
                                                    </h2>
                                                    <p className="text-xs text-slate-500 font-medium mt-1">Calculation Success</p>
                                                </div>
                                                <div className="flex items-center gap-6 ml-30">
                                                    {scaleMode === 'people' && (
                                                        <span className="text-sm font-semibold text-[#000000] dark:text-zinc-300">
                                                            Total People : <span className=" text-[#000000] dark:text-white">{peopleCategories.reduce((acc, cat) => acc + (Number(cat.count) || 0), 0)}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>


                                        </div>
                                        {/* Ingredients Table */}
                                        <div className="overflow-x-auto my-4">
                                            <table className="custom-scale-table">
                                                <thead>
                                                    <tr>
                                                        <th className="text-left">
                                                            Ingredients List
                                                        </th>
                                                        <th className="text-center">
                                                            Qty
                                                        </th>
                                                        <th className="text-center">
                                                            Cost
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {measurementResults.items.map((item, idx) => (
                                                        <tr key={idx} className="hover:bg-orange-50/20 transition-colors">
                                                            <td className="font-bold text-left">
                                                                <span className="bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent">
                                                                    {item.name}
                                                                </span>
                                                            </td>
                                                            <td className="font-bold text-slate-800 dark:text-zinc-100 text-center">
                                                                {item.formattedTotalQty}
                                                            </td>
                                                            <td className="font-bold text-slate-800 dark:text-zinc-100 text-center">
                                                                ₹ {formatIndianNumber(item.totalCost)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="bg-white dark:bg-[#1a1a1a]">
                                                        <td className="text-xs font-semibold text-slate-600 dark:text-zinc-400 bg-white dark:bg-[#1a1a1a]">
                                                            {measurementResults.items.length} Ingredients
                                                        </td>
                                                        <td className="bg-white dark:bg-[#1a1a1a] text-center text-l ">
                                                            <span className="bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent">
                                                                Total Weight : {measurementResults.totalWeightKg.toFixed(2)} kg
                                                            </span>
                                                        </td>
                                                        <td className="bg-white dark:bg-[#1a1a1a] text-center text-l ">
                                                            <span className="bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent">
                                                                Total Cost : ₹ {formatIndianNumber(measurementResults.grandTotalCost)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>

                                        {/* Recipe Method */}
                                        <div className="space-y-2 pt-2">
                                            <label className="text-sm font-semibold text-slate-600 dark:text-zinc-300 block">
                                                Recipe Method :
                                            </label>
                                            <div className="gradient-pill-input p-6 bg-white dark:bg-zinc-800 rounded-xl min-h-[120px] text-xs font-semibold text-slate-700 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                                                {selectedRecipe?.details || "Write Preparation Method Here...."}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="min-h-[300px] flex items-center justify-center font-semibold text-sm text-slate-400">
                                        <p>Awaiting Recipe Selection.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Recipe Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsModalOpen(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="relative bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col border border-slate-200 dark:border-zinc-800"
                            >
                                {/* Modal Header */}
                                <div className="bg-gradient-to-r from-[#882619] to-[#D4612D] py-6 px-8 rounded-t-3xl text-center relative text-white">
                                    <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
                                        {recipeForm.id ? 'Edit Recipe' : 'New Recipe'}
                                    </h2>
                                    <p className="text-white/80 text-xs italic mt-1 font-medium">
                                        Recipe (English / Hindi / Gujarati supported)
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="absolute right-6 top-6 text-white/80 hover:text-white transition-colors cursor-pointer border-0 bg-transparent"
                                    >
                                        <X size={24} strokeWidth={2.5} />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="flex-1 overflow-y-auto">
                                    {/* Top Section - Grey Box */}
                                    <div className="bg-[#F2F0ED] dark:bg-[#252525] p-6 space-y-5 border-b border-slate-200 dark:border-zinc-800">
                                        {/* Line 1: Recipe Name, Qty, Unit */}
                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className="flex-1 min-w-[220px] flex items-center gap-2">
                                                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                                                    Recipe Name :
                                                </label>
                                                <div className="gradient-pill-input flex-1 px-4 py-2 bg-white dark:bg-zinc-800">
                                                    <input
                                                        type="text"
                                                        className="w-full bg-transparent text-xs font-semibold outline-none text-slate-800 dark:text-zinc-100 placeholder:text-slate-400"
                                                        value={recipeForm.name}
                                                        onChange={e => setRecipeForm({ ...recipeForm, name: e.target.value })}
                                                        placeholder="Enter recipe name"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                                                    Qty :
                                                </label>
                                                <div className="gradient-pill-input w-24 px-3 py-2 bg-white dark:bg-zinc-800 text-center">
                                                    <input
                                                        type="number"
                                                        className="w-full bg-transparent text-xs font-semibold outline-none text-center text-slate-800 dark:text-zinc-100"
                                                        value={recipeForm.baseQuantity}
                                                        onChange={e => setRecipeForm({ ...recipeForm, baseQuantity: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                                                    Unit :
                                                </label>
                                                <div className="gradient-pill-input w-32 px-3 py-1.5 bg-white dark:bg-zinc-800">
                                                    <SearchableSelect
                                                        options={[
                                                            { value: "kg", label: "kg" },
                                                            { value: "lt", label: "lt" },
                                                            { value: "Pcs", label: "Pcs" },
                                                            ...units.map(u => ({ value: u.name, label: u.name }))
                                                        ]}
                                                        value={recipeForm.baseUnit}
                                                        onChange={(val) => setRecipeForm({ ...recipeForm, baseUnit: val })}
                                                        placeholder="Unit"
                                                        className="w-full text-xs font-bold text-slate-700 dark:text-zinc-200"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-b border-slate-300/60 dark:border-zinc-700/60" />

                                        {/* Line 2: Number of People */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                                                    Number of People :
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddCategoryModalOpen(true)}
                                                    className="text-xs font-extrabold text-[#D4612D] hover:opacity-80 transition-opacity cursor-pointer border-0 bg-transparent flex items-center gap-1"
                                                >
                                                    + Add People Category
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap gap-4 sm:gap-6">
                                                {peopleCategories.map((cat) => (
                                                    <div key={cat.id} className="flex flex-col items-center gap-1.5">
                                                        <span className="text-xs font-extrabold bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent">
                                                            {cat.name}
                                                        </span>
                                                        <div className="gradient-pill-input w-24 px-3 py-2 bg-white dark:bg-zinc-800 text-center">
                                                            <input
                                                                type="number"
                                                                value={recipeForm.basePeople?.[cat.name] || ''}
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value) || 0;
                                                                    setRecipeForm({
                                                                        ...recipeForm,
                                                                        basePeople: {
                                                                            ...(recipeForm.basePeople || {}),
                                                                            [cat.name]: val
                                                                        }
                                                                    });
                                                                }}
                                                                className="w-full bg-transparent text-xs font-bold outline-none text-center text-slate-800 dark:text-zinc-100"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Section - White Content */}
                                    <div className="p-6 sm:p-8 space-y-6">
                                        {/* Title & Plus Button */}
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-2xl font-bold">
                                                <span className="bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent">
                                                    {recipeForm.name || "Recipe Name"} {recipeForm.baseQuantity || 1}{recipeForm.baseUnit || "kg"}
                                                </span>{" "}
                                                <span className="text-slate-800 dark:text-white font-bold">Recipe</span>
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRecipeForm({
                                                        ...recipeForm,
                                                        ingredients: [...recipeForm.ingredients, { name: '', quantity: '', unit: '', rate: '', tempId: Date.now() }]
                                                    });
                                                }}
                                                className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#882619] to-[#D4612D] text-white flex items-center justify-center shadow-md hover:opacity-90 transition-opacity cursor-pointer border-0"
                                                title="Add Ingredient"
                                            >
                                                <Plus size={20} strokeWidth={3} />
                                            </button>
                                        </div>

                                        {/* Ingredients List */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                                                Ingredients List :
                                            </label>

                                            <div className="space-y-3">
                                                {recipeForm.ingredients.map((item) => (
                                                    <div
                                                        key={item._id || item.tempId}
                                                        className="p-3 rounded-2xl bg-[#FFF6EE] dark:bg-[#2A201B] border border-[#F6AD71]/40 flex flex-wrap md:flex-nowrap items-center gap-3 shadow-sm"
                                                    >
                                                        {/* Name */}
                                                        <div className="gradient-pill-input flex-1 px-4 py-2 bg-white dark:bg-zinc-800">
                                                            <input
                                                                type="text"
                                                                className="w-full bg-transparent text-xs font-semibold outline-none text-slate-800 dark:text-zinc-100 placeholder:text-slate-400"
                                                                value={item.name}
                                                                onChange={e => handleItemChange(item.tempId, item._id, 'name', e.target.value)}
                                                                placeholder="Ingredients Name"
                                                            />
                                                        </div>

                                                        {/* Qty */}
                                                        <div className="gradient-pill-input w-24 px-3 py-2 bg-white dark:bg-zinc-800 text-center">
                                                            <input
                                                                type="number"
                                                                className="w-full bg-transparent text-xs font-bold outline-none text-center text-slate-800 dark:text-zinc-100"
                                                                value={item.quantity}
                                                                onChange={e => handleItemChange(item.tempId, item._id, 'quantity', e.target.value)}
                                                                placeholder="Qty"
                                                            />
                                                        </div>

                                                        {/* Unit */}
                                                        <div className="gradient-pill-input w-28 px-3 py-2 bg-white dark:bg-zinc-800 flex items-center">
                                                            <SearchableSelect
                                                                options={units.map(u => ({ value: u._id, label: u.name }))}
                                                                value={getIngredientUnitValue(item.unit)}
                                                                onChange={val => handleItemChange(item.tempId, item._id, 'unit', val)}
                                                                placeholder="Unit"
                                                                className="w-full text-xs font-bold text-slate-700 dark:text-zinc-200"
                                                            />
                                                        </div>

                                                        {/* Rate */}
                                                        <div className="gradient-pill-input w-28 px-3 py-2 bg-white dark:bg-zinc-800 flex items-center">
                                                            <span className="text-xs font-bold text-slate-400 mr-1">₹</span>
                                                            <input
                                                                type="number"
                                                                className="w-full bg-transparent text-xs font-bold outline-none text-slate-800 dark:text-zinc-100"
                                                                value={item.rate}
                                                                onChange={e => handleItemChange(item.tempId, item._id, 'rate', e.target.value)}
                                                                placeholder="Rate"
                                                            />
                                                        </div>

                                                        {/* Delete */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(item.tempId, item._id)}
                                                            className="p-1 hover:scale-110 transition-transform cursor-pointer border-0 bg-transparent"
                                                            title="Remove Ingredient"
                                                        >
                                                            <img src="/icons/action/Delete.svg" className="w-6 h-6 block" alt="Delete" />
                                                        </button>
                                                    </div>
                                                ))}

                                                {recipeForm.ingredients.length === 0 && (
                                                    <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-2xl text-slate-400 text-xs font-medium">
                                                        Click + to add ingredients
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Recipe Method */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                                                Recipe Method :
                                            </label>
                                            <div className="gradient-pill-input p-3 w-full bg-white dark:bg-zinc-800">
                                                <textarea
                                                    className="w-full bg-transparent text-xs font-semibold outline-none text-slate-800 dark:text-zinc-100 min-h-[90px] resize-y placeholder:text-slate-400"
                                                    value={recipeForm.details}
                                                    onChange={e => setRecipeForm({ ...recipeForm, details: e.target.value })}
                                                    placeholder="Write Preparation Method Here..."
                                                />
                                            </div>
                                        </div>

                                        {/* Video Link */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                                                Video Link (YouTube / Google Drive) :
                                            </label>
                                            <div className="gradient-pill-input px-4 py-2 w-full bg-white dark:bg-zinc-800">
                                                <input
                                                    type="text"
                                                    className="w-full bg-transparent text-xs font-semibold outline-none text-slate-800 dark:text-zinc-100 placeholder:text-slate-400"
                                                    value={recipeForm.youtubeLink || ''}
                                                    onChange={e => setRecipeForm({ ...recipeForm, youtubeLink: e.target.value })}
                                                    placeholder="https://www.youtube.com/watch?v=..."
                                                />
                                            </div>
                                        </div>

                                        {/* Recipe Photo Upload Box */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                                                    Recipe Photo :
                                                </label>
                                                {recipeForm.image && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setRecipeForm(prev => ({ ...prev, image: '' }))}
                                                        className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer border-0 bg-transparent"
                                                    >
                                                        Remove Photo
                                                    </button>
                                                )}
                                            </div>

                                            {recipeForm.image ? (
                                                <div className="relative rounded-2xl overflow-hidden border border-[#D4612D]/40 h-48 group">
                                                    <img
                                                        src={recipeForm.image}
                                                        alt="Recipe preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <label className="px-4 py-2 bg-white text-slate-800 rounded-full text-xs font-bold shadow cursor-pointer hover:bg-slate-100">
                                                            Change Photo
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleImageUpload}
                                                                className="hidden"
                                                                disabled={uploadingImage}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label className="border-2 border-dashed border-[#D4612D]/40 rounded-2xl p-6 bg-[#FFF9F5] dark:bg-[#251D1A] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-orange-50/50 transition-colors block relative">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        className="hidden"
                                                        disabled={uploadingImage}
                                                    />
                                                    <div className="gradient-pill-input p-3 mb-2 flex items-center justify-center bg-white dark:bg-zinc-800">
                                                        <img src="/icons/action/Image.svg" className="w-6 h-6" alt="Upload" />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">
                                                        {uploadingImage ? "Uploading photo..." : "Click or Drag to upload recipe photo"}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 mt-0.5">
                                                        Supports PNG, JPG, WEBP etc. up to any size
                                                    </span>
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="p-5 bg-white dark:bg-[#1a1a1a] border-t border-slate-100 dark:border-zinc-800 flex justify-end items-center gap-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-slate-600 dark:text-zinc-400 font-bold hover:opacity-80 text-xs cursor-pointer border-0 bg-transparent"
                                    >
                                        Cancel
                                    </button>
                                    {!isReadOnly && (
                                        <PermissionWrapper action={recipeForm.id ? "edit" : "write"}>
                                            <button
                                                type="button"
                                                onClick={handleSubmitRecipe}
                                                className="bg-gradient-to-r from-[#882619] to-[#D4612D] text-white font-bold text-xs px-8 py-3 rounded-full shadow-lg hover:opacity-90 transition-opacity cursor-pointer border-0"
                                            >
                                                Save Receipt
                                            </button>
                                        </PermissionWrapper>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Master Data Manager */}
                <MasterDataManager
                    isOpen={isAddCategoryModalOpen}
                    onClose={() => setIsAddCategoryModalOpen(false)}
                    onRefresh={fetchPeopleCategories}
                    allowedTabs={['peopleCategories']}
                />

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
                <style jsx global>{`
                @media print {
                    aside, header, .lg\\:col-span-4, button, .shadow-xl {
                        display: none !important;
                    }
                    main { padding: 0 !important; margin: 0 !important; background: white !important; }
                    .lg\\:col-span-8 { width: 100% !important; margin: 0 !important; }
                    .rounded-\\[2\\.5rem\\], .rounded-xl { border-radius: 0 !important; border: 1px solid #000 !important; box-shadow: none !important; }
                    .bg-muted\\/50 { background: white !important; }
                    table { width: 100% !important; border-collapse: collapse !important; }
                    th, td { border-bottom: 1px solid #eee !important; padding: 12px 8px !important; }
                    .text-primary { color: black !important; }
                }
                `}</style>
            </div>
        </div>
    );
}