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
        enterCurrentPass: "أدخل كلمة المرور الحالية للإدارة:",
        enterNewPass: "أدخل كلمة المرور الجديدة:",
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
        enterCurrentPass: "Enter current admin password:",
        enterNewPass: "Enter new password:",
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

    document.getElementById('i18n-login-title').innerText = t.loginTitle;
    document.getElementById('i18n-login-desc').innerText = t.loginDesc;
    document.getElementById('i18n-login-btn').innerText = t.loginBtn;

    document.getElementById('i18n-dash-title').innerText = t.dashTitle;
    document.getElementById('i18n-dash-sub').innerText = t.dashSub;

    document.getElementById('i18n-btn-refresh').innerText = t.btnRefresh;
    document.getElementById('i18n-btn-settings').innerText = t.btnSettings;
    document.getElementById('i18n-btn-clear').innerText = t.btnClear;
}

// Retrieve Password
function getHQPassword() {
    return localStorage.getItem('salma_hq_password') || "0000";
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

// Open HTML Report Window
function openReportView(dataUri) {
    if (!dataUri) return alert("Report data incomplete.");

    const win = window.open("", "_blank");
    try {
        const base64Part = dataUri.includes(",") ? dataUri.split(',')[1] : dataUri;
        const htmlContent = decodeURIComponent(escape(atob(base64Part)));

        win.document.write(htmlContent);
        win.document.write(`
            <div style="text-align: center; margin: 30px 0; font-family: system-ui, sans-serif;">
                <button onclick="window.print()" style="padding: 12px 24px; font-size: 16px; font-weight: bold; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">🖨️ Print / Save as PDF</button>
            </div>
        `);
        win.document.close();
    } catch (e) {
        console.error(e);
        win.location.href = dataUri;
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

// Password Change
function changeHQPassword() {
    const t = i18n[currentLang];
    const currentPass = getHQPassword();
    const entered = prompt(t.enterCurrentPass);

    if (entered === null) return;
    if (entered !== currentPass) return alert(t.wrongPass);

    const newPass = prompt(t.enterNewPass);
    if (newPass && newPass.trim() !== "") {
        localStorage.setItem('salma_hq_password', newPass.trim());
        alert(t.passSuccess);
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    applyLanguage();
});
