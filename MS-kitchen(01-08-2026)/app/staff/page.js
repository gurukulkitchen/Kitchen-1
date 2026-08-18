"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useToast } from '../../components/Toast';
import { useFormStore } from '@/lib/store';
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addStandardHeader } from '@/lib/pdfGenerator';
import * as XLSX from 'xlsx';
import { useCompany } from "@/context/CompanyContext";
import {
  Users,
  Plus,
  Search,
  Download,
  Trash2,
  X,
  IndianRupee,
  Calendar,
  FileText,
  Upload,
  History,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Mail,
  Briefcase,
  CreditCard,
  Eye,
  Filter,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  Settings,
  Edit3,
  Check,
  Coins,
  MapPin,
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  Edit2,
  HelpCircle,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import CompanyFilter from "../../components/CompanyFilter";
import Pagination from "../../components/Pagination";
import TableColumnFilter from '../../components/TableColumnFilter';
import FilterDropdown from '../../components/FilterDropdown';
import { ShieldAlert } from "lucide-react";
import usePermissions from "@/hooks/usePermissions";
import PermissionWrapper from "@/components/PermissionWrapper";
import TableActionButton from "../../components/TableActionButton";
import MasterDataManager from "@/components/MasterDataManager";
import { Database } from "lucide-react";
import { formatIndianNumber } from "../../lib/formatters";

export default function StaffManagementPage() {
  const hasDevanagari = (text) => /[\u0900-\u097F\u20B9]/.test(text);
  const { showToast } = useToast();
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [currentRole, setCurrentRole] = useState(null);
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const [positions, setPositions] = useState([]);
  const [isAddingPosition, setIsAddingPosition] = useState(false);
  const [newPositionName, setNewPositionName] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // all, with-advance, no-advance
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSalarySheetExportOpen, setIsSalarySheetExportOpen] = useState(false);
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // globalFilterDate controls the main dashboard view (stats + list)
  const [globalFilterDate, setGlobalFilterDate] = useState(
    new Date().toISOString().slice(0, 7),
  );
  // historyFilterDate controls the history modal view
  const [historyFilterDate, setHistoryFilterDate] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [colFilters, setColFilters] = useState({
    name: [],
    position: [],
    status: [],
    city: [],
  });
  const [activeFilterCol, setActiveFilterCol] = useState(null);

  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [modalMonthlyAttendance, setModalMonthlyAttendance] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [companies, setCompanies] = useState([]);

  // Custom Dropdown States
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);

  const [roleSearch, setRoleSearch] = useState("");
  const [positionSearch, setPositionSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");

  const searchParams = useSearchParams();
  const {
    permissions,
    loading: permsLoading,
    hasPermission,
  } = usePermissions();
  const { isReadOnly, companyName, companyAddress, companyPhone } = useCompany();

  const { setFormData, forms } = useFormStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Sync with persistent store

  // Initial Fetch
  useEffect(() => {
    fetchData();
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const companyId = searchParams.get("companyId");
      const query = companyId ? `?companyId=${companyId}` : "";

      const [staffRes, roleRes, posRes, compRes, authRes] = await Promise.all([
        fetch(`/api/staff${query}`),
        fetch("/api/roles"),
        fetch("/api/positions"),
        fetch("/api/companies"),
        fetch("/api/auth/me"),
      ]);

      if (authRes.ok) {
        const authData = await authRes.json();
        setCurrentRole(authData.role);
        setCurrentUserInfo(authData.user);
      }

      if (staffRes.ok) {
        const staffData = await staffRes.json();
        // Store raw data with minimal formatting
        const formattedStaff = staffData.map((s) => ({
          ...s,
          id: s._id,
          fullAdvances: s.advances || [],
        }));
        setStaff(formattedStaff);
      }

      if (roleRes.ok) {
        const roleData = await roleRes.json();
        setRoles(roleData);
      }

      if (posRes.ok) {
        const posData = await posRes.json();
        setPositions(sortPositions(posData));
      }

      if (compRes.ok) {
        const compData = await compRes.json();
        setCompanies(compData);
      }

      const pmRes = await fetch("/api/payment-modes");
      if (pmRes.ok) {
        const pmData = await pmRes.json();
        setPaymentModes(pmData);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };








  const toggleColFilter = (colKey) => {
    setActiveFilterCol(activeFilterCol === colKey ? null : colKey);
  };

  const handleColFilterChange = (colKey, value) => {
    setColFilters(prev => {
      if (value === "") return { ...prev, [colKey]: [] };
      const current = prev[colKey] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [colKey]: updated };
    });
  };

  useEffect(() => {
    const handleFilterOutsideClick = (event) => {
      if (!event.target.closest('[data-col-filter-root="true"]')) {
        setActiveFilterCol(null);
      }
    };
    document.addEventListener('mousedown', handleFilterOutsideClick);
    return () => document.removeEventListener('mousedown', handleFilterOutsideClick);
  }, []);

  const uniquePositions = useMemo(() => [...new Set(staff.map(s => s.position))].sort(), [staff]);
  const uniqueStatuses = useMemo(() => ["Active", "Inactive"], []);
  const uniqueNames = useMemo(() => [...new Set(staff.map(s => s.name))].sort(), [staff]);
  const uniqueCities = useMemo(() => [...new Set(staff.filter(s => s.city).map(s => s.city))].sort(), [staff]);

  const editingRef = useRef(null);
  const handleSaveRef = useRef();
  const editingIdRef = useRef();
  const downloadDropdownRef = useRef(null);
  const salarySheetDropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(e.target)) {
        setIsDownloadDropdownOpen(false);
      }
      if (salarySheetDropdownRef.current && !salarySheetDropdownRef.current.contains(e.target)) {
        setIsSalarySheetExportOpen(false);
      }

      // Close custom dropdowns on outside click
      if (!e.target.closest('#role-dropdown')) setIsRoleDropdownOpen(false);
      if (!e.target.closest('#company-dropdown')) setIsCompanyDropdownOpen(false);
      if (!e.target.closest('#position-dropdown')) setIsPositionDropdownOpen(false);
      if (!e.target.closest('#gender-dropdown')) setIsGenderDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    handleSaveRef.current = handleSave;
    editingIdRef.current = editingStaffId;
  }, [editingStaffId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editingIdRef.current && editingRef.current && !editingRef.current.contains(event.target)) {
        handleSaveRef.current();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  const hasActiveFilters =
    (typeof searchTerm !== 'undefined' && searchTerm !== '') ||
    (typeof filterStatus !== 'undefined' && filterStatus !== 'all') ||
    (typeof globalFilterDate !== 'undefined' && globalFilterDate !== new Date().toISOString().slice(0, 7)) ||
    (typeof colFilters !== 'undefined' && colFilters && Object.values(colFilters).some(v => v && v.length > 0));

  const clearAllFilters = () => {
    if (typeof setSearchTerm === 'function') setSearchTerm('');
    if (typeof setFilterStatus === 'function') setFilterStatus('all');
    if (typeof setGlobalFilterDate === 'function') setGlobalFilterDate(new Date().toISOString().slice(0, 7));
    if (typeof setColFilters === 'function') setColFilters({ name: [], position: [], status: [], city: [] });
    if (typeof setActiveFilterCol === 'function') setActiveFilterCol(null);
  };

  const fetchMonthlyAttendance = async (yearMonth) => {
    try {
      const companyId = searchParams.get("companyId");
      const [year, month] = yearMonth.split('-');
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0).toISOString();
      const query = `?startDate=${startDate}&endDate=${endDate}${companyId ? `&companyId=${companyId}` : ''}`;
      const res = await fetch(`/api/attendance${query}`);
      if (res.ok) {
        const data = await res.json();
        setMonthlyAttendance(data);
      }
    } catch (e) {
      console.error("Failed to fetch monthly attendance", e);
    }
  };

  useEffect(() => {
    if (globalFilterDate) {
      fetchMonthlyAttendance(globalFilterDate);
    }
  }, [globalFilterDate, searchParams]);

  useEffect(() => {
    if (isHistoryModalOpen && historyFilterDate) {
      fetchModalMonthlyAttendance(historyFilterDate);
    }
  }, [isHistoryModalOpen, historyFilterDate, searchParams]);

  const fetchModalMonthlyAttendance = async (yearMonth) => {
    try {
      const companyId = searchParams.get("companyId");
      const [year, month] = yearMonth.split('-');
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0).toISOString();
      const query = `?startDate=${startDate}&endDate=${endDate}${companyId ? `&companyId=${companyId}` : ''}`;
      const res = await fetch(`/api/attendance${query}`);
      if (res.ok) {
        const data = await res.json();
        setModalMonthlyAttendance(data);
      }
    } catch (e) {
      console.error("Failed to fetch modal attendance", e);
    }
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, globalFilterDate, colFilters]);

  const [newStaffData, setNewStaffData] = useState({
    gender: "Male",
    dob: "",
    name: "",
    phone: "",
    phone2: "",
    email: "",
    roleId: "",
    position: "",
    salary: "",
    cast: "",
    city: "",
    address: "",
    aadharNo: "",
    aadharPhoto: "",
    dateOfJoining: new Date().toISOString().split("T")[0],
    dateOfLeave: "",
    narration: "",
    password: "",
    noLogin: true,
    avatar: "",
    status: "Active",
    companyId: "",
    assignedCompanies: [],
  });

  const [advanceData, setAdvanceData] = useState({
    advanceType: "GIVE", // Updated from 'type' to fix Mongoose conflict
    amount: "",
    reason: "",
    paidBy: "",
    paymentType: "Cash",
    date: new Date().toISOString().split("T")[0],
    receipt: null,
  });

  const [salaryEntryData, setSalaryEntryData] = useState({
    month: new Date().toISOString().slice(0, 7),
    amount: "",
    status: "Paid",
    paymentDate: new Date().toISOString().split("T")[0],
    remarks: "Initial Salary",
  });

  // 1. Process staff data based on Global Filter Date
  const processedStaff = useMemo(() => {
    return staff.map((s) => {
      const currentMonthAdvances =
        s.fullAdvances?.filter((a) => {
          if (!a.date) return false;
          const dateStr = typeof a.date === 'string' ? a.date : new Date(a.date).toISOString();
          return dateStr.startsWith(globalFilterDate);
        }) || [];

      const att = monthlyAttendance.filter(a => (a.userId?._id || a.userId) === s.id);
      const p = att.filter(a => a.status === 'Present').length;
      const h = att.filter(a => a.status === 'Half Day').length;
      const pl = att.filter(a => a.status === 'Paid Leave').length;
      const netP = p + (h * 0.5) + pl;

      const [year, month] = globalFilterDate.split('-').map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();

      // Find the salary record matching the selected month. If none exists, use the base salary (first record)
      const sortedHistory = Array.isArray(s.salary)
        ? [...s.salary]
          .filter(sal => sal && typeof sal === 'object' && sal.month) // Sanitize legacy numbers
          .sort((a, b) => a.month.localeCompare(b.month))
        : [];

      const exactRecord = sortedHistory.find(sal => sal.month === globalFilterDate);
      const effectiveSalaryRecord = exactRecord || (sortedHistory.length > 0 ? sortedHistory[0] : null);

      const effectiveSalary = effectiveSalaryRecord ? effectiveSalaryRecord.amount : 0;
      const earnedSalary = Math.round((effectiveSalary / daysInMonth) * netP);

      return {
        ...s,
        baseSalary: effectiveSalary,
        totalAdvance: currentMonthAdvances.reduce(
          (sum, adv) => {
            const amt = Number(adv.amount || 0);
            const isBack = adv.advanceType === "BACK" || adv.type === "BACK";
            return isBack ? sum - amt : sum + amt;
          },
          0,
        ),
        advancePaid: currentMonthAdvances
          .filter((a) => a.status === "Paid" && !(a.advanceType === "BACK" || a.type === "BACK"))
          .reduce((sum, adv) => sum + Number(adv.amount || 0), 0),
        advanceRemaining: currentMonthAdvances.reduce((sum, adv) => {
          const amt = Number(adv.amount || 0);
          const isBack = adv.advanceType === "BACK" || adv.type === "BACK";
          if (isBack) return sum - amt;
          if (adv.status !== "Paid") return sum + amt;
          return sum;
        }, 0),
        presentDays: p,
        halfDays: h,
        paidLeaves: pl,
        netPresent: netP,
        earnedSalary: earnedSalary,
        effectiveSalary: effectiveSalary,
        monthSalaryRecord: effectiveSalaryRecord?.month === globalFilterDate ? effectiveSalaryRecord : null,
        daysInMonth: daysInMonth
      };
    });
  }, [staff, globalFilterDate, monthlyAttendance]);

  const selectedStaff = useMemo(() => {
    if (!selectedStaffId) return null;
    return processedStaff.find(s => s.id === selectedStaffId);
  }, [processedStaff, selectedStaffId]);

  // 2. Apply search and status filters on the PROCESSED data
  // Only show staff who have NO login (noLogin === true, i.e., no password set)
  const filteredStaff = useMemo(() => {
    return processedStaff.filter((s) => {

      // Hide staff who have a login/password
      if (!s.noLogin) return false;

      const checkTerm = (obj, term) => {
        if (!obj) return false;
        if (typeof obj === 'object') return Object.values(obj).some(val => checkTerm(val, term));
        return String(obj).toLowerCase().includes(term);
      };
      const matchesSearch = !searchTerm || checkTerm(s, searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "with-advance" && s.advanceRemaining > 0) ||
        (filterStatus === "no-advance" && s.advanceRemaining === 0);

      const colMatch = (key, val) => !colFilters[key]?.length || colFilters[key].includes(val);
      const matchesColFilters =
        colMatch('name', s.name) &&
        colMatch('position', s.position) &&
        colMatch('status', s.status) &&
        colMatch('city', s.city);

      return matchesSearch && matchesFilter && matchesColFilters;
    });
  }, [processedStaff, searchTerm, filterStatus, colFilters]);

  const totalStaff = processedStaff.filter(s => s.noLogin).length;
  const totalSalaryBurden = processedStaff.reduce(
    (sum, s) => sum + (s.earnedSalary || 0),
    0,
  );
  const totalAdvanceOutstanding = processedStaff.reduce(
    (sum, s) => sum + s.advanceRemaining,
    0,
  );
  const staffWithAdvance = processedStaff.filter(
    (s) => s.advanceRemaining > 0,
  ).length;

  const activeCount = useMemo(() => staff.filter(s => s.noLogin && s.status === "Active").length, [staff]);
  const inactiveCount = useMemo(() => staff.filter(s => s.noLogin && s.status === "Inactive").length, [staff]);

  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  const handleAddPosition = async () => {
    if (!newPositionName.trim()) return;
    try {
      const res = await fetch("/api/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPositionName }),
      });
      if (res.ok) {
        const addedPos = await res.json();
        setPositions(sortPositions([...positions, addedPos]));
        setNewPositionName("");
        setIsAddingPosition(false);
        setNewStaffData((prev) => ({ ...prev, position: addedPos.name }));
      } else {
        const err = await res.json();
        showToast(err.message || "Failed to add position", 'error');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sortPositions = (posArray) => {
    return [...posArray].sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      const isEditing = !!editingStaffId;
      const url = isEditing ? `/api/staff/${editingStaffId}` : "/api/staff";
      const method = isEditing ? "PUT" : "POST";

      // Handle salary updates
      let finalData = { ...newStaffData };
      const staffMember = isEditing ? staff.find(s => s.id === editingStaffId) : null;

      if (finalData.salary) {
        const salaryAmount = Number(finalData.salary);
        if (method === 'POST') {
          // New staff: initialize with first salary record
          finalData.salary = [{
            month: new Date().toISOString().slice(0, 7),
            amount: salaryAmount,
            status: 'Paid',
            paymentDate: new Date(),
            remarks: 'Initial Salary'
          }];
        } else if (isEditing && staffMember) {
          // Edit staff: update the LATEST salary record or add if empty
          let updatedSalary = Array.isArray(staffMember.salary) ? [...staffMember.salary] : [];

          if (updatedSalary.length > 0) {
            const lastIdx = updatedSalary.length - 1;
            // Handle legacy data where salary might be a number instead of an object
            if (typeof updatedSalary[lastIdx] === 'number' || !updatedSalary[lastIdx]) {
              updatedSalary[lastIdx] = {
                month: new Date(staffMember.dateOfJoining || Date.now()).toISOString().slice(0, 7),
                amount: salaryAmount,
                status: 'Paid',
                paymentDate: new Date(),
                remarks: 'Initial Salary (Converted)'
              };
            } else {
              updatedSalary[lastIdx].amount = salaryAmount;
            }
          } else {
            updatedSalary.push({
              month: new Date().toISOString().slice(0, 7),
              amount: salaryAmount,
              status: 'Paid',
              paymentDate: new Date(),
              remarks: 'Initial Salary'
            });
          }
          finalData.salary = updatedSalary;
        }
      } else if (!isEditing) {
        // If POST and no salary, maybe keep as empty array
        finalData.salary = [];
      } else {
        // If PUT and no salary change, don't send it to avoid overwriting with undefined
        delete finalData.salary;
      }

      // This page is for no-login staff only — always enforce noLogin: true
      if (!isEditing) finalData.noLogin = true;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      if (res.ok) {
        await fetchData(); // Validate and refresh
        setIsAddStaffModalOpen(false);
        setEditingStaffId(null);
        const isSuperAdmin = currentRole === 'Super Admin';
        const defaultCompanyId = isSuperAdmin ? (searchParams.get("companyId") || "") : (currentUserInfo?.companyId || "");
        setNewStaffData({
          gender: "Male",
          dob: "",
          name: "",
          phone: "",
          phone2: "",
          email: "",
          roleId: "",
          position: "",
          salary: "",
          cast: "",
          city: "",
          address: "",
          aadharNo: "",
          aadharPhoto: "",
          dateOfJoining: new Date().toISOString().split("T")[0],
          dateOfLeave: "",
          narration: "",
          password: "",
          noLogin: true,
          avatar: "",
          status: "Active",
          companyId: defaultCompanyId,
          assignedCompanies: defaultCompanyId ? [defaultCompanyId] : [],
        });
      } else {
        const data = await res.json();
        showToast(
          data.message || `Failed to ${isEditing ? "update" : "add"} staff`, 'error');
      }
    } catch (error) {
      console.error(
        `Error ${editingStaffId ? "updating" : "adding"} staff`,
        error,
      );
    }
  };

  const handleAddStaff = handleSave;

  const handleStatusToggle = async (staffMember) => {
    const newStatus = staffMember.status === "Active" ? "Inactive" : "Active";
    try {
      const res = await fetch(`/api/staff/${staffMember.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) await fetchData();
      else showToast("Failed to update status", 'error');
    } catch (error) { console.error("Error toggling status", error); }
  };

  const handleGiveAdvance = async (e) => {
    if (e) e.preventDefault();
    try {
      const amount = Number(advanceData.amount);
      const newAdvance = {
        ...advanceData,
        amount,
        status: advanceData.advanceType === 'BACK' ? 'Paid' : 'Pending',
        id: Date.now().toString()
      };
      const updatedAdvances = [newAdvance, ...(selectedStaff.fullAdvances || [])];
      const res = await fetch(`/api/staff/${selectedStaff.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advances: updatedAdvances }),
      });
      if (res.ok) {
        await fetchData();
        setIsAdvanceModalOpen(false);
        setAdvanceData({ advanceType: "GIVE", amount: "", reason: "", paidBy: "", paymentType: "Cash", date: new Date().toISOString().split("T")[0], receipt: null });
      } else showToast("Failed to update advance", 'error');
    } catch (error) { console.error("Error giving advance", error); }
  };

  const handleUpdateStatus = async (advanceId, newStatus) => {
    try {
      const updatedAdvances = selectedStaff.fullAdvances.map((adv) => {
        if (adv._id === advanceId || adv.id === advanceId) return { ...adv, status: newStatus };
        return adv;
      });
      const res = await fetch(`/api/staff/${selectedStaff.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advances: updatedAdvances }),
      });
      if (res.ok) await fetchData();
      else showToast("Failed to update status", 'error');
    } catch (error) { console.error("Error updating status", error); }
  };

  // Update salary amount when month changes in history form
  useEffect(() => {
    if (selectedStaffId && isHistoryModalOpen) {
      const staffMember = staff.find(s => s.id === selectedStaffId);
      if (staffMember) {
        const existingRecord = Array.isArray(staffMember.salary) ? staffMember.salary.find(sal => sal.month === salaryEntryData.month) : null;
        if (existingRecord) {
          setSalaryEntryData(prev => ({ ...prev, amount: existingRecord.amount }));
        } else {
          // Default to previous month's amount or latest record
          const lastRecord = Array.isArray(staffMember.salary) && staffMember.salary.length > 0 ? staffMember.salary[0] : null;
          setSalaryEntryData(prev => ({
            ...prev,
            amount: lastRecord ? lastRecord.amount : ""
          }));
        }
      }
    }
  }, [salaryEntryData.month, selectedStaffId, isHistoryModalOpen, staff]);

  const handleMonthChange = (direction) => {
    const [year, month] = historyFilterDate.split("-").map(Number);

    const date = new Date(year, month - 1);

    // move only one month
    date.setMonth(date.getMonth() + direction);

    // format YYYY-MM manually
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, "0");

    setHistoryFilterDate(`${newYear}-${newMonth}`);
  };

  const handleSaveSalaryHistory = async (e) => {
    if (e) e.preventDefault();
    try {
      const staffMember = staff.find(s => s.id === selectedStaffId);
      if (!staffMember) return;

      const salaryAmount = Number(salaryEntryData.amount);
      let updatedSalary = Array.isArray(staffMember.salary) ? [...staffMember.salary] : [];

      const existingIdx = updatedSalary.findIndex(sal => sal && typeof sal === 'object' && sal.month === salaryEntryData.month);

      if (existingIdx > -1) {
        // Update existing month record
        updatedSalary[existingIdx] = {
          ...updatedSalary[existingIdx],
          amount: salaryAmount,
          status: salaryEntryData.status,
          paymentDate: salaryEntryData.paymentDate,
          remarks: salaryEntryData.remarks
        };
      } else {
        // Add new month record
        const newEntry = {
          ...salaryEntryData,
          amount: salaryAmount,
          id: Date.now().toString()
        };
        updatedSalary.unshift(newEntry);
      }

      const res = await fetch(`/api/staff/${selectedStaffId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salary: updatedSalary }),
      });

      if (res.ok) {
        showToast(existingIdx > -1 ? "Salary updated" : "Salary record added", "success");
        await fetchData();
        // Hide form after save
        const form = document.getElementById('salary-history-form');
        if (form) form.classList.add('hidden');
      } else {
        showToast("Failed to save salary record", "error");
      }
    } catch (error) {
      console.error("Error saving salary record:", error);
    }
  };

  const handleUpdateAdvanceType = async (advanceId, newType) => {
    try {
      const updatedAdvances = selectedStaff.fullAdvances.map((adv) => {
        if (adv._id === advanceId || adv.id === advanceId) {
          return { ...adv, advanceType: newType, type: newType };
        }
        return adv;
      });
      const res = await fetch(`/api/staff/${selectedStaff.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advances: updatedAdvances }),
      });
      if (res.ok) {
        await fetchData();
        showToast(`Changed to ${newType}`, 'success');
      } else showToast("Failed to update type", 'error');
    } catch (error) { console.error("Error updating type", error); }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setAdvanceData({ ...advanceData, receipt: file.name });
  };

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingAadhar, setIsUploadingAadhar] = useState(false);

  const handleStaffImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "staff");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) setNewStaffData((prev) => ({ ...prev, avatar: data.path }));
      else showToast("Image upload failed", 'error');
    } catch (error) { console.error("Upload error:", error); } finally { setIsUploadingAvatar(false); }
  };

  const handleAadharUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingAadhar(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "staff/aadhar");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) setNewStaffData((prev) => ({ ...prev, aadharPhoto: data.path }));
      else showToast("Aadhaar upload failed", 'error');
    } catch (error) { console.error("Aadhaar upload error:", error); } finally { setIsUploadingAadhar(false); }
  };

  const openHistoryModal = (staffMember) => {
    setSelectedStaffId(staffMember.id);
    setHistoryFilterDate(new Date().toISOString().slice(0, 7));
    setIsHistoryModalOpen(true);
  };

  const openAdvanceModal = (staffMember) => {
    setSelectedStaffId(staffMember.id);
    const date = globalFilterDate === new Date().toISOString().slice(0, 7)
      ? new Date().toISOString().split("T")[0]
      : `${globalFilterDate}-01`;
    setAdvanceData((prev) => ({ ...prev, date, advanceType: "GIVE" }));
    setIsAdvanceModalOpen(true);
  };

  const handleDeleteStaff = async (id) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;
    try {
      const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Staff deleted successfully", 'success');
        await fetchData();
      } else {
        const data = await res.json();
        showToast(data.message || "Failed to delete staff", 'error');
      }
    } catch (error) {
      console.error("Delete error:", error);
      showToast("An error occurred", 'error');
    }
  };


  const handleDownloadPDF = async (s) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    try {
      const fontRes = await fetch("/fonts/NotoSansDevanagari-Regular.ttf");
      if (fontRes.ok) {
        const fontBuf = await fontRes.arrayBuffer();
        const uint8 = new Uint8Array(fontBuf);
        let binary = "";
        for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i]);
        }
        doc.addFileToVFS("NotoSansDevanagari.ttf", binary);
        doc.addFont("NotoSansDevanagari.ttf", "NotoSansDevanagari", "normal");
      }
    } catch (error) {
      console.error("Error loading NotoSansDevanagari font:", error);
    }

    const hasNoto = doc.getFontList().NotoSansDevanagari;


    // Helper for centering text manually
    const renderCenteredText = (text, y, fontSize, fontStyle, color) => {
      const useFont = (hasNoto && hasDevanagari(text)) ? "NotoSansDevanagari" : "helvetica";
      doc.setFont(useFont, fontStyle || "normal");
      doc.setFontSize(fontSize);
      doc.setTextColor(color[0], color[1], color[2]);
      const textWidth = doc.getTextWidth(text);
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, y);
    };

    // 1. Load Images (Logo, Avatar, Aadhaar)
    const [avatarDataUrl, aadharDataUrl] = await Promise.all([
      s.avatar ? imgToDataURL(s.avatar) : null,
      s.aadharPhoto ? imgToDataURL(s.aadharPhoto) : null
    ]);

    // --- Header Section ---
    await addStandardHeader(doc, "Staff Details", companyName, companyAddress, companyPhone);

    // --- Details & Profile Photo ---
    let currY = 38;
    const labelX = 20;
    const col2X = 85;
    const inputW = 65;

    if (avatarDataUrl) {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(162, 35, 42, 56, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.roundedRect(165, 38, 42, 56, 2, 2, 'D');
      doc.addImage(avatarDataUrl, 'JPEG', 167, 40, 38, 52);
    }

    const renderField = (label, value, x, y, width) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(label + " :", x, y - 5);

      const valText = String(value || "---");
      const useFont = (hasNoto && hasDevanagari(valText)) ? "NotoSansDevanagari" : "helvetica";

      doc.setFont(useFont, (useFont === "helvetica") ? "bold" : "normal");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(valText, x, y + 1);

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.4);
      doc.line(x, y + 4, x + width, y + 4);
    };

    renderField("Full Name", s.name, labelX, currY, 130);
    currY += 25;
    renderField("Ph. (1)", s.phone, labelX, currY, inputW);
    renderField("Ph. (2)", s.phone2 || "---", col2X, currY, inputW);
    currY += 25;
    renderField("Email Address", s.email, labelX, currY, inputW);
    renderField("Position", s.position, col2X, currY, inputW);
    currY += 25;
    renderField("City", s.city, labelX, currY, inputW);
    renderField("DOB", s.dob ? new Date(s.dob).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "---", col2X, currY, inputW);
    currY += 25;
    renderField("Date of Joining", s.dateOfJoining ? new Date(s.dateOfJoining).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "---", labelX, currY, inputW);
    renderField("Date of Leave", s.dateOfLeave ? new Date(s.dateOfLeave).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "---", col2X, currY, inputW);
    currY += 25;
    renderField("Full Address", s.address, labelX, currY, 160);

    if (aadharDataUrl) {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect((pageWidth / 2) - 45, 175, 90, 50, 2, 2, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.5);
      doc.roundedRect((pageWidth / 2) - 45, 175, 90, 50, 2, 2, 'D');
      doc.addImage(aadharDataUrl, 'JPEG', (pageWidth / 2) - 42.5, 177.5, 85, 45);
    }

    // --- Salary History Section ---
    if (Array.isArray(s.salary) && s.salary.length > 0) {
      doc.addPage();
      await addStandardHeader(doc, "Salary History", companyName, companyAddress, companyPhone);

      const salaryTableData = [...s.salary].sort((a, b) => b.month.localeCompare(a.month)).map(sal => [
        new Date(sal.month + "-01").toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
        `Rs. ${formatIndianNumber(sal.amount)}`,
        sal.status,
        sal.paymentDate ? new Date(sal.paymentDate).toLocaleDateString('en-GB') : "N/A",
        sal.remarks || "-"
      ]);

      autoTable(doc, {
        head: [['Month', 'Amount', 'Status', 'Paid On', 'Remarks']],
        body: salaryTableData,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          1: { halign: 'right', fontStyle: 'bold' },
          2: { halign: 'center' }
        }
      });
    }

    doc.setFillColor(230, 112, 34);
    doc.rect(0, 285, pageWidth, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("90998 21000 / 96388 21000", pageWidth * 0.28, 292.5);
    doc.text("vadodara@sgrs.org", pageWidth * 0.65, 292.5);
    doc.setFillColor(255, 255, 255);
    doc.circle(pageWidth * 0.25, 292, 1, 'F');
    doc.circle(pageWidth * 0.62, 292, 1, 'F');

    doc.save(`${s.name.replace(/\s+/g, '_')}_details.pdf`);
  };

  const handleDownloadSalarySheet = async (format) => {
    const [year, month] = globalFilterDate.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    if (format === 'excel') {
      const data = filteredStaff.map(s => {
        const att = monthlyAttendance.filter(a => (a.userId?._id || a.userId) === s.id);
        const p = att.filter(a => a.status === 'Present').length;
        const h = att.filter(a => a.status === 'Half Day').length;
        const a = att.filter(a => a.status === 'Absent').length;
        const pl = att.filter(a => a.status === 'Paid Leave').length;
        const netP = p + (h * 0.5) + pl;
        const currentBaseSalary = s.baseSalary || (typeof s.salary === 'number' ? s.salary : 0);
        const earnedSalary = Math.round((currentBaseSalary / daysInMonth) * netP);

        return {
          "Name": s.name,
          "Position": s.position,
          "P": p,
          "H": h,
          "A": a,
          "PL": pl,
          "Net P.": netP,
          "M. Salary": currentBaseSalary,
          "Earned Sal.": earnedSalary,
          "Advance": s.totalAdvance || 0,
          "Net Salary": earnedSalary - (s.totalAdvance || 0)
        };
      });
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Salary Sheet");
      XLSX.writeFile(wb, `Salary_Sheet_${globalFilterDate}.xlsx`);
    } else if (format === 'pdf') {
      const doc = new jsPDF('l', 'mm', 'a4');

      try {
        const fontRes = await fetch("/fonts/NotoSansDevanagari-Regular.ttf");
        if (fontRes.ok) {
          const fontBuf = await fontRes.arrayBuffer();
          const uint8 = new Uint8Array(fontBuf);
          let binary = "";
          for (let i = 0; i < uint8.length; i++) { binary += String.fromCharCode(uint8[i]); }
          doc.addFileToVFS("NotoSansDevanagari.ttf", binary);
          doc.addFont("NotoSansDevanagari.ttf", "NotoSansDevanagari", "normal");
        }
      } catch (error) { console.error("Error loading NotoSansDevanagari font:", error); }

      const pageWidth = doc.internal.pageSize.getWidth();
      const hasNoto = doc.getFontList().NotoSansDevanagari;

      await addStandardHeader(doc, "Staff Salary", companyName, companyAddress, companyPhone);

      const monthLabel = new Date(globalFilterDate + "-01").toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Month : ${monthLabel}`, pageWidth - 10, 25, { align: 'right' });

      const avatarMap = {};
      const tableData = await Promise.all(filteredStaff.map(async (s) => {
        const att = monthlyAttendance.filter(a => (a.userId?._id || a.userId) === s.id);
        const p = att.filter(a => a.status === 'Present').length;
        const h = att.filter(a => a.status === 'Half Day').length;
        const a = att.filter(a => a.status === 'Absent').length;
        const pl = att.filter(a => a.status === 'Paid Leave').length;
        const netP = p + (h * 0.5) + pl;
        const currentBaseSalary = s.baseSalary || (typeof s.salary === 'number' ? s.salary : 0);
        const earnedSalary = Math.round((currentBaseSalary / daysInMonth) * netP);

        if (s.avatar) avatarMap[s.id] = await imgToDataURL(s.avatar);

        return [
          s.name, s.position, p || "", h || "", a || "", pl || "", netP,
          `₹ ${formatIndianNumber(currentBaseSalary)}`,
          `₹ ${formatIndianNumber(s.totalAdvance || 0)}`,
          `₹ ${formatIndianNumber(earnedSalary - (s.totalAdvance || 0))}`,
          ""
        ];
      }));

      autoTable(doc, {
        head: [["Name", "Position", "P", "H", "A", "PL", "Net P.", "M. Salary", "Advance", "Net Salary", "Signature"]],
        body: tableData,
        startY: 30,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
        headStyles: { fillColor: [240, 240, 240], textColor: [51, 65, 85], fontStyle: 'bold', font: 'helvetica' },
        columnStyles: {
          0: { halign: 'left', textColor: [230, 112, 34], fontStyle: 'bold', cellWidth: 45, cellPadding: { left: 10 } },
          1: { halign: 'left' }
        },
        didParseCell: (data) => {
          if (data.section === 'body') {
            const val = String(data.cell.raw || "");
            if (hasNoto && hasDevanagari(val)) {
              data.cell.styles.font = 'NotoSansDevanagari';
            } else {
              data.cell.styles.font = 'helvetica';
            }
          }
        },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 0) {
            const s = filteredStaff[data.row.index];
            const img = avatarMap[s.id];
            if (img) doc.addImage(img, 'JPEG', data.cell.x + 1.5, data.cell.y + 1, 6, 6);
          }
        }
      });

      doc.save(`Salary_Sheet_${globalFilterDate}.pdf`);
    }
  };
  useEffect(() => {
    const persistedData = forms['staff'];
    if (persistedData) {
      if (persistedData.searchTerm) setSearchTerm(persistedData.searchTerm);
      if (persistedData.filterStatus) setFilterStatus(persistedData.filterStatus);
      if (persistedData.globalFilterDate) setGlobalFilterDate(persistedData.globalFilterDate);
      if (persistedData.colFilters) setColFilters(persistedData.colFilters);
      if (persistedData.newStaffData) setNewStaffData(persistedData.newStaffData);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      setFormData('staff', {
        searchTerm, filterStatus, globalFilterDate, colFilters, newStaffData
      });
    }
  }, [searchTerm, filterStatus, globalFilterDate, colFilters, newStaffData, isHydrated]);

  const handleExportStaffList = async (format) => {
    if (format === 'excel') {
      const sheetData = filteredStaff.map(s => ({
        "Name": s.name, "Phone 1": s.phone, "Phone 2": s.phone2 || "", "Email": s.email, "Position": s.position, "Salary": s.baseSalary || (typeof s.salary === 'number' ? s.salary : 0), "Cast": s.cast || "", "City": s.city || "", "Address": s.address || "", "Aadhar": s.aadharNo || "", "Joining Date": s.dateOfJoining ? new Date(s.dateOfJoining).toLocaleDateString() : "", "Status": s.status, "Leave Date": s.dateOfLeave ? new Date(s.dateOfLeave).toLocaleDateString() : "", "Notes": s.narration || ""
      }));
      const ws = XLSX.utils.json_to_sheet(sheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Staff List");
      XLSX.writeFile(wb, `Staff_List_${new Date().toLocaleDateString()}.xlsx`);
    } else if (format === 'pdf') {
      const doc = new jsPDF('l', 'mm', 'a3');
      try {
        const fontRes = await fetch("/fonts/NotoSansDevanagari-Regular.ttf");
        if (fontRes.ok) {
          const fontBuf = await fontRes.arrayBuffer();
          const uint8 = new Uint8Array(fontBuf);
          let binary = "";
          for (let i = 0; i < uint8.length; i++) { binary += String.fromCharCode(uint8[i]); }
          doc.addFileToVFS("NotoSansDevanagari.ttf", binary);
          doc.addFont("NotoSansDevanagari.ttf", "NotoSansDevanagari", "normal");
        }
      } catch (error) { }

      const pageWidth = doc.internal.pageSize.getWidth();
      const hasNoto = doc.getFontList().NotoSansDevanagari;

      await addStandardHeader(doc, "Staff Details", companyName, companyAddress, companyPhone);

      const avatarMap = {};
      const tableData = await Promise.all(filteredStaff.map(async (s) => {
        if (s.avatar) avatarMap[s.id] = await imgToDataURL(s.avatar);
        const currentBaseSalary = s.baseSalary || (typeof s.salary === 'number' ? s.salary : 0);
        return [
          s.name, s.phone, s.phone2 || "-", s.email, s.position, `₹${formatIndianNumber(currentBaseSalary)}`, s.cast || "-", s.city || "-", s.address || "-", s.aadharNo || "-", s.dateOfJoining ? new Date(s.dateOfJoining).toLocaleDateString("en-GB") : "-", s.status, s.dateOfLeave ? new Date(s.dateOfLeave).toLocaleDateString("en-GB") : "-", s.narration || "-"
        ];
      }));

      autoTable(doc, {
        head: [["Name", "Ph.1", "Ph.2", "Email Address", "Position", "Salary", "Cast", "City", "Full Address", "Aadhar Number", "Joining Dt.", "Status", "Leave Dt.", "Notes"]],
        body: tableData,
        startY: 30,
        theme: 'grid',
        styles: { fontSize: 8, halign: 'center', overflow: 'linebreak' },
        headStyles: { fillColor: [240, 240, 240], textColor: [51, 65, 85], fontStyle: 'bold', font: 'helvetica' },
        columnStyles: {
          0: { halign: 'left', textColor: [230, 112, 34], fontStyle: 'bold', cellWidth: 45, cellPadding: { left: 10 } },
          5: { cellWidth: 30, halign: 'right' }, // Salary - more space
          8: { cellWidth: 65, halign: 'left' }  // Address - even more space
        },
        didParseCell: (data) => {
          if (data.section === 'body') {
            const val = String(data.cell.raw || "");
            // Prioritize Noto for anything containing Rupee or Devanagari
            if (hasNoto && (hasDevanagari(val) || val.includes('₹'))) {
              data.cell.styles.font = 'NotoSansDevanagari';
            } else {
              data.cell.styles.font = 'helvetica';
            }
          }
        },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 0) {
            const s = filteredStaff[data.row.index];
            const img = avatarMap[s.id];
            if (img) doc.addImage(img, 'JPEG', data.cell.x + 1.5, data.cell.y + 1, 6, 6);
          }
        }
      });
      doc.save(`Staff_List_${new Date().toLocaleDateString()}.pdf`);
    }
  };

  const imgToDataURL = async (url) => {
    try {
      if (!url) return null;
      const res = await fetch(url);
      if (!res.ok) return null;
      const blob = await res.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      return null;
    }
  };

  const handleEditStaff = async (s) => {
    setEditingStaffId(s.id);
    setNewStaffData({
      gender: s.gender || "Male",
      dob: s.dob ? new Date(s.dob).toISOString().split("T")[0] : "",
      name: s.name || "", phone: s.phone || "", phone2: s.phone2 || "", email: s.email || "",
      roleId: s.roleId || "", position: s.position || "",
      salary: Array.isArray(s.salary) && s.salary.length > 0 ? s.salary[s.salary.length - 1].amount : "",
      cast: s.cast || "", city: s.city || "", address: s.address || "",
      aadharNo: s.aadharNo || "", aadharPhoto: s.aadharPhoto || "",
      dateOfJoining: s.dateOfJoining ? new Date(s.dateOfJoining).toISOString().split("T")[0] : "",
      dateOfLeave: s.dateOfLeave ? new Date(s.dateOfLeave).toISOString().split("T")[0] : "",
      narration: s.narration || "", password: "", avatar: s.avatar || "",
      status: s.status || "Active", companyId: s.companyId || "",
      assignedCompanies: s.assignedCompanies || [],
    });

    // Also pre-fill salary entry data for the history form
    const currentMonth = globalFilterDate;
    const existingRecord = Array.isArray(s.salary) ? s.salary.find(sal => sal.month === currentMonth) : null;
    const lastRecord = Array.isArray(s.salary) && s.salary.length > 0 ? s.salary[0] : null;

    setSalaryEntryData({
      month: currentMonth,
      amount: existingRecord ? existingRecord.amount : (lastRecord ? lastRecord.amount : ""),
      status: "Paid",
      paymentDate: new Date().toISOString().split("T")[0],
      remarks: "",
    });

    setIsAddStaffModalOpen(true);
  };

  if (permsLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-muted-foreground">Loading Staff...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission("read")) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full bg-card rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={40} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground font-medium mb-8">You don&apos;t have permission to view Staff records. Please contact your administrator for access.</p>
          <button onClick={() => window.history.back()} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">Go Back</button>
        </div>
      </div>
    );
  }


  return (
    <main className="flex-1 p-4 md:p-8 mb-20 md:mb-0 min-h-screen">
      <div className="bg-white rounded-lg shadow-2xl ">
        {/* Top Right Header Controls: Active/Inactive Filter Dropdown & Source Button */}
        <div className="flex justify-end items-center gap-4 p-3">
          {/* Active / Inactive Filter Dropdown */}
          <FilterDropdown
            options={[
              { value: 'all', label: 'Active / Inactive' },
              { value: 'Active', label: 'Active Only' },
              { value: 'Inactive', label: 'Inactive Only' },
              { value: 'with-advance', label: 'With Advance' },
            ]}
            value={filterStatus}
            onChange={(val) => setFilterStatus(val || 'all')}
            title="Active / Inactive"
            placeholder="Search status..."
            className="flex items-center justify-between gap-2 cursor-pointer shadow-sm transition-all pl-4 pr-3 py-1.5 bg-white dark:bg-zinc-800 border border-[#D4612D] rounded-xl text-xs font-bold text-[#D4612D] hover:opacity-90"
          />

          {/* Source Button */}
          {!isReadOnly && (
            <PermissionWrapper action="source">
              <button
                onClick={() => setIsMasterModalOpen(true)}
                className="flex items-center gap-2 px-4 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold text-[#882619] hover:bg-stone-50 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <img src="/icons/action/Source.svg" alt="Source" className="w-4 h-4 block dark:hidden" />
                <img src="/icons/action/SourceDark.svg" alt="Source" className="w-4 h-4 hidden dark:block" />
                <span>Source</span>
              </button>
            </PermissionWrapper>
          )}
        </div>

        {/* Main Header / Stat Summary Box with Exact Gradient Borders */}
        <div
          className="w-full px-4 sm:px-8 py-4 mb-8 flex flex-wrap items-center justify-between gap-4 sm:gap-6 bg-[#EBE8E5] dark:bg-[#252525] relative"
          style={{
            borderTop: "2px solid transparent",
            borderBottom: "2px solid transparent",
            borderImage: "linear-gradient(to right, #882619, #D4612D) 1",
          }}
        >
          {/* Left Stat Counters */}
          <div className="flex items-center gap-6 sm:gap-8 flex-wrap shrink-0 justify-around sm:justify-start">
            {/* Total Staff */}
            <div className="flex items-baseline gap-3">
              <span
                className="font-serif italic text-base font-medium whitespace-nowrap"
                style={{
                  background: "linear-gradient(90deg, #882619 0%, #D4612D 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Total Staff
              </span>
              <span
                className="text-3xl font-black leading-none"
                style={{
                  background: "linear-gradient(90deg, #882619 0%, #D4612D 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {String(totalStaff).padStart(2, '0')}
              </span>
            </div>

            <div className="w-[1.5px] h-10 bg-[#A4A4A4]" />

            {/* Active */}
            <div className="flex items-baseline gap-3">
              <span className="font-serif italic text-base text-[#2e7d32] font-medium whitespace-nowrap">Active</span>
              <span className="text-3xl font-black text-[#2e7d32] leading-none">{String(activeCount).padStart(2, '0')}</span>
            </div>

            <div className="w-[1.5px] h-10 bg-[#A4A4A4]" />

            {/* Inactive */}
            <div className="flex items-baseline gap-3">
              <span
                className="font-serif italic text-base font-medium whitespace-nowrap"
                style={{
                  background: "linear-gradient(90deg, #882619 0%, #D4612D 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Inactive
              </span>
              <span
                className="text-3xl font-black leading-none"
                style={{
                  background: "linear-gradient(90deg, #882619 0%, #D4612D 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {String(inactiveCount).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Middle Quick Search Bar with Gradient Border */}
          <div className="relative w-full sm:w-[240px] md:w-[280px] lg:w-[320px] shrink-0">
            <div
              className="flex items-center px-4 py-2 bg-white dark:bg-zinc-800 rounded-xl shadow-inner"
              style={{ border: "1.5px solid #D4612D" }}
            >
              <Search className="text-[#D4612D] shrink-0 mr-3" size={16} />
              <input
                type="text"
                placeholder="Quick Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-stone-800 dark:text-zinc-100 outline-none placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* Right Header Action Icons */}
          <div className="flex items-center gap-3 sm:gap-5 flex-wrap shrink-0 justify-end">
            {/* Clear Filters Button (if active) */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex flex-col items-center justify-center text-[#882619] hover:opacity-80 transition-all active:scale-95 cursor-pointer shrink-0"
                title="Clear Filters"
              >
                <X size={20} className="text-[#882619]" />
                <span className="text-[10px] font-bold mt-0.5">Clear</span>
              </button>
            )}

            {/* Delete Action */}
            <button
              onClick={clearAllFilters}
              className="flex flex-col items-center justify-center text-[#882619] hover:opacity-80 transition-all active:scale-95 cursor-pointer shrink-0"
              title="Delete / Reset Filters"
            >
              <img src="/icons/action/Delete.svg" alt="Delete" className="w-10 h-10 shrink-0 block dark:hidden" />
              <img src="/icons/action/DeleteDark.svg" alt="Delete" className="w-10 h-10 shrink-0 hidden dark:block" />
            </button>

            {/* Add Staff Action */}
            {!isReadOnly && (
              <PermissionWrapper action="write">
                <button
                  onClick={() => setIsAddStaffModalOpen(true)}
                  className="flex flex-col items-center justify-center text-[#882619] hover:opacity-80 transition-all active:scale-95 cursor-pointer shrink-0"
                  title="Add Staff"
                >
                  <img src="/icons/action/addStaff.svg" className="w-10 h-10 shrink-0 block dark:hidden" alt="Add Staff" />
                  <img src="/icons/action/addStaffDark.svg" className="w-10 h-10 shrink-0 hidden dark:block" alt="Add Staff" />
                </button>
              </PermissionWrapper>
            )}

            {/* Download List Action */}
            <PermissionWrapper action="read">
              <button
                onClick={() => handleExportStaffList('pdf')}
                className="flex flex-col items-center justify-center text-[#882619] hover:opacity-80 transition-all active:scale-95 cursor-pointer shrink-0"
                title="Download List"
              >
                <img src="/icons/action/Download.svg" alt="Download" className="w-14 h-14 shrink-0 block dark:hidden" />
                <img src="/icons/action/DownloadDark.svg" alt="Download" className="w-14 h-14 shrink-0 hidden dark:block" />
              </button>
            </PermissionWrapper>

            {/* Salary Sheet Action */}
            <PermissionWrapper action="read">
              <button
                onClick={() => handleDownloadSalarySheet('pdf')}
                className="flex flex-col items-center justify-center text-[#882619] hover:opacity-80 transition-all active:scale-95 cursor-pointer shrink-0"
                title="Download Salary Sheet"
              >
                <img src="/icons/action/DownloadSalary.svg" alt="Salary Sheet" className="w-14 h-14 shrink-0 block dark:hidden" />
                <img src="/icons/action/DownloadSalaryDark.svg" alt="Salary Sheet" className="w-14 h-14 shrink-0 hidden dark:block" />
              </button>
            </PermissionWrapper>
          </div>
        </div>

        {/* Staff Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6 p-6">
          {paginatedStaff.map((s) => {
            const isActive = s.status === "Active";
            return (
              <div
                key={s.id}
                className="relative rounded-2xl border-2 border-[#D4612D]/70 dark:border-[#D4612D]/40 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group bg-white dark:bg-zinc-900"
              >
                {/* Top Status Dot Indicator */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5">
                  <span
                    onClick={() => { if (hasPermission("edit")) handleStatusToggle(s); }}
                    className={`w-3.5 h-3.5 rounded-full cursor-pointer transition-transform hover:scale-125 ${isActive ? "bg-[#388e3c]" : "bg-[#d32f2f]"
                      }`}
                    title={`Status: ${s.status} (Click to toggle)`}
                  />
                </div>

                {/* Top Avatar & Header Area */}
                <div className={`pt-6 pb-4 px-4 flex flex-col items-center text-center transition-colors ${isActive ? "bg-white dark:bg-zinc-900" : "bg-[#FFD5D5] dark:bg-rose-950/20"}`}>
                  {/* Avatar Circle */}
                  <div className="relative mb-3 group/avatar">
                    {s.avatar ? (
                      <button onClick={() => setPreviewImage(s.avatar)} className="block relative">
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-28 h-28 rounded-full object-cover shadow-[0_6px_16px_rgba(0,0,0,0.18)] border-2 border-[#D4612D] group-hover/avatar:brightness-95 transition-all"
                        />
                      </button>
                    ) : (
                      <div className="w-28 h-28 rounded-full bg-orange-100/60 dark:bg-zinc-800 border-2 border-[#D4612D] flex items-center justify-center shadow-[0_6px_16px_rgba(0,0,0,0.18)]">
                        <User className="text-[#BD4423] dark:text-[#D4612D]" size={48} />
                      </div>
                    )}
                  </div>

                  {/* Staff Name */}
                  <h3 className="text-2xl font-normal text-[#BD4423] dark:text-[#D4612D] tracking-tight leading-snug">
                    {s.name}
                  </h3>

                  {/* Joined Date | Position */}
                  <p className="text-xs font-normal text-slate-500 dark:text-zinc-400 mt-1">
                    Joined : {new Date(s.joinDate || s.dateOfJoining || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })} | {s.position}
                  </p>
                </div>

                {/* Card Body Information List (Light Grey Section) */}
                <div className={`px-5 py-4 space-y-3 text-xs flex-1 ${isActive ? "bg-[#EDEDED] dark:bg-zinc-800/80" : "bg-[#E5E5E5] dark:bg-zinc-800"}`}>
                  {/* Phone Numbers Line */}
                  <div className="flex items-center gap-3">
                    <img
                      src="/icons/action/Phone.svg"
                      className="w-4 h-4 shrink-0 opacity-70"
                      alt="Phone"
                    />
                    <span className="truncate text-[#BD4423] dark:text-[#D4612D] font-bold">
                      {s.phone} {s.phone2 ? `/ ${s.phone2}` : ''}
                    </span>
                  </div>

                  {/* Location Line */}
                  <div className="flex items-center gap-3">
                    <img
                      src="/icons/action/Location.svg"
                      className="w-4 h-4 shrink-0 opacity-70"
                      alt="Location"
                    />
                    <span className="truncate text-[#BD4423] dark:text-[#D4612D] font-bold">{s.city || 'N/A'}</span>
                  </div>

                  {/* Aadhaar Number & Aadhaar Card Button Line */}
                  <div className="flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src="/icons/action/AdharNumber.svg"
                        alt="Aadhaar"
                        className="w-4 h-4 shrink-0 opacity-70"
                      />
                      <span className="font-semibold text-[#BD4423] dark:text-[#D4612D] truncate">{s.aadharNo || 'N/A'}</span>
                    </div>
                    <div
                      onClick={() => {
                        const aadharImg = s.aadharPhoto || s.aadharCard || s.aadhar;
                        if (aadharImg) {
                          setPreviewImage(aadharImg);
                        } else {
                          showToast("No Aadhar card uploaded for " + s.name, "info");
                        }
                      }}
                      className="flex flex-col items-center justify-center text-[10px] text-slate-600 dark:text-zinc-400 shrink-0 cursor-pointer hover:opacity-80 active:scale-95 transition-all ml-2"
                      title={s.aadharPhoto || s.aadharCard || s.aadhar ? "Click to view Aadhar Card" : "No Aadhar card uploaded"}
                    >
                      <img
                        src="/icons/action/ImageGray.svg"
                        alt="Aadhar Card"
                        className="w-4 h-4 mb-0.5 opacity-70"
                      />
                      <span className="text-center leading-none text-[10px]">Aadhar card</span>
                    </div>
                  </div>

                  {/* Salary Amount Line */}
                  <div className="flex items-center gap-3">
                    <img
                      src="/icons/action/SalaryR.svg"
                      alt="Salary"
                      className="w-4 h-4 shrink-0 opacity-70"
                    />
                    <span className="font-bold text-sm text-[#BD4423] dark:text-[#D4612D]">
                      ₹ {formatIndianNumber(s.effectiveSalary)}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Footer Bar with Gradient 882619 to D4612D */}
                <div
                  className="w-full px-4 py-3 flex items-center justify-around rounded-b-xl transition-all"
                  style={{
                    background: "linear-gradient(90deg, #882619 0%, #D4612D 100%)",
                  }}
                >
                  {/* Edit Button */}
                  {!isReadOnly && (
                    <PermissionWrapper action="edit">
                      <button
                        onClick={() => handleEditStaff(s)}
                        className="p-1 hover:scale-110 transition-transform active:scale-90 cursor-pointer border-0 bg-transparent"
                        title="Edit Staff"
                      >
                        <img
                          src="/icons/action/EditWhite.svg"
                          alt="Edit"
                          className="w-5 h-5"
                        />
                      </button>
                    </PermissionWrapper>
                  )}

                  {/* Delete Button */}
                  {!isReadOnly && (
                    <PermissionWrapper action="delete">
                      <button
                        onClick={() => handleDeleteStaff(s.id)}
                        className="p-1 hover:scale-110 transition-transform active:scale-90 cursor-pointer border-0 bg-transparent"
                        title="Delete Staff"
                      >
                        <img
                          src="/icons/action/DeleteWhite.svg"
                          alt="Delete"
                          className="w-5 h-5"
                        />
                      </button>
                    </PermissionWrapper>
                  )}

                  {/* Download PDF Button */}
                  <PermissionWrapper action="read">
                    <button
                      onClick={() => handleDownloadPDF(s)}
                      className="p-1 hover:scale-110 transition-transform active:scale-90 cursor-pointer border-0 bg-transparent"
                      title="Download Details PDF"
                    >
                      <img
                        src="/icons/action/DownloadWhite.svg"
                        alt="Download"
                        className="w-5 h-5 brightness-0 invert"
                      />
                    </button>
                  </PermissionWrapper>

                  {/* Advance / Entry Button */}
                  {!isReadOnly && (
                    <PermissionWrapper action="write">
                      <button
                        onClick={() => openAdvanceModal(s)}
                        className="p-1 hover:scale-110 transition-transform active:scale-90 cursor-pointer border-0 bg-transparent"
                        title="Advance / Entry"
                      >
                        <img
                          src="/icons/action/SalaryProfile.svg"
                          alt="Advance"
                          className="w-5.5 h-5.5"
                        />
                      </button>
                    </PermissionWrapper>
                  )}

                  {/* History / View Button */}
                  <PermissionWrapper action="read">
                    <button
                      onClick={() => openHistoryModal(s)}
                      className="p-1 hover:scale-110 transition-transform active:scale-90 cursor-pointer border-0 bg-transparent"
                      title="View History"
                    >
                      <img
                        src="/icons/action/EyeWhite.svg"
                        alt="View"
                        className="w-5 h-5"
                      />
                    </button>
                  </PermissionWrapper>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Container */}
        <div className="flex justify-between items-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredStaff.length}
            itemsPerPage={itemsPerPage}
            colorTheme="orange"
          />
        </div>



        <AnimatePresence>
          {isAddStaffModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { setIsAddStaffModalOpen(false); setEditingStaffId(null); }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl relative overflow-hidden my-auto max-h-[92vh] flex flex-col z-10 border border-stone-200"
              >
                {/* Modal Header with Gradient */}
                <div
                  className="py-5 px-8 text-center text-white relative shrink-0 shadow-sm"
                  style={{
                    background: "linear-gradient(90deg, #882619 0%, #D4612D 100%)",
                  }}
                >
                  <h2 className="text-2xl font-serif font-medium tracking-wide text-white">
                    {editingStaffId ? "Edit Staff Profile" : "Add New Staff"}
                  </h2>
                  <p className="text-xs text-white/80 font-sans mt-0.5">
                    {editingStaffId ? "Update employee record" : "Employee Registration"}
                  </p>
                  <button
                    onClick={() => { setIsAddStaffModalOpen(false); setEditingStaffId(null); }}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors p-1"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleAddStaff} className="flex-1 flex flex-col overflow-hidden">
                  {/* Upper Section: Profile Picture & Primary Contact Info */}
                  <div className="bg-[#F4F1F0] p-6 border-b border-stone-200 shrink-0">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      {/* Left: Avatar Card */}
                      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center text-center w-full md:w-56 shrink-0">
                        <div className="relative group mb-2">
                          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-stone-200 shadow-inner flex items-center justify-center bg-stone-50">
                            {newStaffData.avatar ? (
                              <img
                                src={newStaffData.avatar}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="text-stone-300" size={44} />
                            )}
                            {isUploadingAvatar && (
                              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                <Clock className="animate-spin text-[#D4612D]" size={24} />
                              </div>
                            )}
                          </div>
                          <label
                            style={{ background: "linear-gradient(90deg, #882619 0%, #D4612D 100%)" }}
                            className="absolute bottom-0 right-0 w-8 h-8 rounded-full text-white flex items-center justify-center shadow-md cursor-pointer hover:opacity-90 transition-all active:scale-95"
                          >
                            <Upload size={14} />
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleStaffImageUpload}
                            />
                          </label>
                        </div>
                        <p className="text-xs font-bold text-stone-700">Profile Picture</p>
                        <p className="text-[9px] text-stone-400 font-medium mt-0.5">Recommended: Square PNG/JPG</p>
                      </div>

                      {/* Right: Full Name & Phone Numbers */}
                      <div className="flex-1 w-full space-y-4">
                        {/* Full Name */}
                        <div className="flex items-center gap-3">
                          <span className="w-28 text-xs font-bold text-[#882619] shrink-0">
                            * Full Name :
                          </span>
                          <input
                            type="text"
                            required
                            placeholder="Name"
                            value={newStaffData.name}
                            onChange={(e) =>
                              setNewStaffData({
                                ...newStaffData,
                                name: e.target.value,
                              })
                            }
                            style={{
                              background: "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #882619 0%, #D4612D 100%) border-box",
                              border: "1.5px solid transparent",
                              borderRadius: "14px",
                            }}
                            className="flex-1 px-4 py-2.5 text-xs font-medium text-stone-800 shadow-sm focus:outline-none transition-all placeholder:text-stone-300"
                          />
                        </div>

                        {/* Phone Numbers */}
                        <div className="flex items-center gap-3">
                          <span className="w-28 text-xs font-bold text-[#882619] shrink-0">
                            * Phone No. :
                          </span>
                          <div className="flex-1 flex gap-3">
                            <input
                              type="tel"
                              required
                              placeholder="1234567890"
                              value={newStaffData.phone2}
                              maxLength={10}
                              minLength={10}
                              onChange={(e) =>
                                setNewStaffData({
                                  ...newStaffData,
                                  phone2: e.target.value,
                                })
                              }
                              style={{
                                background: "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #882619 0%, #D4612D 100%) border-box",
                                border: "1.5px solid transparent",
                                borderRadius: "14px",
                              }}
                              className="w-1/2 px-4 py-2.5 text-xs font-medium text-stone-800 shadow-sm focus:outline-none transition-all placeholder:text-stone-300"
                            />
                            <input
                              type="tel"
                              placeholder="1234567890"
                              value={newStaffData.phone}
                              maxLength={10}
                              onChange={(e) =>
                                setNewStaffData({
                                  ...newStaffData,
                                  phone: e.target.value,
                                })
                              }
                              style={{
                                background: "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #882619 0%, #D4612D 100%) border-box",
                                border: "1.5px solid transparent",
                                borderRadius: "14px",
                              }}
                              className="w-1/2 px-4 py-2.5 text-xs font-medium text-stone-800 shadow-sm focus:outline-none transition-all placeholder:text-stone-300"
                            />
                          </div>
                        </div>

                        {/* Company selector for Super Admin */}
                        {currentRole === 'Super Admin' && (
                          <div className="flex items-center gap-3">
                            <span className="w-28 text-xs font-bold text-[#882619] shrink-0">
                              Company :
                            </span>
                            <div className="flex-1 relative" id="company-dropdown">
                              <select
                                value={newStaffData.companyId || ''}
                                onChange={(e) =>
                                  setNewStaffData({
                                    ...newStaffData,
                                    companyId: e.target.value,
                                    assignedCompanies: [e.target.value],
                                  })
                                }
                                style={{
                                  background: "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #882619 0%, #D4612D 100%) border-box",
                                  border: "1.5px solid transparent",
                                  borderRadius: "14px",
                                }}
                                className="w-full px-4 py-2.5 text-xs font-medium text-stone-800 focus:outline-none appearance-none"
                              >
                                <option value="">Select Company</option>
                                {companies.map((c) => (
                                  <option key={c._id} value={c._id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Main Form Fields Section */}
                  <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-5 bg-[#FAF8F7] no-scrollbar">
                    {/* Row 1: Position & Monthly Salary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      {/* Position */}
                      <div>
                        <div className="flex justify-end mb-1">
                          <button
                            type="button"
                            onClick={() => setIsAddingPosition(!isAddingPosition)}
                            className="text-[11px] font-bold text-[#D4612D] hover:underline"
                          >
                            + Add New
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="w-28 text-xs font-bold text-stone-700 shrink-0 text-right">
                            <span className="text-[#882619] mr-0.5">*</span> Position :
                          </span>
                          {isAddingPosition ? (
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={newPositionName}
                                onChange={(e) => setNewPositionName(e.target.value)}
                                placeholder="Position name"
                                style={{
                                  background: "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #882619 0%, #D4612D 100%) border-box",
                                  border: "1.5px solid transparent",
                                  borderRadius: "14px",
                                }}
                                className="flex-1 px-4 py-2.5 text-xs font-medium text-stone-800 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={handleAddPosition}
                                style={{ background: "linear-gradient(90deg, #882619 0%, #D4612D 100%)" }}
                                className="px-4 py-2 text-white rounded-[14px] text-xs font-bold"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div className="flex-1 relative">
                              <select
                                value={newStaffData.position}
                                onChange={(e) =>
                                  setNewStaffData({ ...newStaffData, position: e.target.value })
                                }
                                style={{
                                  background: "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #882619 0%, #D4612D 100%) border-box",
                                  border: "1.5px solid transparent",
                                  borderRadius: "14px",
                                }}
                                className="w-full px-4 py-2.5 text-xs font-medium text-stone-400 focus:text-stone-800 shadow-sm focus:outline-none appearance-none"
                              >
                                <option value="">Select Position</option>
                                {positions.map((p) => (
                                  <option key={p._id} value={p.name} className="text-stone-800 font-medium">
                                    {p.name}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#D4612D]">
                                <svg width="10" height="7" viewBox="0 0 10 7" fill="currentColor">
                                  <path d="M5 7L0 0H10L5 7Z" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Monthly Salary */}
                      <div className="flex items-center gap-3 pt-5">
                        <span className="w-28 text-xs font-bold text-stone-700 shrink-0 text-right">
                          <span className="text-[#882619] mr-0.5">*</span> Monthly Salary :
                        </span>
                        <input
                          type="number"
                          required
                          placeholder="₹ 0.00"
                          value={newStaffData.salary}
                          onChange={(e) =>
                            setNewStaffData({
                              ...newStaffData,
                              salary: e.target.value,
                            })
                          }
                          style={{
                            background: "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #882619 0%, #D4612D 100%) border-box",
                            border: "1.5px solid transparent",
                            borderRadius: "14px",
                          }}
                          className="flex-1 px-4 py-2.5 text-xs font-medium text-stone-800 shadow-sm focus:outline-none placeholder:text-stone-300"
                        />
                      </div>
                    </div>

                    {/* Row 2: Gender & DOB */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      {/* Gender */}
                      <div className="flex items-center gap-3">
                        <span className="w-28 text-xs font-bold text-stone-700 shrink-0 text-right">
                          <span className="text-[#882619] mr-0.5">*</span> Gender :
                        </span>
                        <div className="flex-1 relative">
                          <select
                            value={newStaffData.gender}
                            onChange={(e) =>
                              setNewStaffData({ ...newStaffData, gender: e.target.value })
                            }
                            style={{
                              background: "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #882619 0%, #D4612D 100%) border-box",
                              border: "1.5px solid transparent",
                              borderRadius: "14px",
                            }}
                            className="w-full px-4 py-2.5 text-xs font-medium text-stone-400 focus:text-stone-800 shadow-sm focus:outline-none appearance-none"
                          >
                            <option value="" disabled hidden>Select Gender</option>
                            <option value="Male" className="text-stone-800 font-medium">Male</option>
                            <option value="Female" className="text-stone-800 font-medium">Female</option>
                            <option value="Other" className="text-stone-800 font-medium">Other</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#D4612D]">
                            <svg width="10" height="7" viewBox="0 0 10 7" fill="currentColor">
                              <path d="M5 7L0 0H10L5 7Z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* DOB */}
                      <div className="flex items-center gap-3">
                        <span className="w-28 text-xs font-bold text-stone-700 shrink-0 text-right">
                          DOB :
                        </span>
                        <div className="flex-1 relative">
                          <input
                            type="date"
                            value={newStaffData.dob}
                            onChange={(e) =>
                              setNewStaffData({ ...newStaffData, dob: e.target.value })
                            }
                            style={{
                              background: "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #882619 0%, #D4612D 100%) border-box",
                              border: "1.5px solid transparent",
                              borderRadius: "14px",
                            }}
                            className="w-full pl-9 pr-4 py-2.5 text-xs font-medium text-stone-800 shadow-sm focus:outline-none uppercase placeholder:text-stone-300"
                            placeholder="DD-MM-YYYY"
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4612D] pointer-events-none">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Cast & City */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      {/* Cast */}
                      <div className="flex items-center gap-3">
                        <span className="w-28 text-xs font-bold text-stone-700 shrink-0 text-right">
                          Cast :
                        </span>
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            placeholder="Select Position"
                            value={newStaffData.cast}
                            onChange={(e) =>
                              setNewStaffData({ ...newStaffData, cast: e.target.value })
                            }
                            style={{
                              background: "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #882619 0%, #D4612D 100%) border-box",
                              border: "1.5px solid transparent",
                              borderRadius: "14px",
                            }}
                            className="w-full px-4 py-2.5 text-xs font-medium text-stone-800 shadow-sm focus:outline-none placeholder:text-stone-300"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#D4612D]">
                            <svg width="10" height="7" viewBox="0 0 10 7" fill="currentColor">
                              <path d="M5 7L0 0H10L5 7Z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* City */}
                      <div className="flex items-center gap-3">
                        <span className="w-28 text-xs font-bold text-stone-700 shrink-0 text-right">
                          <span className="text-[#882619] mr-0.5">*</span> City :
                        </span>
                        <input
                          type="text"
                          placeholder="City"
                          value={newStaffData.city}
                          onChange={(e) =>
                            setNewStaffData({ ...newStaffData, city: e.target.value })
                          }
                          style={{
                            background: "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #882619 0%, #D4612D 100%) border-box",
                            border: "1.5px solid transparent",
                            borderRadius: "14px",
                          }}
                          className="flex-1 px-4 py-2.5 text-xs font-medium text-stone-800 shadow-sm focus:outline-none placeholder:text-stone-300"
                        />
                      </div>
                    </div>

                    {/* Row 4: Full Address */}
                    <div className="flex items-center gap-3">
                      <span className="w-28 text-xs font-bold text-stone-700 shrink-0 text-right">
                        <span className="text-[#882619] mr-0.5">*</span> Full Add. :
                      </span>
                      <input
                        type="text"
                        placeholder="Full permanent address"
                        value={newStaffData.address}
                        onChange={(e) =>
                          setNewStaffData({ ...newStaffData, address: e.target.value })
                        }
                        style={{
                          background: "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #882619 0%, #D4612D 100%) border-box",
                          border: "1.5px solid transparent",
                          borderRadius: "14px",
                        }}
                        className="flex-1 px-4 py-2.5 text-xs font-medium text-stone-800 shadow-sm focus:outline-none placeholder:text-stone-300"
                      />
                    </div>

                    <hr className="border-stone-300 my-4" />

                    {/* Row 5: Date of Joining & Date of Leave */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      {/* Date of Joining */}
                      <div className="flex items-center gap-3">
                        <span className=" text-xs font-bold text-stone-700 shrink-0 text-right">
                          <span className="text-[#882619] mr-0.5">*</span> Date of joining :
                        </span>
                        <div className="flex-1 relative">
                          <input
                            type="date"
                            required
                            value={newStaffData.dateOfJoining}
                            onChange={(e) =>
                              setNewStaffData({
                                ...newStaffData,
                                dateOfJoining: e.target.value,
                              })
                            }
                            style={{
                              background: "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #882619 0%, #D4612D 100%) border-box",
                              border: "1.5px solid transparent",
                              borderRadius: "14px",
                            }}
                            className="w-full pl-9 pr-4 py-2.5 text-xs font-medium text-stone-800 shadow-sm focus:outline-none uppercase"
                            placeholder="DD-MM-YYYY"
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4612D] pointer-events-none">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Date of Leave */}
                      <div className="flex items-center gap-3">
                        <span className="w-28 text-xs font-bold text-stone-700 shrink-0 text-right">
                          Date of Leave :
                        </span>
                        <div className="flex-1 relative">
                          <input
                            type="date"
                            value={newStaffData.dateOfLeave}
                            onChange={(e) =>
                              setNewStaffData({
                                ...newStaffData,
                                dateOfLeave: e.target.value,
                              })
                            }
                            style={{
                              background: "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #882619 0%, #D4612D 100%) border-box",
                              border: "1.5px solid transparent",
                              borderRadius: "14px",
                            }}
                            className="w-full pl-9 pr-4 py-2.5 text-xs font-medium text-stone-800 shadow-sm focus:outline-none uppercase"
                            placeholder="DD-MM-YYYY"
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4612D] pointer-events-none">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="border-stone-300 my-4" />

                    {/* Row 6: Aadhar Number & Aadhar Card Photo Upload */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      {/* Aadhar Number */}
                      <div className="flex items-center gap-3">
                        <span className=" text-xs font-bold text-stone-700 shrink-0 text-right">
                          Aadhar Number :
                        </span>
                        <input
                          type="text"
                          maxLength={12}
                          placeholder="12 Dijit No."
                          value={newStaffData.aadharNo}
                          onChange={(e) =>
                            setNewStaffData({ ...newStaffData, aadharNo: e.target.value })
                          }
                          style={{
                            background: "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #882619 0%, #D4612D 100%) border-box",
                            border: "1.5px solid transparent",
                            borderRadius: "14px",
                          }}
                          className="flex-1 px-4 py-2.5 text-xs font-medium text-stone-800 shadow-sm focus:outline-none placeholder:text-stone-300"
                        />
                      </div>

                      {/* Aadhar Card Photo Upload Box */}
                      <div className="flex items-center gap-3">
                        <span className="w-28 text-xs font-bold text-stone-700 shrink-0 text-right">
                          Aadhar Card Photo :
                        </span>
                        <label
                          style={{
                            border: "1.5px dashed #882619",
                            borderRadius: "16px",
                          }}
                          className="flex-1 bg-[#FAF7F6] p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-inner hover:bg-stone-50"
                        >
                          <div className="bg-white border border-stone-200 rounded-xl px-3 py-1 flex flex-col items-center shadow-sm mb-1.5">
                            <img src="/icons/action/ImageGray.svg" className="w-5 h-5 opacity-70" alt="Upload" />
                            <span className="text-[9px] text-stone-400 font-medium">click to browse</span>
                          </div>
                          <p className="text-[10px] text-stone-700 font-medium">
                            {newStaffData.aadharPhoto ? "Change file to upload" : "Drag and drop font file to upload"}
                          </p>
                          <p className="text-[8px] text-stone-400 mt-0.5">Supports PNG, JPG, PDF, WEBP etc.. up to any size</p>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*,.pdf"
                            onChange={handleAadharUpload}
                            disabled={isUploadingAadhar}
                          />
                        </label>
                      </div>
                    </div>

                    <hr className="border-stone-300 my-4" />

                    {/* Row 7: Narration (Full Width) */}
                    <div className="flex items-center gap-3">
                      <span className="w-28 text-xs font-bold text-stone-700 shrink-0 text-right">
                        Narration :
                      </span>
                      <input
                        type="text"
                        placeholder=""
                        value={newStaffData.narration}
                        onChange={(e) =>
                          setNewStaffData({ ...newStaffData, narration: e.target.value })
                        }
                        style={{
                          background: "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #882619 0%, #D4612D 100%) border-box",
                          border: "1.5px solid transparent",
                          borderRadius: "14px",
                        }}
                        className="flex-1 px-4 py-2.5 text-xs font-medium text-stone-800 shadow-sm focus:outline-none"
                      />
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="flex items-center justify-end gap-6 pt-6 pb-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddStaffModalOpen(false);
                          setEditingStaffId(null);
                        }}
                        className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>

                      <PermissionWrapper action={editingStaffId ? "edit" : "write"}>
                        <button
                          type="submit"
                          style={{
                            background: "linear-gradient(90deg, #882619 0%, #D4612D 100%)",
                            borderRadius: "14px",
                          }}
                          className="px-8 py-3 text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                        >
                          Save Staff Profile
                        </button>
                      </PermissionWrapper>
                    </div>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Give Advance Modal */}
        <AnimatePresence>
          {isAdvanceModalOpen && selectedStaff && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAdvanceModalOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-card w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
              >
                {/* Form Side */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto no-scrollbar">
                  <header className="mb-8 flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">
                        {advanceData.advanceType === 'GIVE' ? 'Give Advance' : 'Back Advance'}
                      </h2>
                      <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-1">
                        To: {selectedStaff.name}
                      </p>
                    </div>

                    {/* Transaction Type Toggle */}
                    <div className="flex bg-muted p-1 rounded-xl border border-border">
                      <button
                        type="button"
                        onClick={() => setAdvanceData({ ...advanceData, advanceType: 'GIVE' })}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${advanceData.advanceType === 'GIVE'
                          ? 'bg-orange-600 text-white shadow-lg shadow-orange-100'
                          : 'text-muted-foreground hover:text-foreground'
                          }`}
                      >
                        Give
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdvanceData({ ...advanceData, advanceType: 'BACK' })}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${advanceData.advanceType === 'BACK'
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                          : 'text-muted-foreground hover:text-foreground'
                          }`}
                      >
                        Back
                      </button>
                    </div>

                  </header>

                  <form onSubmit={handleGiveAdvance} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                          Date
                        </label>
                        <div className="relative">
                          <Calendar
                            className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${advanceData.advanceType === 'GIVE' ? 'text-orange-500' : 'text-emerald-500'}`}
                            size={18}
                          />
                          <input
                            type="date"
                            required
                            value={advanceData.date}
                            onChange={(e) =>
                              setAdvanceData({
                                ...advanceData,
                                date: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-5 py-4 bg-muted border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm text-black"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                          Amount
                        </label>
                        <div className="relative">
                          <IndianRupee
                            className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${advanceData.advanceType === 'GIVE' ? 'text-orange-500' : 'text-emerald-500'}`}
                            size={18}
                          />
                          <input
                            type="number"
                            required
                            value={advanceData.amount}
                            onChange={(e) =>
                              setAdvanceData({
                                ...advanceData,
                                amount: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-5 py-4 bg-muted border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm text-black placeholder:opacity-30"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                        Reason
                      </label>
                      <div className="relative">
                        <FileText
                          className={`absolute left-5 top-5 transition-colors ${advanceData.advanceType === 'GIVE' ? 'text-orange-500' : 'text-emerald-500'}`}
                          size={18}
                        />
                        <textarea
                          required
                          value={advanceData.reason}
                          onChange={(e) =>
                            setAdvanceData({
                              ...advanceData,
                              reason: e.target.value,
                            })
                          }
                          className="w-full pl-12 pr-5 py-4 bg-muted border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none h-24 resize-none font-bold text-sm text-black"
                          placeholder={advanceData.advanceType === 'GIVE' ? "Reason for advance..." : "Reason for repayment..."}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                          {advanceData.advanceType === 'GIVE' ? 'Paid By' : 'Received By'}
                        </label>
                        <div className="relative">
                          <User
                            className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${advanceData.advanceType === 'GIVE' ? 'text-orange-500' : 'text-emerald-500'}`}
                            size={18}
                          />
                          <input
                            type="text"
                            required
                            value={advanceData.paidBy}
                            onChange={(e) =>
                              setAdvanceData({
                                ...advanceData,
                                paidBy: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-5 py-4 bg-muted border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm text-black"
                            placeholder="Admin name"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                          Payment Type
                        </label>
                        <div className="relative">
                          <CreditCard
                            className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${advanceData.advanceType === 'GIVE' ? 'text-orange-500' : 'text-emerald-500'}`}
                            size={18}
                          />
                          <select
                            value={advanceData.paymentType}
                            onChange={(e) =>
                              setAdvanceData({
                                ...advanceData,
                                paymentType: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-5 py-4 bg-muted border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all font-bold text-sm text-black"
                          >
                            {paymentModes.map(mode => (
                              <option key={mode._id} value={mode.name}>{mode.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                        Advance History
                      </label>
                      <div className="bg-muted rounded-2xl border border-border overflow-hidden max-h-[200px] overflow-y-auto no-scrollbar">
                        {selectedStaff.fullAdvances?.length === 0 ? (
                          <div className="p-4 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No previous advances</div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {selectedStaff.fullAdvances?.map((adv) => (
                              <div key={adv._id || adv.id} className="p-3 flex justify-between items-center text-xs">
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-foreground">₹{formatIndianNumber(adv.amount)}</span>
                                    <span
                                      className={`text-[7px] font-black uppercase tracking-widest px-1 rounded transition-all hover:scale-110 active:scale-95 ${(adv.advanceType === 'BACK' || adv.type === 'BACK') ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
                                    >
                                      {adv.advanceType || adv.type || 'GIVE'}
                                    </span>
                                  </div>
                                  <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">{new Date(adv.date).toLocaleDateString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <PermissionWrapper action="write">
                      <button
                        type="submit"
                        className={`w-full py-5 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all ${advanceData.advanceType === 'GIVE'
                          ? 'bg-orange-600 shadow-orange-100 hover:bg-orange-700'
                          : 'bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700'
                          }`}
                      >
                        {advanceData.advanceType === 'GIVE' ? 'Give Advance Salary' : 'Record Repayment'}
                      </button>
                    </PermissionWrapper>
                  </form>
                </div>

                {/* Summary Side - Dark Theme */}
                <div className="w-full md:w-80 bg-[#1e1916] p-8 md:p-12 text-white flex flex-col justify-center relative shrink-0">
                  <button
                    onClick={() => setIsAdvanceModalOpen(false)}
                    className="absolute top-10 right-10 text-white/30 hover:text-white transition-colors z-50"
                  >
                    <X size={24} />
                  </button>

                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600 opacity-10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-4">
                      {advanceData.advanceType === 'GIVE' ? 'New Advance' : 'Repayment Amount'}
                    </p>
                    <h3 className={`text-5xl font-black tracking-tighter text-white tabular-nums mb-8 transition-colors ${!advanceData.amount ? 'text-white/40' : (advanceData.advanceType === 'GIVE' ? 'text-orange-400' : 'text-emerald-400')}`}>
                      ₹{formatIndianNumber(Number(advanceData.amount || 0))}
                    </h3>

                    <div className="space-y-4 pt-8 border-t border-white/10">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                          Current Due
                        </span>
                        <span className="font-bold">
                          ₹{formatIndianNumber(selectedStaff.advanceRemaining)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                          New Total
                        </span>
                        <span className={`font-bold transition-colors ${!advanceData.amount ? 'text-white/40' : (advanceData.advanceType === 'GIVE' ? 'text-orange-400' : 'text-emerald-400')}`}>
                          ₹
                          {formatIndianNumber(
                            advanceData.advanceType === 'GIVE'
                              ? (selectedStaff.advanceRemaining + Number(advanceData.amount || 0))
                              : (selectedStaff.advanceRemaining - Number(advanceData.amount || 0))
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-white/10">
                        <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                          Standard Salary
                        </span>
                        <span className="font-bold">
                          ₹{formatIndianNumber(selectedStaff.effectiveSalary || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* History Modal */}
        <AnimatePresence>
          {isHistoryModalOpen && selectedStaff && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsHistoryModalOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-card w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="relative overflow-y-auto no-scrollbar">
                  <div className="p-8 md:p-10">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex gap-8 items-start">
                        {selectedStaff.avatar ? (
                          <div className="w-36 h-40 rounded-3xl overflow-hidden border-4 border-orange-100 shadow-xl shadow-orange-100/50">
                            <img src={selectedStaff.avatar} alt={selectedStaff.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-36 h-40 rounded-3xl bg-primary/10 border-4 border-orange-100 flex items-center justify-center shadow-xl shadow-orange-100/50">
                            <User size={48} className="text-orange-200" />
                          </div>
                        )}

                        <div className="space-y-4">
                          <div>
                            <h2 className="text-4xl font-black text-primary font-black tracking-tight">{selectedStaff.name}</h2>
                            <p className="text-sm font-bold text-muted-foreground mt-1">Position : <span className="text-muted-foreground">{selectedStaff.position}</span></p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-3 text-muted-foreground font-bold text-xs">
                              <Phone size={14} className="text-muted-foreground" />
                              <span>{selectedStaff.phone} {selectedStaff.phone2 ? `/ ${selectedStaff.phone2}` : ''}</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground font-bold text-xs">
                              <Mail size={14} className="text-muted-foreground" />
                              <span>{selectedStaff.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground font-bold text-xs leading-relaxed max-w-sm">
                              <MapPin size={14} className="shrink-0" />
                              <span>{selectedStaff.address || 'N/A'}</span>
                            </div>
                          </div>

                          {selectedStaff.aadharPhoto && (
                            <div className="pt-2">
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Aadhaar :
                                <button onClick={() => setPreviewImage(selectedStaff.aadharPhoto)} className="ml-2 text-blue-600 hover:underline">
                                  aadhar_{selectedStaff.name.split(' ')[0].toLowerCase()}.pdf
                                </button>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <button onClick={() => setIsHistoryModalOpen(false)} className="bg-muted p-3 rounded-2xl text-muted-foreground hover:bg-muted transition-all active:scale-95">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-y-6 gap-x-12 pt-8 border-t border-border mb-10">
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Cast : <span className="text-foreground">{selectedStaff.cast || '-'}</span></p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">City : <span className="text-foreground">{selectedStaff.city || '-'}</span></p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Joining Dt. : <span className="text-foreground">{selectedStaff.dateOfJoining ? new Date(selectedStaff.dateOfJoining).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '-'}</span></p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Status : <span className="text-red-500">{selectedStaff.status}</span></p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Leave Dt. : <span className="text-foreground">{selectedStaff.dateOfLeave || '-'}</span></p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 truncate">Note : <span className="text-foreground">{selectedStaff.narration || '-'}</span></p>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-[2.5rem] p-10 border border-border">
                      {(() => {
                        const filteredAdvances = selectedStaff.fullAdvances?.filter((a) => {
                          if (!a.date) return false;
                          const dateStr = typeof a.date === 'string' ? a.date : new Date(a.date).toISOString();
                          return dateStr.startsWith(historyFilterDate);
                        }) || [];
                        const monthAdvanceTotal = filteredAdvances.reduce((sum, adv) => {
                          const amt = Number(adv.amount || 0);
                          const isBack = adv.advanceType === 'BACK' || adv.type === 'BACK';
                          return isBack ? sum - amt : sum + amt;
                        }, 0);

                        const att = modalMonthlyAttendance.filter(a => (a.userId?._id || a.userId) === selectedStaff.id);
                        const p = att.filter(a => a.status === 'Present').length;
                        const h = att.filter(a => a.status === 'Half Day').length;
                        const a = att.filter(a => a.status === 'Absent').length;
                        const pl = att.filter(a => a.status === 'Paid Leave').length;
                        const [year, month] = historyFilterDate.split('-').map(Number);
                        const daysInMonth = new Date(year, month, 0).getDate();
                        const ns = daysInMonth - att.length;
                        const netP = p + (h * 0.5) + pl;

                        const monthSalaryRecord = Array.isArray(selectedStaff.salary)
                          ? selectedStaff.salary.find(sal => sal.month === historyFilterDate)
                          : null;

                        const currentMonthSalary = monthSalaryRecord
                          ? monthSalaryRecord.amount
                          : (Array.isArray(selectedStaff.salary) && selectedStaff.salary.length > 0 ? selectedStaff.salary[selectedStaff.salary.length - 1].amount : 0);

                        const earnedSalary = Math.round((currentMonthSalary / daysInMonth) * netP);

                        const allTimeRemaining = selectedStaff.fullAdvances?.reduce((sum, a) => {
                          const amt = Number(a.amount || 0);
                          const isBack = a.advanceType === "BACK" || a.type === "BACK";
                          if (isBack) return sum - amt;
                          if (a.status !== "Paid") return sum + amt;
                          return sum;
                        }, 0) || 0;

                        return (
                          <>
                            {/* 1. Statistics & Month Navigation */}
                            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 pb-10 border-b border-border">
                              <div className="flex flex-wrap gap-12">
                                <div className="space-y-1">
                                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Monthly Salary</p>
                                  <p className="text-3xl font-black text-foreground">₹{formatIndianNumber(earnedSalary)}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Monthly Advance</p>
                                  <p className="text-3xl font-black text-foreground">₹{formatIndianNumber(monthAdvanceTotal)}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">Net Payable</p>
                                  <p className="text-3xl font-black text-primary">₹{formatIndianNumber(earnedSalary - monthAdvanceTotal)}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 bg-muted p-1.5 rounded-2xl w-full xl:w-auto">
                                <button onClick={() => handleMonthChange(-1)} className="p-3 bg-card rounded-xl text-muted-foreground hover:text-primary transition-all active:scale-95 shadow-sm">
                                  <ChevronLeft size={18} />
                                </button>
                                <div className="relative flex-1 xl:w-48">
                                  <input type="month" value={historyFilterDate} onChange={(e) => setHistoryFilterDate(e.target.value)} className="w-full pl-4 pr-10 py-3 bg-transparent text-xs font-black uppercase tracking-widest outline-none" />
                                </div>
                                <button onClick={() => handleMonthChange(1)} className="p-3 bg-card rounded-xl text-muted-foreground hover:text-primary transition-all active:scale-95 shadow-sm">
                                  <ChevronRight size={18} />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4 mt-8">
                              {[
                                { label: 'Present', val: p, color: 'bg-emerald-500', bg: 'bg-emerald-50' },
                                { label: 'Half Day', val: h, color: 'bg-orange-500', bg: 'bg-orange-50' },
                                { label: 'Absent', val: a, color: 'bg-red-500', bg: 'bg-red-50' },
                                { label: 'Paid Leave', val: pl, color: 'bg-blue-500', bg: 'bg-blue-50' },
                                { label: 'Not Set', val: ns, color: 'bg-slate-500', bg: 'bg-slate-50' }
                              ].map((item, i) => (
                                <div key={i} className={`${item.bg} p-5 rounded-[2rem] border border-border/40 flex flex-col items-center justify-center text-center transition-all hover:shadow-md`}>
                                  <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${item.color.replace('bg-', 'text-')}`}>{item.label}</span>
                                  <span className="text-2xl font-black text-slate-800">{item.val}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center justify-end">
                              <p className="text-sm font-bold text-muted-foreground">
                                Net Salary :
                                <span className="text-2xl font-black text-foreground ml-2">
                                  ₹{formatIndianNumber(earnedSalary - monthAdvanceTotal)}
                                </span>
                              </p>
                            </div>
                            <div className="border-t border-border pt-8 mt-8">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                                <div className="space-y-1">
                                  <h3 className="text-xl font-black text-foreground">Salary Payment Ledger</h3>
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">History of monthly compensation</p>
                                </div>
                                <PermissionWrapper action="write">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const form = document.getElementById('salary-history-form');
                                      if (form) form.classList.toggle('hidden');
                                    }}
                                    className="px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all"
                                  >
                                    <Plus size={14} /> Add Monthly Record
                                  </button>
                                </PermissionWrapper>
                              </div>

                              <div id="salary-history-form" className="hidden mb-8 p-6 bg-card rounded-3xl border border-border space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Month</label>
                                    <input
                                      type="month"
                                      value={salaryEntryData.month}
                                      onChange={(e) => setSalaryEntryData({ ...salaryEntryData, month: e.target.value })}
                                      className="w-full px-4 py-3 bg-muted rounded-xl text-xs font-bold outline-none"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Amount</label>
                                    <input
                                      type="number"
                                      value={salaryEntryData.amount}
                                      onChange={(e) => setSalaryEntryData({ ...salaryEntryData, amount: e.target.value })}
                                      placeholder="Enter amount"
                                      className="w-full px-4 py-3 bg-muted rounded-xl text-xs font-bold outline-none"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Status</label>
                                    <select
                                      value={salaryEntryData.status}
                                      onChange={(e) => setSalaryEntryData({ ...salaryEntryData, status: e.target.value })}
                                      className="w-full px-4 py-3 bg-muted rounded-xl text-xs font-bold outline-none appearance-none"
                                    >
                                      <option value="Paid">Paid</option>
                                      <option value="Pending">Pending</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Payment Date</label>
                                    <input
                                      type="date"
                                      value={salaryEntryData.paymentDate}
                                      onChange={(e) => setSalaryEntryData({ ...salaryEntryData, paymentDate: e.target.value })}
                                      className="w-full px-4 py-3 bg-muted rounded-xl text-xs font-bold outline-none"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Remarks</label>
                                    <input
                                      type="text"
                                      value={salaryEntryData.remarks}
                                      onChange={(e) => setSalaryEntryData({ ...salaryEntryData, remarks: e.target.value })}
                                      placeholder="Optional notes"
                                      className="w-full px-4 py-3 bg-muted rounded-xl text-xs font-bold outline-none"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                  <button
                                    type="button"
                                    onClick={handleSaveSalaryHistory}
                                    className="px-8 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
                                  >
                                    Save Record
                                  </button>
                                </div>
                              </div>

                              {/* Timeline Strip */}
                              {Array.isArray(selectedStaff.salary) && selectedStaff.salary.length > 0 && (
                                <div className="space-y-4">
                                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Quick Timeline View</h3>
                                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                    {[...selectedStaff.salary].sort((a, b) => b.month.localeCompare(a.month)).map((sal, idx) => (
                                      <div key={`strip-${idx}`} className="shrink-0 bg-muted/40 p-4 rounded-2xl border border-border text-center min-w-[120px]">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">{new Date(sal.month + "-01").toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })}</p>
                                        <p className="text-xs font-black text-foreground">₹{formatIndianNumber(sal.amount)}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Detailed Records List */}
                              <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Detailed History</h3>
                                {!selectedStaff.salary || selectedStaff.salary.length === 0 ? (
                                  <div className="py-20 text-center bg-muted/20 rounded-[3rem] border border-dashed border-border">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No entries found</p>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 gap-4">
                                    {selectedStaff.salary.map((sal, idx) => (
                                      <div key={sal._id || sal.id || idx} className="bg-card p-6 rounded-[2.5rem] border border-border flex flex-col md:flex-row items-center gap-6 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group">
                                        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 ${sal.status === 'Paid' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white shadow-lg shadow-red-100'}`}>
                                          <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-black uppercase leading-none mb-1">{new Date(sal.month + "-01").toLocaleDateString('en-GB', { month: 'short' })}</span>
                                            <IndianRupee size={20} />
                                          </div>
                                        </div>

                                        <div className="flex-1 w-full text-center md:text-left">
                                          <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                                            <p className="text-xl font-black text-foreground">₹ {formatIndianNumber(sal.amount)}</p>
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${sal.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>{sal.status}</span>
                                          </div>
                                          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><Calendar size={12} className="text-primary" /> {new Date(sal.month + "-01").toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 hidden md:block" />
                                            <span>Paid on: <span className="text-foreground">{sal.paymentDate ? new Date(sal.paymentDate).toLocaleDateString('en-GB') : 'N/A'}</span></span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-6 w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-border">
                                          <div className="flex-1 md:text-right">
                                            <p className="text-[10px] font-bold text-muted-foreground line-clamp-1 max-w-[200px]">{sal.remarks || '-'}</p>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => {
                                                setSalaryEntryData({
                                                  month: sal.month, amount: sal.amount, status: sal.status,
                                                  paymentDate: sal.paymentDate ? new Date(sal.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                                                  remarks: sal.remarks || ""
                                                });
                                                const form = document.getElementById('salary-history-form');
                                                if (form) form.classList.remove('hidden');
                                                form.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                              }}
                                              className="p-3.5 bg-muted hover:bg-primary/10 hover:text-primary rounded-2xl transition-all"
                                            >
                                              <Edit2 size={16} />
                                            </button>
                                            <button
                                              onClick={async () => {
                                                if (!confirm("Delete this record?")) return;
                                                const updatedSalary = selectedStaff.salary.filter((_, i) => i !== idx);
                                                const res = await fetch(`/api/staff/${selectedStaff.id}`, {
                                                  method: "PUT", headers: { "Content-Type": "application/json" },
                                                  body: JSON.stringify({ salary: updatedSalary }),
                                                });
                                                if (res.ok) { showToast("Deleted", "success"); fetchData(); }
                                              }}
                                              className="p-3.5 bg-muted hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>



                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Avatar Preview Modal */}
        <AnimatePresence>
          {previewImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewImage(null)}
              className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md p-4 md:p-10 flex items-center justify-center cursor-zoom-out"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-4xl max-h-full bg-card rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                <button
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-6 right-6 z-10 p-3 bg-card/20 backdrop-blur-xl text-white hover:bg-card/30 rounded-2xl transition-all active:scale-95"
                >
                  <X size={24} strokeWidth={3} />
                </button>
                <img
                  src={previewImage}
                  alt="Staff Preview"
                  className="max-w-full max-h-[80vh] object-contain select-none shadow-inner"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <MasterDataManager
          isOpen={isMasterModalOpen}
          onClose={() => setIsMasterModalOpen(false)}
          onRefresh={fetchData}
          allowedTabs={['roles', 'positions']}
        />
      </div>
    </main>
  );
}
