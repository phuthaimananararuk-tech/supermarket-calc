let activeInput = null;
let inputSequence = ['priceA', 'weightA', 'priceB', 'weightB', 'priceC', 'weightC'];

let originalValueBeforeFocus = "";
let userTypedInCurrentFocus = false;

// โหลดข้อมูล Auto-Save ทันทีเมื่อเปิดแอป
window.addEventListener('DOMContentLoaded', () => {
    let savedState = localStorage.getItem('price_calc_autofill');
    if (savedState) {
        try {
            let data = JSON.parse(savedState);
            document.getElementById('priceA').value = data.priceA || '';
            document.getElementById('weightA').value = data.weightA || '';
            document.getElementById('priceB').value = data.priceB || '';
            document.getElementById('weightB').value = data.weightB || '';
            document.getElementById('priceC').value = data.priceC || '';
            document.getElementById('weightC').value = data.weightC || '';
            evaluateAllFieldsAndCompare();
        } catch (e) {}
    }

    let defaultInput = document.getElementById('priceA');
    activeInput = defaultInput;
    defaultInput.classList.add('active-focus');
    originalValueBeforeFocus = defaultInput.value;
    defaultInput.value = "";

    // ผูก Event ปุ่มควบคุมด้านบน
    document.getElementById('clearBtn').addEventListener('click', clearAllFields);
    document.getElementById('versionBtn').addEventListener('click', forceAppUpdate);
    document.getElementById('historyBtn').addEventListener('click', openHistoryModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeHistoryModal);
});

// ฟังก์ชันเลือกช่องกรอก (v2.0 Logic ปลอดภัย ไร้ลูปค้าง)
function setActiveInput(inputEl) {
    if (!inputEl) return;
    if (activeInput === inputEl) return;

    if (activeInput) {
        processBlur(activeInput);
    }

    activeInput = inputEl;
    userTypedInCurrentFocus = false;

    document.querySelectorAll('input').forEach(i => i.classList.remove('active-focus'));
    inputEl.classList.add('active-focus');

    originalValueBeforeFocus = inputEl.value;
    inputEl.value = "";
}

function processBlur(input) {
    if (!input) return;

    if (!userTypedInCurrentFocus && input.value === "" && originalValueBeforeFocus !== "") {
        input.value = originalValueBeforeFocus;
    } else {
        let evalVal = evaluateExpression(input.value);
        if (!isNaN(evalVal) && evalVal === 0) {
            input.value = "";
        } else if (!isNaN(evalVal) && input.value.trim() !== "") {
            input.value = evalVal.toString();
        }
    }
}

function handleBlurValidation(input) {
    processBlur(input);
    evaluateAllFieldsAndCompare();
    checkAndAutoSaveBackground();
}

// ระบบกดปุ่มบนคีย์บอร์ด
function pressKey(key) {
    if (!activeInput) {
        activeInput = document.getElementById('priceA');
        activeInput.classList.add('active-focus');
    }

    if (key !== 'NEXT') {
        userTypedInCurrentFocus = true;
    }

    let val = activeInput.value;

    if (key === 'DEL') {
        val = val.slice(0, -1);
    } else if (key === 'TOGGLE_BRACKET') {
        let openCount = (val.match(/\(/g) || []).length;
        let closeCount = (val.match(/\)/g) || []).length;
        let lastChar = val.slice(-1);
        if (openCount > closeCount && lastChar !== '(' && !['+', '-', '*', '/'].includes(lastChar)) {
            val += ')';
        } else {
            val += '(';
        }
    } else if (key === 'NEXT') {
        processBlur(activeInput);
        evaluateAllFieldsAndCompare();
        checkAndAutoSaveBackground();

        let currentIndex = inputSequence.indexOf(activeInput.id);
        let nextIndex = (currentIndex + 1) % inputSequence.length;
        let nextEl = document.getElementById(inputSequence[nextIndex]);
        
        setActiveInput(nextEl);

        let cardId = nextEl.id.includes('A') ? 'card_A' : (nextEl.id.includes('B') ? 'card_B' : 'card_C');
        let cardEl = document.getElementById(cardId);
        if (cardEl) {
            cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        return;
    } else {
        val += key;
    }

    activeInput.value = val;
    evaluateAllFieldsAndCompare();
    checkAndAutoSaveBackground();
}

// คำนวณสูตรคณิตศาสตร์แบบปลอดภัย
function evaluateExpression(expr) {
    if (!expr || typeof expr !== 'string') return NaN;
    try {
        let sanitized = expr.replace(/[^0-9+\-*/().]/g, '');
        if (!sanitized) return NaN;
        let result = Function('"use strict";return (' + sanitized + ')')();
        return typeof result === 'number' && isFinite(result) ? result : NaN;
    } catch (e) {
        return NaN;
    }
}

// คำนวณหน่วยและเปรียบเทียบ
function evaluateAllFieldsAndCompare() {
    let pA = evaluateExpression(document.getElementById('priceA').value);
    let wA = evaluateExpression(document.getElementById('weightA').value);
    let pB = evaluateExpression(document.getElementById('priceB').value);
    let wB = evaluateExpression(document.getElementById('weightB').value);
    let pC = evaluateExpression(document.getElementById('priceC').value);
    let wC = evaluateExpression(document.getElementById('weightC').value);

    let unitA = (wA > 0 && pA >= 0) ? pA / wA : NaN;
    let unitB = (wB > 0 && pB >= 0) ? pB / wB : NaN;
    let unitC = (wC > 0 && pC >= 0) ? pC / wC : NaN;

    document.getElementById('resultA').innerText = !isNaN(unitA) ? unitA.toFixed(2) + ' บาท/หน่วย' : '- บาท/หน่วย';
    document.getElementById('resultB').innerText = !isNaN(unitB) ? unitB.toFixed(2) + ' บาท/หน่วย' : '- บาท/หน่วย';
    document.getElementById('resultC').innerText = !isNaN(unitC) ? unitC.toFixed(2) + ' บาท/หน่วย' : '- บาท/หน่วย';

    let banner = document.getElementById('comparisonBanner');
    let validUnits = [];
    if (!isNaN(unitA)) validUnits.push({ name: 'สินค้า A', val: unitA });
    if (!isNaN(unitB)) validUnits.push({ name: 'สินค้า B', val: unitB });
    if (!isNaN(unitC)) validUnits.push({ name: 'สินค้า C', val: unitC });

    if (validUnits.length === 0) {
        banner.className = 'comparison-banner';
        banner.innerText = 'กรอกข้อมูลเพื่อเปรียบเทียบความคุ้มค่า';
        return;
    }

    validUnits.sort((a, b) => a.val - b.val);
    let best = validUnits[0];
    banner.className = 'comparison-banner best';
    banner.innerText = `🏆 คุ้มที่สุดคือ "${best.name}" (${best.val.toFixed(2)} บาท/หน่วย)`;
}

// บันทึกอัตโนมัติ
function checkAndAutoSaveBackground() {
    let data = {
        priceA: document.getElementById('priceA').value,
        weightA: document.getElementById('weightA').value,
        priceB: document.getElementById('priceB').value,
        weightB: document.getElementById('weightB').value,
        priceC: document.getElementById('priceC').value,
        weightC: document.getElementById('weightC').value,
    };
    localStorage.setItem('price_calc_autofill', JSON.stringify(data));
}

// ล้างค่าทั้งหมด
function clearAllFields() {
    ['priceA', 'weightA', 'priceB', 'weightB', 'priceC', 'weightC'].forEach(id => {
        document.getElementById(id).value = '';
    });
    localStorage.removeItem('price_calc_autofill');
    evaluateAllFieldsAndCompare();
    setActiveInput(document.getElementById('priceA'));
}

// ฟังก์ชันล้าง Cache / Service Worker เฉพาะกิจ (รักษา localStorage)
function forceAppUpdate() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (let registration of registrations) {
                registration.unregister();
            }
        });
    }
    caches.keys().then((names) => {
        for (let name of names) {
            caches.delete(name);
        }
    });
    alert('ล้างแคชและอัปเดตแอปสำเร็จ!');
    window.location.reload(true);
}

// ประวัติ (Mockup เบื้องต้น)
function openHistoryModal() {
    document.getElementById('historyModal').style.display = 'flex';
    let listEl = document.getElementById('historyList');
    listEl.innerHTML = '<p style="text-align:center; color:#64748b; padding:20px;">ยังไม่มีประวัติการบันทึก</p>';
}

function closeHistoryModal() {
    document.getElementById('historyModal').style.display = 'none';
}
