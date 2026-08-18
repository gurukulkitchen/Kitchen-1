import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Standard PDF Generator for Gurukul Inventory Reports
 * Features:
 * - Organization Logo
 * - Custom Orange/Grey Header Branding
 * - Standardized Table Styling
 */
/**
 * Adds the standard Gurukul organization header to a jsPDF document.
 * Includes logo, organization name, title, and orange/grey separator line.
 */
export const addStandardHeader = async (doc, title, companyName = "Shree Swaminarayn Gurukul Vadodara", address = "", phone = "") => {
    // Helper to load logo
    // Helper to load logo
    const getLogoBase64 = () => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = '/pdflogo.png';
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => resolve(null);
        });
    };

    // Helper to load custom fonts
    const loadCustomFonts = async () => {
        try {
            const [boldRes, romanRes] = await Promise.all([
                fetch('/fonts/ZapfHumnst BT Bold.ttf'),
                fetch('/fonts/ZapfHumnst BT Roman.ttf')
            ]);

            if (!boldRes.ok || !romanRes.ok) throw new Error('Font files not found');

            const [boldBuf, romanBuf] = await Promise.all([
                boldRes.arrayBuffer(),
                romanRes.arrayBuffer()
            ]);

            const toBinary = (buf) => Array.from(new Uint8Array(buf)).map(b => String.fromCharCode(b)).join('');

            doc.addFileToVFS("ZapfHumnst-BT-Bold.ttf", toBinary(boldBuf));
            doc.addFont("ZapfHumnst-BT-Bold.ttf", "ZapfHumnst-BT-Bold", "bold");

            doc.addFileToVFS("ZapfHumnst-BT-Roman.ttf", toBinary(romanBuf));
            doc.addFont("ZapfHumnst-BT-Roman.ttf", "ZapfHumnst-BT-Roman", "normal");

            return true;
        } catch (error) {
            console.warn("Could not load custom fonts:", error);
            return false;
        }
    };

    const [logoBase64, fontsLoaded] = await Promise.all([
        getLogoBase64(),
        loadCustomFonts()
    ]);

    // Header Section
    if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 10, 5, 12, 12);
    }

    doc.setTextColor(60, 60, 60);
    if (fontsLoaded) {
        doc.setFont("ZapfHumnst-BT-Bold", "bold");
    } else {
        doc.setFont("helvetica", "bold");
    }
    doc.setFontSize(14);
    doc.text(companyName, 25, 11);

    if (address || phone) {
        if (fontsLoaded) {
            doc.setFont("ZapfHumnst-BT-Roman", "normal");
        } else {
            doc.setFont("helvetica", "normal");
        }
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        let infoLine = address;
        if (phone) {
            infoLine += address ? ` | Ph: ${phone}` : `Ph: ${phone}`;
        }
        doc.text(infoLine, 25, 16);
    }

    doc.setTextColor(255, 102, 0); // Orange
    doc.setFont("ZapfHumnst-BT-Bold", "bold"); // Changed to bold for better visibility
    if (title) {
        const pageWidth = doc.internal.pageSize.getWidth();
        // Dynamically adjust font size to avoid overlap with company name
        doc.setFontSize(20);
        let titleWidth = doc.getTextWidth(title);
        const availableWidth = pageWidth - 90; // Approx space available on the right
        
        if (titleWidth > availableWidth) {
            doc.setFontSize(16);
            titleWidth = doc.getTextWidth(title);
            if (titleWidth > availableWidth) {
                doc.setFontSize(14);
            }
        }
        
        // Right align the title
        doc.text(title, pageWidth - 10, 13.5, { align: 'right' });
    }

    // Separator line (Orange - 70%, Grey - 30%)
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const totalLineWidth = pageWidth - (2 * margin);
    const orangePart = totalLineWidth * 0.7;
    const greyPart = totalLineWidth * 0.3;

    doc.setLineWidth(1.2);
    doc.setDrawColor(255, 102, 0); // Orange
    doc.line(margin, 19, margin + orangePart, 19);
    doc.setDrawColor(120, 120, 120); // Grey
    doc.line(margin + orangePart + 0.5, 19, pageWidth - margin, 19);
};

/**
 * Standard PDF Generator for Gurukul Inventory Reports
 */
/**
 * Standard PDF Generator for Gurukul Inventory Reports
 */
export const generateStockPDF = async ({
    title,
    headers,
    data,
    fileName,
    orientation = 'l',
    companyName,
    companyAddress,
    companyPhone
}) => {
    try {
        const doc = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: 'a4',
        });

        // 🔹 Load Regional Fonts if needed
        let loadedHindi = false;
        let loadedGujarati = false;

        try {
            const [hindiFont, gujaratiFont] = await Promise.all([
                fetch("/fonts/NotoSansDevanagari-Regular.ttf").then(res => res.arrayBuffer()).catch(() => null),
                fetch("/fonts/NotoSansGujarati-Regular.ttf").then(res => res.arrayBuffer()).catch(() => null),
            ]);
            const toBinary = (buf) => Array.from(new Uint8Array(buf)).map(b => String.fromCharCode(b)).join('');

            if (hindiFont && hindiFont.byteLength > 0) {
                doc.addFileToVFS("NotoSansDevanagari.ttf", toBinary(hindiFont));
                doc.addFont("NotoSansDevanagari.ttf", "NotoSansDevanagari", "normal");
                loadedHindi = true;
            }
            if (gujaratiFont && gujaratiFont.byteLength > 0) {
                doc.addFileToVFS("NotoSansGujarati.ttf", toBinary(gujaratiFont));
                doc.addFont("NotoSansGujarati.ttf", "NotoSansGujarati", "normal");
                loadedGujarati = true;
            }
        } catch (err) {
            console.warn("Could not load regional fonts for PDF:", err);
        }

        await addStandardHeader(doc, title, companyName, companyAddress, companyPhone);

        // Prepare table
        autoTable(doc, {
            startY: 23,
            head: [headers],
            body: data,
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 2,
                font: "helvetica",
                textColor: [40, 40, 40],
                lineColor: [200, 200, 200],
                lineWidth: 0.05,
            },
            headStyles: {
                fillColor: [245, 245, 245],
                textColor: [60, 60, 60],
                fontStyle: 'bold',
                halign: 'center',
                font: 'helvetica',
            },
            didParseCell: (data) => {
                if (data.section === 'body') {
                    const text = String(data.cell.raw || '');
                    if (/[\u0A80-\u0AFF]/.test(text) && loadedGujarati) {
                        data.cell.styles.font = 'NotoSansGujarati';
                    } else if (/[\u0900-\u097F]/.test(text) && loadedHindi) {
                        data.cell.styles.font = 'NotoSansDevanagari';
                    } else {
                        data.cell.styles.font = 'helvetica';
                    }
                }
            },
            margin: { left: 10, right: 10 },
        });

        const finalFileName = fileName || `Report_${new Date().getTime()}.pdf`;
        doc.save(finalFileName);
        return true;
    } catch (err) {
        console.error("PDF Generation Error:", err);
        return false;
    }
};

