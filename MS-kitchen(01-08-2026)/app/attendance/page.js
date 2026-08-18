"use client";
import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useFormStore } from "@/lib/store";
import {
  Calendar,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Search,
  ChevronDown,
  ArrowDown,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CompanyFilter from "../../components/CompanyFilter";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addStandardHeader } from "@/lib/pdfGenerator";
import * as XLSX from "xlsx";
import { ShieldAlert } from "lucide-react";
import usePermissions from "@/hooks/usePermissions";
import PermissionWrapper from "@/components/PermissionWrapper";
import TableColumnFilter from "../../components/TableColumnFilter";
import Pagination from "../../components/Pagination";
import { useCompany } from "@/context/CompanyContext";
import DateTimePicker from "@/components/DateTimePicker";

function AttendancePageContent() {
  const searchParams = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [staffList, setStaffList] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDailyExportOpen, setIsDailyExportOpen] = useState(false);
  const [isMonthlyExportOpen, setIsMonthlyExportOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [colFilters, setColFilters] = useState({
    name: [],
    position: [],
    attendanceStatus: [],
    staffStatus: [],
  });
  const [activeFilterCol, setActiveFilterCol] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { forms, setFormData } = useFormStore();
  const [isHydrated, setIsHydrated] = useState(false);

  const {
    permissions,
    loading: permsLoading,
    hasPermission,
  } = usePermissions();
  const { isReadOnly, companyName, companyAddress, companyPhone } = useCompany();

  const dateKey = selectedDate.toISOString().split("T")[0];

  useEffect(() => {
    fetchData();
  }, [searchParams, dateKey]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const companyId = searchParams.get("companyId");
      const query = companyId ? `?companyId=${companyId}` : "";
      const attendanceQuery = companyId
        ? `?date=${dateKey}&companyId=${companyId}`
        : `?date=${dateKey}`;

      const [staffRes, attendanceRes] = await Promise.all([
        fetch(`/api/staff${query}`),
        fetch(`/api/attendance${attendanceQuery}`),
      ]);

      if (staffRes.ok) {
        const staffData = await staffRes.json();
        const noLoginStaff = staffData.filter(s => s.noLogin === true);
        setStaffList(noLoginStaff);
      }

      if (attendanceRes.ok) {
        const attData = await attendanceRes.json();
        const mappedAtt = {};
        attData.forEach((record) => {
          mappedAtt[record.userId._id || record.userId] = {
            status: record.status,
            workingHours: record.workingHours,
            overtime: record.overtime,
          };
        });
        setAttendanceData(mappedAtt);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = async (staffId, field, value) => {
    const updatedDayData = {
      ...(attendanceData[staffId] || {
        status: "Not Set",
        workingHours: 9,
        overtime: 0,
      }),
      [field]: value,
    };

    setAttendanceData((prev) => ({
      ...prev,
      [staffId]: updatedDayData,
    }));

    try {
      const companyId = searchParams.get("companyId");
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateKey,
          companyId: companyId,
          records: [{ userId: staffId, ...updatedDayData }],
        }),
      });
    } catch (error) {
      console.error("Error saving attendance:", error);
    }
  };

  const getStaffAttendance = (staffId) =>
    attendanceData[staffId] || {
      status: "Not Set",
      workingHours: 9,
      overtime: 0,
    };

  const stats = useMemo(() => {
    let present = 0,
      absent = 0,
      halfday = 0,
      paidLeave = 0,
      notSet = 0,
      totalHours = 0,
      totalOvertime = 0;
    staffList.forEach((staff) => {
      const data = attendanceData[staff._id];
      if (data?.status !== "Absent" && data?.status !== "Not Set" && data?.status !== "Paid Leave") {
        totalHours += Number(data?.workingHours || 0);
        totalOvertime += Number(data?.overtime || 0);
      }
      if (!data || data.status === "Not Set") notSet++;
      else if (data.status === "Present") present++;
      else if (data.status === "Half Day") halfday++;
      else if (data.status === "Absent") absent++;
      else if (data.status === "Paid Leave") paidLeave++;
    });
    return { present, absent, halfday, paidLeave, notSet, totalHours, totalOvertime };
  }, [attendanceData, staffList]);

  const updateDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const toggleColFilter = (colKey) => {
    setActiveFilterCol(activeFilterCol === colKey ? null : colKey);
  };

  const handleColFilterChange = (colKey, value) => {
    setColFilters((prev) => {
      if (value === "") return { ...prev, [colKey]: [] };
      const current = prev[colKey] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [colKey]: updated };
    });
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest('[data-col-filter-root="true"]')) {
        setActiveFilterCol(null);
      }
      if (!event.target.closest('[data-export-root="true"]')) {
        setIsDailyExportOpen(false);
        setIsMonthlyExportOpen(false);
      }
      if (!event.target.closest('[data-month-picker-root="true"]')) {
        setIsMonthPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const persistedData = forms["attendance"];
    if (persistedData) {
      if (persistedData.selectedDate)
        setSelectedDate(new Date(persistedData.selectedDate));
      if (persistedData.searchTerm) setSearchTerm(persistedData.searchTerm);
      if (persistedData.colFilters) setColFilters(persistedData.colFilters);
      if (persistedData.currentPage) setCurrentPage(persistedData.currentPage);
      if (persistedData.itemsPerPage)
        setItemsPerPage(persistedData.itemsPerPage);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      setFormData("attendance", {
        selectedDate: selectedDate.toISOString(),
        searchTerm,
        colFilters,
        currentPage,
        itemsPerPage,
      });
    }
  }, [
    selectedDate,
    searchTerm,
    colFilters,
    currentPage,
    itemsPerPage,
    isHydrated,
  ]);

  const uniqueNames = useMemo(
    () => [...new Set(staffList.map((s) => s.name).filter(Boolean))].sort(),
    [staffList],
  );
  const uniquePositions = useMemo(
    () => [...new Set(staffList.map((s) => s.position).filter(Boolean))].sort(),
    [staffList],
  );
  const uniqueAttendanceStatuses = [
    "Present",
    "Half Day",
    "Absent",
    "Paid Leave",
    "Not Set",
  ];
  const uniqueStaffStatuses = ["Active", "Inactive"];

  const filteredStaff = staffList.filter((s) => {
    const checkTerm = (obj, term) => {
      if (!obj) return false;
      if (typeof obj === "object")
        return Object.values(obj).some((val) => checkTerm(val, term));
      return String(obj).toLowerCase().includes(term);
    };
    const matchesSearch = !searchTerm || checkTerm(s, searchTerm.toLowerCase());

    const colMatch = (key, val) =>
      !colFilters[key]?.length || colFilters[key].includes(val);

    const data = getStaffAttendance(s._id);
    const matchesColFilters =
      colMatch("name", s.name) &&
      colMatch("position", s.position) &&
      colMatch("attendanceStatus", data.status) &&
      colMatch("staffStatus", s.status || "Active");

    return matchesSearch && matchesColFilters;
  });

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportDailyReport = async () => {
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();

      const dateStr = selectedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      doc.setFillColor(248, 248, 248);
      doc.rect(0, 0, pageWidth, 36, "F");

      doc.setFillColor(242, 102, 34);
      doc.rect(0, 35, pageWidth, 1.5, "F");

      doc.setFillColor(150, 150, 150);
      doc.rect(145, 35, pageWidth - 145, 1.5, "F");

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.35);
      doc.line(22, 4, 22, 31);
      doc.line(82, 4, 82, 31);
      doc.line(168, 4, 168, 31);

      const getLogoBase64 = () => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = "/pdflogo.png";
          img.crossOrigin = "Anonymous";
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext("2d").drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          };
          img.onerror = () => resolve(null);
        });
      };

      const logoData = await getLogoBase64();
      if (logoData) {
        doc.addImage(logoData, "PNG", 3, 6, 17, 22);
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text(companyName || "MS KITCHEN", 25, 11);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text(companyAddress || "", 25, 16);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(184, 92, 56);
      doc.text("DAILY ATTENDANCE", 86, 15);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`DATE : ${dateStr.toUpperCase()}`, 86, 22);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(184, 92, 56);
      doc.text("SUMMARY", 172, 11);

      const summaryStats = [
        { label: "PRESENT", val: stats.present, color: [46, 125, 50] },
        { label: "HALF DAY", val: stats.halfday, color: [237, 141, 44] },
        { label: "ABSENT", val: stats.absent, color: [198, 40, 40] },
        { label: "NOT SET", val: stats.notSet, color: [100, 100, 100] },
      ];

      doc.setFontSize(7);
      summaryStats.forEach((s, idx) => {
        const sy = 16 + idx * 4.2;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(s.color[0], s.color[1], s.color[2]);
        doc.text(`${s.label}:`, 172, sy);
        doc.text(`${s.val}`, 204, sy, { align: "right" });
      });

      const photoCache = {};
      await Promise.all(
        filteredStaff.map(async (staff) => {
          if (!staff.avatar) return;
          try {
            const dataUrl = await new Promise((resolve) => {
              const img = new Image();
              img.src = staff.avatar;
              img.crossOrigin = "Anonymous";
              img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.getContext("2d").drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/png"));
              };
              img.onerror = () => resolve(null);
            });
            if (dataUrl) photoCache[staff._id] = dataUrl;
          } catch (e) { }
        })
      );

      const statuses = ["Present", "Half Day", "Absent", "Paid Leave", "Not Set"];
      const statusColors = {
        Present: { bg: [232, 245, 233], activeBg: [46, 125, 50], text: [46, 125, 50], activeText: [255, 255, 255] },
        "Half Day": { bg: [255, 243, 224], activeBg: [237, 141, 44], text: [239, 108, 0], activeText: [255, 255, 255] },
        Absent: { bg: [255, 235, 238], activeBg: [198, 40, 40], text: [198, 40, 40], activeText: [255, 255, 255] },
        "Paid Leave": { bg: [254, 252, 232], activeBg: [139, 145, 33], text: [139, 145, 33], activeText: [255, 255, 255] },
        "Not Set": { bg: [245, 245, 245], activeBg: [66, 66, 66], text: [100, 100, 100], activeText: [255, 255, 255] },
      };

      const COL_NAME = 70;
      const COL_ATTEND = 100;
      const COL_STATUS = 20;

      const headers = ["Full Name", "Mark Attendance", "Status"];
      const rows = filteredStaff.map((staff) => [
        staff,
        getStaffAttendance(staff._id).status,
        staff.status || "Active",
      ]);

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 38,
        theme: "plain",
        styles: {
          fontSize: 9,
          cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
          valign: "middle",
          minCellHeight: 24,
        },
        headStyles: {
          textColor: [130, 130, 130],
          fontStyle: "normal",
          halign: "left",
          fontSize: 9,
          cellPadding: { left: 3, right: 3 },
        },
        columnStyles: {
          0: { cellWidth: COL_NAME, halign: "left" },
          1: { cellWidth: COL_ATTEND, halign: "center" },
          2: { cellWidth: COL_STATUS, halign: "center" },
        },
        didParseCell: (data) => {
          if (data.section === "body") {
            data.cell.text = [];
          }
        },
        didDrawCell: (data) => {
          if (data.section !== "body") return;

          const cell = data.cell;
          const cy = cell.y;
          const ch = cell.height;

          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.25);
          doc.line(cell.x, cy + ch, cell.x + cell.width, cy + ch);

          if (data.column.index === 0) {
            const staff = data.row.raw[0];
            const avatarSz = 18;
            const avatarX = cell.x + 2;
            const avatarY = cy + (ch - avatarSz) / 2;

            const photo = photoCache[staff._id];
            if (photo) {
              doc.addImage(photo, "PNG", avatarX, avatarY, avatarSz, avatarSz);
            }
            doc.setDrawColor(210, 150, 100);
            doc.setLineWidth(0.4);
            doc.roundedRect(avatarX, avatarY, avatarSz, avatarSz, 2.5, 2.5, "S");

            const textX = avatarX + avatarSz + 3;

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(184, 92, 56);
            doc.text(staff.name, textX, cy + ch / 2 - 1.5);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(110, 110, 110);
            doc.text(staff.position || "Staff", textX, cy + ch / 2 + 5);
          }

          if (data.column.index === 1) {
            const currentStatus = data.row.raw[1];
            const pillH = 8;
            const pillW = 18;
            const pillGap = 2;
            const totalW = statuses.length * pillW + (statuses.length - 1) * pillGap;
            const startX = cell.x + (cell.width - totalW) / 2;
            const pillY = cy + (ch - pillH) / 2;

            statuses.forEach((s, i) => {
              const isActive = s === currentStatus;
              const colors = statusColors[s];
              const fill = isActive ? colors.activeBg : colors.bg;
              const txtColor = isActive ? colors.activeText : colors.text;
              const px = startX + i * (pillW + pillGap);

              doc.setFillColor(fill[0], fill[1], fill[2]);
              doc.roundedRect(px, pillY, pillW, pillH, 4, 4, "F");

              doc.setTextColor(txtColor[0], txtColor[1], txtColor[2]);
              doc.setFontSize(6.5);
              doc.setFont("helvetica", "bold");
              doc.text(s, px + pillW / 2, pillY + pillH / 2 + 2.2, { align: "center" });
            });
          }

          if (data.column.index === 2) {
            const staffStatus = data.row.raw[2];
            const isActive = staffStatus === "Active";
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(
              isActive ? 46 : 198,
              isActive ? 125 : 40,
              isActive ? 50 : 40
            );
            doc.text(
              staffStatus,
              cell.x + cell.width / 2,
              cy + ch / 2 + 1.5,
              { align: "center" }
            );
          }
        },
        margin: { left: 10, right: 10 },
      });

      doc.save(
        `Daily_Staff_Attendance_${selectedDate.toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const exportDailyExcel = () => {
    try {
      const excelData = filteredStaff.map((staff) => {
        const data = getStaffAttendance(staff._id);
        return {
          "Staff Name": staff.name,
          Position: staff.position || "Staff",
          Date: dateKey,
          Status: data.status,
          "Working Hours": data.workingHours,
          Overtime: data.overtime,
          "Staff Status": staff.status || "Active",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Attendance");
      XLSX.writeFile(workbook, `Attendance_Daily_${dateKey}.xlsx`);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const fetchMonthlyData = async () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    const companyId = searchParams.get("companyId");
    const query = companyId ? `&companyId=${companyId}` : "";
    const res = await fetch(`/api/attendance/monthly?year=${year}&month=${month}${query}`);
    if (!res.ok) throw new Error("Failed to fetch monthly data");
    return res.json();
  };

  const exportMonthlyReport = async () => {
    try {
      const monthlyRecords = await fetchMonthlyData();
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const staffSummary = {};
      staffList.forEach(s => {
        staffSummary[String(s._id)] = {
          name: s.name,
          avatar: s.avatar,
          present: 0,
          halfday: 0,
          absent: 0,
          paidLeave: 0,
          notSet: 0,
          days: {}
        };
      });

      monthlyRecords.forEach(record => {
        const recUserId = record.userId?._id ? record.userId._id : record.userId;
        const staffIdStr = String(recUserId || '');

        let day = 0;
        if (typeof record.date === 'string' && record.date.includes('-')) {
          day = parseInt(record.date.split('T')[0].split('-')[2], 10);
        } else {
          day = new Date(record.date).getUTCDate();
        }

        if (staffSummary[staffIdStr]) {
          const sObj = staffSummary[staffIdStr];
          let statusInitial = "";
          if (record.status === "Present") { sObj.present++; statusInitial = "P"; }
          else if (record.status === "Half Day") { sObj.halfday++; statusInitial = "H"; }
          else if (record.status === "Absent") { sObj.absent++; statusInitial = "A"; }
          else if (record.status === "Paid Leave") { sObj.paidLeave++; statusInitial = "PL"; }
          else { statusInitial = "N"; sObj.notSet++; }

          sObj.days[day] = statusInitial;
        }
      });

      // Fill missing days with "N"
      Object.values(staffSummary).forEach(s => {
        for (let i = 1; i <= daysInMonth; i++) {
          if (!s.days[i]) {
            s.days[i] = "N";
            s.notSet++;
          }
        }
      });

      const doc = new jsPDF({ orientation: 'landscape' });
      const monthName = selectedDate.toLocaleDateString("en-US", { month: "long" });

      await addStandardHeader(doc, "", companyName, companyAddress, companyPhone);

      const pageWidth = doc.internal.pageSize.getWidth();

      // Calculate company width to position title correctly
      if (doc.getFontList()["ZapfHumnst-BT-Bold"]) {
        doc.setFont("ZapfHumnst-BT-Bold", "bold");
      } else {
        doc.setFont("helvetica", "bold");
      }
      doc.setFontSize(14);
      const companyWidth = doc.getTextWidth(companyName || "Shree Swaminarayn Gurukul Vadodara");

      // Draw Title manually to control size and prevent overlap
      doc.setFontSize(18);
      doc.setTextColor(255, 102, 0);
      if (doc.getFontList()["ZapfHumnst-BT-Bold"]) {
        doc.setFont("ZapfHumnst-BT-Bold", "bold");
      } else {
        doc.setFont("helvetica", "bold");
      }
      doc.text(`Monthly Staff Attendance`, 25 + companyWidth + 10, 13.5);

      // Add "Month : [MonthName]" to the right with right alignment
      doc.setFontSize(14);
      doc.setTextColor(60, 60, 60);
      doc.text(`Month : ${monthName} ${selectedDate.getFullYear()}`, pageWidth - 10, 13.5, { align: 'right' });

      const headers = ["Name", ...Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString()), "P", "H", "A", "PL", "N"];

      const rows = Object.values(staffSummary).map(s => {
        const row = [s.name];
        for (let i = 1; i <= daysInMonth; i++) {
          row.push(s.days[i]);
        }
        row.push(s.present, s.halfday, s.absent, s.paidLeave, s.notSet);
        return row;
      });

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 23,
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 1,
          halign: 'center',
          valign: 'middle',
          textColor: [40, 40, 40],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [60, 60, 60],
          fontStyle: 'bold',
          lineWidth: 0.1,
        },
        columnStyles: {
          0: { halign: 'left', cellWidth: 40, fontStyle: 'bold' }, // Name column
        },
        didParseCell: (data) => {
          if (data.section === 'body') {
            const lastFiveStart = headers.length - 5;

            // Color initials in the grid
            if (data.column.index > 0 && data.column.index < lastFiveStart) {
              const val = data.cell.raw;
              if (val === "P") data.cell.styles.textColor = [46, 125, 50];
              if (val === "H") data.cell.styles.textColor = [237, 141, 44];
              if (val === "A") data.cell.styles.textColor = [198, 40, 40];
              if (val === "PL") data.cell.styles.textColor = [139, 145, 33];
              if (val === "N") data.cell.styles.textColor = [100, 100, 100];
            }

            // Color summary totals
            if (data.column.index >= lastFiveStart) {
              data.cell.styles.fontStyle = 'bold';
              if (data.column.index === lastFiveStart) data.cell.styles.textColor = [46, 125, 50];
              if (data.column.index === lastFiveStart + 1) data.cell.styles.textColor = [237, 141, 44];
              if (data.column.index === lastFiveStart + 2) data.cell.styles.textColor = [198, 40, 40];
              if (data.column.index === lastFiveStart + 3) data.cell.styles.textColor = [139, 145, 33];
              if (data.column.index === lastFiveStart + 4) data.cell.styles.textColor = [0, 0, 0];
            }
          }
        },
        margin: { left: 10, right: 10 },
      });

      doc.save(`Attendance_Monthly_${monthName}_${selectedDate.getFullYear()}.pdf`);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const exportMonthlyExcel = async () => {
    try {
      const monthlyRecords = await fetchMonthlyData();
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const staffStats = staffList.map((staff) => {
        const staffIdStr = String(staff._id);
        const staffRecords = monthlyRecords.filter((r) => {
          const rId = String(r.userId?._id || r.userId || '');
          return rId === staffIdStr;
        });

        let present = 0, halfday = 0, absent = 0, paidLeave = 0, notSet = 0, totalHours = 0;

        const dayMap = {};
        for (let i = 1; i <= daysInMonth; i++) {
          const rec = staffRecords.find((r) => {
            let day = 0;
            if (typeof r.date === 'string' && r.date.includes('-')) {
              day = parseInt(r.date.split('T')[0].split('-')[2], 10);
            } else {
              day = new Date(r.date).getUTCDate();
            }
            return day === i;
          });

          if (rec) {
            dayMap[`Day ${i}`] = rec.status;
            if (rec.status === "Present") present++;
            else if (rec.status === "Half Day") halfday++;
            else if (rec.status === "Absent") absent++;
            else if (rec.status === "Paid Leave") paidLeave++;
            else notSet++;
            if (rec.status !== "Absent" && rec.status !== "Paid Leave" && rec.status !== "Not Set") {
              totalHours += Number(rec.workingHours || 0);
            }
          } else {
            dayMap[`Day ${i}`] = "Not Set";
            notSet++;
          }
        }

        return {
          name: staff.name,
          position: staff.position || "Staff",
          ...dayMap,
          present,
          halfday,
          absent,
          paidLeave,
          totalHours,
        };
      });

      const excelData = staffStats.map((s) => {
        const row = { "Staff Name": s.name, Position: s.position };
        for (let i = 1; i <= daysInMonth; i++) {
          row[`Day ${i}`] = s[`Day ${i}`];
        }
        row["Total Present"] = s.present;
        row["Total Half Day"] = s.halfday;
        row["Total Absent"] = s.absent;
        row["Total Paid Leave"] = s.paidLeave;
        row["Total Hours"] = s.totalHours;
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Attendance");
      const monthName = selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      XLSX.writeFile(workbook, `Attendance_Monthly_${monthName.replace(' ', '_')}.xlsx`);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  if (permsLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#882619] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-muted-foreground">
            Loading Attendance...
          </p>
        </div>
      </div>
    );
  }

  if (!hasPermission("read")) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full bg-card rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={40} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground font-medium mb-8">
            You don&apos;t have permission to view the Attendance records. Please
            contact your administrator for access.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className=" min-h-screen p-6">
      <div className="bg-white rounded-lg shadow-2xl dark:bg-[#1a1a1a]">
        {/* Title above bar */}
        <div className="px-4 md:px-8 pt-4 pb-2">
          <h1 className="text-xs md:text-sm italic font-semibold text-slate-500 dark:text-zinc-400 tracking-tight">
            Staff - Daily Attendance
          </h1>
        </div>

        {/* Top Header Row Bar */}
        <div className="bg-[#E3E3E3] dark:bg-[#252525] border-y-2 border-[#882619] px-4 md:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4">
          {/* Left Side: 5 Metrics Cards with Vertical Dividers */}
          <div className="flex items-center divide-x divide-slate-400/60 dark:divide-zinc-600/60 overflow-x-auto py-1">
            {[
              { label: "Present", value: stats.present, color: "text-[#2E7D32]" },
              { label: "Half Day", value: stats.halfday, color: "text-[#ED8D2C]" },
              { label: "Absent", value: stats.absent, color: "text-[#C62828]" },
              { label: "Paid Leave", value: stats.paidLeave, color: "text-[#8B9121]" },
              { label: "Not Set", value: stats.notSet, color: "text-slate-900 dark:text-zinc-100" }
            ].map((stat, idx) => (
              <div key={stat.label} className={`flex flex-col items-center px-4 md:px-6 ${idx === 0 ? 'pl-2' : ''}`}>
                <span className={`text-2xl md:text-3xl font-black italic tabular-nums leading-none ${stat.color}`}>
                  {String(stat.value).padStart(2, '0')}
                </span>
                <span className={`text-[10px] md:text-xs font-semibold italic mt-0.5 whitespace-nowrap ${stat.color}`}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Right Side: Daily, Monthly Download Action Icons & Month Picker Pill */}
          <div className="flex items-center gap-5 md:gap-7">
            {/* Daily Export */}
            <div className="relative" data-export-root="true">
              <button
                type="button"
                onClick={() => setIsDailyExportOpen(!isDailyExportOpen)}
                className="flex flex-col items-center justify-center cursor-pointer border-0 bg-transparent group hover:opacity-80 transition-opacity"
              >
                <img src="/icons/action/Daily.svg" className="w-10 h-10 block dark:hidden" alt="Daily Export" />
                <img src="/icons/action/DailyDark.svg" className="w-10 h-10 block hidden dark:block" alt="Daily Export" />
              </button>
              <AnimatePresence>
                {isDailyExportOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-xl z-20 py-2 min-w-[140px] overflow-hidden"
                  >
                    <button
                      onClick={() => { exportDailyReport(); setIsDailyExportOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 text-slate-800 dark:text-zinc-100"
                    >
                      PDF Report
                    </button>
                    <button
                      onClick={() => { exportDailyExcel(); setIsDailyExportOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 text-slate-800 dark:text-zinc-100"
                    >
                      Excel Sheet
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Monthly Export */}
            <div className="relative" data-export-root="true">
              <button
                type="button"
                onClick={() => setIsMonthlyExportOpen(!isMonthlyExportOpen)}
                className="flex flex-col items-center justify-center cursor-pointer border-0 bg-transparent group hover:opacity-80 transition-opacity"
              >
                <img src="/icons/action/Monthly.svg" className="w-13 h-13 block dark:hidden" alt="Monthly Export" />
                <img src="/icons/action/MonthlyDark.svg" className="w-13 h-13 block hidden dark:block" alt="Monthly Export" />
              </button>
              <AnimatePresence>
                {isMonthlyExportOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-xl z-20 py-2 min-w-[160px] overflow-hidden"
                  >
                    <button
                      onClick={() => { exportMonthlyReport(); setIsMonthlyExportOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 text-slate-800 dark:text-zinc-100"
                    >
                      Monthly PDF
                    </button>
                    <button
                      onClick={() => { exportMonthlyExcel(); setIsMonthlyExportOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 text-slate-800 dark:text-zinc-100"
                    >
                      Monthly Excel
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Month Picker Pill */}
            <div className="relative" data-month-picker-root="true">
              <div
                onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
                className="gradient-pill-input px-3 py-1 bg-white dark:bg-zinc-800 flex items-center gap-2 cursor-pointer"
              >
                <Calendar size={13} className="text-[#D4612D]" />
                <span className="text-xs font-black uppercase bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent">
                  {selectedDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
                <ChevronDown size={13} className={`transition-transform text-[#882619] fill-[#882619] ${isMonthPickerOpen ? 'rotate-180' : ''}`} />
              </div>
              <AnimatePresence>
                {isMonthPickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-2xl z-30 p-4 min-w-[280px]"
                  >
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-zinc-700">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newDate = new Date(selectedDate);
                          newDate.setFullYear(newDate.getFullYear() - 1);
                          setSelectedDate(newDate);
                        }}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-lg transition-colors text-[#882619]"
                      >
                        <ChevronLeft size={18} strokeWidth={2.5} />
                      </button>
                      <span className="text-sm font-bold text-[#882619]">
                        {selectedDate.getFullYear()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newDate = new Date(selectedDate);
                          newDate.setFullYear(newDate.getFullYear() + 1);
                          setSelectedDate(newDate);
                        }}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-lg transition-colors text-[#882619]"
                      >
                        <ChevronRight size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                      ].map((month, index) => (
                        <button
                          key={month}
                          onClick={() => {
                            const newDate = new Date(selectedDate);
                            newDate.setMonth(index);
                            setSelectedDate(newDate);
                            setIsMonthPickerOpen(false);
                          }}
                          className={`py-2 px-1 text-xs font-bold rounded-xl transition-all ${selectedDate.getMonth() === index
                            ? "bg-gradient-to-r from-[#882619] to-[#D4612D] text-white shadow-md"
                            : "hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200"
                            }`}
                        >
                          {month.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Controls Row (Quick Search & Date Navigator Pill) */}
        <div className="px-4 md:px-8 py-4 flex flex-wrap items-center justify-start gap-4 sm:gap-6">
          {/* Quick Search Input Pill */}
          <div className="gradient-pill-input w-52 sm:w-64 px-3.5 py-1.5 bg-white dark:bg-zinc-800 flex items-center">
            <Search size={15} className="text-[#D4612D] shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Quick Search"
              className="w-full bg-transparent text-xs font-semibold outline-none text-slate-800 dark:text-zinc-100 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date Switcher Navigator Pill */}
          <div className="gradient-pill-input px-3.5 py-1.5 bg-white dark:bg-zinc-800 flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateDate(-1)}
              className="text-[#882619] hover:scale-110 transition-transform border-0 bg-transparent cursor-pointer p-0"
            >
              <ChevronLeft size={16} className="fill-[#882619]" />
            </button>

            <DateTimePicker
              showTime={false}
              value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`}
              onChange={(val) => {
                if (val) {
                  const [y, m, d] = val.split('-').map(Number);
                  setSelectedDate(new Date(y, m - 1, d));
                }
              }}
              customTrigger={
                <span className="text-xs font-black bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent cursor-pointer select-none px-1">
                  {selectedDate.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit"
                  })} - {selectedDate.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
              }
            />

            <button
              type="button"
              onClick={() => updateDate(1)}
              className="text-[#882619] hover:scale-110 transition-transform border-0 bg-transparent cursor-pointer p-0"
            >
              <ChevronRight size={16} className="fill-[#882619]" />
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="px-4 md:px-8 py-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse custom-scale-table">
              <thead>
                <tr className="border-b-4 border-double border-[#882619] text-xs font-black text-slate-800 dark:text-zinc-200">
                  <th className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <TableColumnFilter
                        colKey="name"
                        title="Full Name"
                        options={uniqueNames}
                        showOptionIcon
                        colFilters={colFilters}
                        activeFilterCol={activeFilterCol}
                        onToggle={toggleColFilter}
                        onChange={handleColFilterChange}
                      />
                    </div>
                  </th>
                  <th className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <TableColumnFilter
                        colKey="position"
                        title="Position"
                        options={uniquePositions}
                        showOptionIcon
                        colFilters={colFilters}
                        activeFilterCol={activeFilterCol}
                        onToggle={toggleColFilter}
                        onChange={handleColFilterChange}
                      />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <TableColumnFilter
                        colKey="attendanceStatus"
                        title="Mark Attendance"
                        options={uniqueAttendanceStatuses}
                        showOptionIcon
                        colFilters={colFilters}
                        activeFilterCol={activeFilterCol}
                        onToggle={toggleColFilter}
                        onChange={handleColFilterChange}
                      />
                    </div>
                  </th>
                  <th className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <TableColumnFilter
                        colKey="staffStatus"
                        title="Status"
                        options={uniqueStaffStatuses}
                        showOptionIcon
                        colFilters={colFilters}
                        activeFilterCol={activeFilterCol}
                        onToggle={toggleColFilter}
                        onChange={handleColFilterChange}
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                {paginatedStaff.map((staff) => {
                  const data = getStaffAttendance(staff._id);
                  return (
                    <tr key={staff._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                      {/* Column 1: Staff Avatar & Name */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => staff.avatar && setSelectedImage(staff.avatar)}
                            className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-xl overflow-hidden shrink-0 cursor-pointer border border-[#F6AD71]/60 shadow-sm"
                          >
                            {staff.avatar ? (
                              <img
                                src={staff.avatar}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-orange-800 font-bold text-xs uppercase bg-orange-100">
                                Icon
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <h3 className="font-extrabold text-base bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent leading-snug">
                              {staff.name}
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 capitalize mt-0.5">
                              {staff.position || "Staff"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Position */}
                      <td className="py-4 px-4 text-xs font-bold text-slate-600 dark:text-zinc-400">
                        {staff.position || "-"}
                      </td>

                      {/* Column 3: Mark Attendance Pill Buttons */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                          {[
                            {
                              label: "Present",
                              value: "Present",
                              activeBg: "bg-[#2E7D32]",
                              activeText: "text-white font-extrabold shadow-md",
                              inactiveBg: "bg-[#E8F5E9]",
                              inactiveText: "text-[#2E7D32] italic font-semibold",
                            },
                            {
                              label: "Half Day",
                              value: "Half Day",
                              activeBg: "bg-[#ED8D2C]",
                              activeText: "text-white font-extrabold shadow-md",
                              inactiveBg: "bg-[#FFF3E0]",
                              inactiveText: "text-[#ED8D2C] italic font-semibold",
                            },
                            {
                              label: "Absent",
                              value: "Absent",
                              activeBg: "bg-[#C62828]",
                              activeText: "text-white font-extrabold shadow-md",
                              inactiveBg: "bg-[#FFEBEE]",
                              inactiveText: "text-[#C62828] italic font-semibold",
                            },
                            {
                              label: "Paid Leave",
                              value: "Paid Leave",
                              activeBg: "bg-[#8B9121]",
                              activeText: "text-white font-extrabold shadow-md",
                              inactiveBg: "bg-[#FEFCE8]",
                              inactiveText: "text-[#8B9121] italic font-semibold",
                            },
                            {
                              label: "Not Set",
                              value: "Not Set",
                              activeBg: "bg-[#424242]",
                              activeText: "text-white font-extrabold shadow-md",
                              inactiveBg: "bg-[#EFEFEF]",
                              inactiveText: "text-slate-700 italic font-semibold",
                            },
                          ].map((status) => (
                            <button
                              key={status.value}
                              type="button"
                              onClick={() => {
                                if (!isReadOnly && (hasPermission("edit") || hasPermission("write"))) {
                                  handleAttendanceChange(staff._id, "status", status.value);
                                }
                              }}
                              className={`px-3.5 py-1.5 rounded-full text-xs transition-all border-0 ${data.status === status.value
                                ? `${status.activeBg} ${status.activeText}`
                                : `${status.inactiveBg} ${status.inactiveText} hover:opacity-85`
                                } ${isReadOnly || !(hasPermission("edit") || hasPermission("write"))
                                  ? " cursor-not-allowed opacity-50"
                                  : " cursor-pointer"
                                }`}
                            >
                              {status.label}
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* Column 4: Staff Status */}
                      <td className="py-4 px-4 text-center">
                        <span className={`text-xs font-bold ${staff.status === "Inactive" ? "text-red-600" : "text-slate-700 dark:text-zinc-300"
                          }`}>
                          {staff.status || "Active"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredStaff.length}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </div>

        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="relative max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={selectedImage}
                  alt="Profile"
                  className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-3 -right-3 bg-card p-2 rounded-full shadow-lg"
                >
                  ✕
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AttendancePageContent />
    </Suspense>
  );
}
