// =========================================================================
// 🔗 PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE:
// =========================================================================
const CLOUD_API_URL = "https://script.google.com/macros/s/AKfycby-HCCNrYC-ZB0IKRFfZP2w4CXz2SmLz3MNJbGUCRGsywhTNe096MLxLaOU6L4GA3PRuA/exec";

// Bilingual Translations Dictionary
const i18n = {
    ar: {
        loginTitle: "🏢 الفرع الرئيسي - تسجيل الدخول",
        loginDesc: "يرجى إدخال كلمة المرور للوصول إلى لوحة التقارير",
        loginBtn: "دخول",
        dashTitle: "🏢 لوحة تحكم الفرع الرئيسي",
        dashSub: "متابعة تقارير الجرد المستلمة من الفروع",
        btnRefresh: "🔄 تحديث",
        btnSettings: "⚙️ كلمة المرور",
        btnClear: "🗑️ مسح الكل",
        loading: "جاري تحديث التقارير من السحابة...",
        noReports: "لا توجد تقارير جرد مستلمة حتى الآن.",
        errorCloud: "فشل الاتصال بالسحابة. تحقق من اتصال الإنترنت.",
        viewPrint: "📄 عرض / طباعة التقرير",
        reviewed: "تمت المراجعة",
        wrongPass: "كلمة المرور غير صحيحة!",
        passSuccess: "تم تغيير كلمة المرور بنجاح!",
        clearConfirm: "هل أنت متأكد من مسح جميع التقارير من السجل والسحابة؟"
    },
    en: {
        loginTitle: "🏢 Headquarters - Login",
        loginDesc: "Enter admin password to access the reports dashboard",
        loginBtn: "Login",
        dashTitle: "🏢 HQ Control Dashboard",
        dashSub: "Monitor and manage inventory reports submitted by branches",
        btnRefresh: "🔄 Refresh",
        btnSettings: "⚙️ Password",
        btnClear: "🗑️ Clear All",
        loading: "Updating reports from cloud...",
        noReports: "No inventory reports received yet.",
        errorCloud: "Cloud connection failed. Please check internet connection.",
        viewPrint: "📄 View / Print Report",
        reviewed: "Reviewed",
        wrongPass: "Incorrect password!",
        passSuccess: "Password changed successfully!",
        clearConfirm: "Are you sure you want to clear all reports from cloud and history?"
    }
};

let currentLang = localStorage.getItem('salma_hq_lang') || 'ar';

// Language Toggle Function
function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('salma_hq_lang', currentLang);
    applyLanguage();
}

function applyLanguage() {
    const html = document.documentElement;
    html.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
    html.setAttribute('lang', currentLang);

    const t = i18n[currentLang];

    if (document.getElementById('i18n-login-title')) document.getElementById('i18n-login-title').innerText = t.loginTitle;
    if (document.getElementById('i18n-login-desc')) document.getElementById('i18n-login-desc').innerText = t.loginDesc;
    if (document.getElementById('i18n-login-btn')) document.getElementById('i18n-login-btn').innerText = t.loginBtn;

    if (document.getElementById('i18n-dash-title')) document.getElementById('i18n-dash-title').innerText = t.dashTitle;
    if (document.getElementById('i18n-dash-sub')) document.getElementById('i18n-dash-sub').innerText = t.dashSub;

    if (document.getElementById('i18n-btn-refresh')) document.getElementById('i18n-btn-refresh').innerText = t.btnRefresh;
    if (document.getElementById('i18n-btn-settings')) document.getElementById('i18n-btn-settings').innerText = t.btnSettings;
    if (document.getElementById('i18n-btn-clear')) document.getElementById('i18n-btn-clear').innerText = t.btnClear;
}

// Retrieve Password
function getHQPassword() {
    return localStorage.getItem('salma_hq_password') || "0000";
}

// Custom Password Change Modal Controls
function openPasswordModalHQ() {
    document.getElementById('current-pass-input').value = "";
    document.getElementById('new-pass-input').value = "";
    document.getElementById('pass-modal-overlay').style.display = "flex";
}

function closePasswordModalHQ() {
    document.getElementById('pass-modal-overlay').style.display = "none";
}

function confirmHQPasswordChange() {
    const t = i18n[currentLang];
    const currentPass = getHQPassword();
    const enteredCurrent = document.getElementById('current-pass-input').value;
    const newPass = document.getElementById('new-pass-input').value.trim();

    if (enteredCurrent !== currentPass) {
        alert(t.wrongPass);
        return;
    }

    if (!newPass) {
        alert(currentLang === 'ar' ? "يرجى إدخال كلمة المرور الجديدة!" : "Please enter a new password!");
        return;
    }

    localStorage.setItem('salma_hq_password', newPass);
    alert(t.passSuccess);
    closePasswordModalHQ();
}

// Theme Toggle
function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    document.body.classList.toggle("light-mode");
}

// App Login
function unlockHQApp() {
    const input = document.getElementById('hq-app-password');
    if (!input) return;

    if (input.value === getHQPassword()) {
        document.getElementById('hq-login-screen').style.display = 'none';
        document.getElementById('hq-dashboard').classList.remove('hidden');

        fetchAndRenderReports();
        setInterval(fetchAndRenderReports, 5 * 60 * 1000);
    } else {
        alert(i18n[currentLang].wrongPass);
    }
}

// Fetch Reports
async function fetchAndRenderReports() {
    const container = document.getElementById('reports-list');
    if (!container) return;

    const t = i18n[currentLang];
    container.innerHTML = `<p style="text-align: center; color: var(--text-secondary); font-weight: bold;">${t.loading}</p>`;

    try {
        const response = await fetch(CLOUD_API_URL);
        const reports = await response.json();
        renderReportsUI(reports);
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p style="text-align: center; color: var(--danger); font-weight: bold;">${t.errorCloud}</p>`;
    }
}

// Render Reports Cards
function renderReportsUI(reports) {
    const container = document.getElementById('reports-list');
    if (!container) return;

    const t = i18n[currentLang];

    if (!reports || reports.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 20px;">${t.noReports}</p>`;
        return;
    }

    container.innerHTML = "";
    reports.slice().reverse().forEach((rep) => {
        const card = document.createElement('div');
        card.className = `report-card ${rep.checked ? 'checked-report' : ''}`;

        const dataUriPayload = rep.pdfDataUri || rep.downloadUrl;

        card.innerHTML = `
            <div class="report-details">
                <h4>🏢 ${rep.branchName}</h4>
                <p>📞 <strong>${currentLang === 'ar' ? 'الهاتف' : 'Phone'}:</strong> ${rep.phone}</p>
                <p>📅 <strong>${currentLang === 'ar' ? 'التاريخ' : 'Date'}:</strong> ${rep.date}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
                <button onclick="openReportView('${dataUriPayload}')" class="btn-confirm">${t.viewPrint}</button>
                <div style="text-align: center;">
                    <label style="font-size: 0.75rem; display: block; margin-bottom: 3px; color: var(--text-secondary);">${t.reviewed}</label>
                    <input type="checkbox" ${rep.checked ? 'checked' : ''} onchange="toggleReportCheck(${rep.id})" style="width: 20px; height: 20px; cursor: pointer;">
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// =========================================================================
// 🖨️ OPEN HTML REPORT WINDOW (MOBILE APK & WEBVIEW FIX)
// =========================================================================
function openReportView(dataUri) {
    if (!dataUri) return alert("Report data incomplete.");

    try {
        const base64Part = dataUri.includes(",") ? dataUri.split(',')[1] : dataUri;
        let htmlContent = decodeURIComponent(escape(atob(base64Part)));

        // Inject Print Styles & APK Print Handler Script
        const printScriptAndStyles = `
            <style>
                @media print {
                    .no-print { display: none !important; }
                    body { padding: 0 !important; background: #fff !important; color: #000 !important; }
                }
            </style>
            <script>
                function doPrint() {
                    try {
                        window.print();
                    } catch (e) {
                        alert("Print feature is restricted inside this app view. Please take a screenshot or open in browser.");
                    }
                }
            </script>
        `;

        const printButtonHtml = `
            <div class="no-print" style="text-align: center; margin: 30px 0; font-family: system-ui, sans-serif;">
                <button onclick="doPrint()" style="padding: 14px 28px; font-size: 16px; font-weight: bold; background: #2563eb; color: white; border: none; border-radius: 10px; cursor: pointer; box-shadow: 0 4px 14px rgba(37,99,235,0.4);">
                    🖨️ طباعة / حفظ PDF
                </button>
            </div>
        `;

        // Inject into HTML document
        if (htmlContent.includes("</head>")) {
            htmlContent = htmlContent.replace("</head>", `${printScriptAndStyles}</head>`);
        } else {
            htmlContent = printScriptAndStyles + htmlContent;
        }

        if (htmlContent.includes("</body>")) {
            htmlContent = htmlContent.replace("</body>", `${printButtonHtml}</body>`);
        } else {
            htmlContent += printButtonHtml;
        }

        // 1. Primary Attempt: Standard Window opening
        const win = window.open("", "_blank");
        if (win) {
            win.document.open();
            win.document.write(htmlContent);
            win.document.close();
        } else {
            // 2. Android APK Fallback: Create Blob URL if popup window is blocked
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const blobUrl = URL.createObjectURL(blob);
            window.location.href = blobUrl;
        }

    } catch (e) {
        console.error(e);
        // Fallback to direct URL navigation
        window.location.href = dataUri;
    }
}

// Toggle Checkbox Status
async function toggleReportCheck(id) {
    try {
        await fetch(CLOUD_API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ action: "toggle", id: id })
        });
        setTimeout(fetchAndRenderReports, 800);
    } catch (error) {
        console.error(error);
    }
}

// Clear Reports
async function clearAllReports() {
    const t = i18n[currentLang];
    if (confirm(t.clearConfirm)) {
        try {
            await fetch(CLOUD_API_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ action: "clear" })
            });
            setTimeout(fetchAndRenderReports, 800);
        } catch (error) {
            console.error(error);
        }
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    applyLanguage();
});
