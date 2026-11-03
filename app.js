let currentCalculationResult = null;
let lastLoadedHistoryName = null;

// ข้อมูลสถานะคีย์บอร์ดที่กำลังเปิดอยู่
let activeInput = null;
let activeFieldTagText = "";
let currentProductGroup = "A";
let inputSequence = ['priceA', 'weightA', 'priceB', 'weightB', 'priceC', 'weightC'];

// โหลดข้อมูล Auto-Save ทันทีที่เปิดแอป
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

    // ปิดคีย์บอร์ดเมื่อแตะพื้นที่ว่างภายนอก
    document.addEventListener('click', (e) => {
        let kb = document.getElementById('calcKeyboard');
        if (!kb.classList.contains('hidden') && 
            !kb.contains(e.target) && 
            activeInput && !activeInput.contains(e.target)) {
            closeCalcKeyboard();
        }
    });
});

// ฟังก์ชันเปิด คีย์บอร์ดย่อย
function openCalcKeyboard(inputEl, productGroup, fieldType, tagText) {
    if (activeInput && activeInput !== inputEl) {
        handleBlurValidation(activeInput);
    }

    activeInput = inputEl;
    currentProductGroup = productGroup;
    activeFieldTagText = tagText;

    // ทำไฮไลต์ช่องที่กำลังเลือก
    document.querySelectorAll('input').forEach(i => i.classList.remove('active-focus'));
    inputEl.classList.add('active-focus');

    // อัปเดตป้ายบอกช่องและสีประจำสินค้า
    let tagEl = document.getElementById('calcFieldTag');
    tagEl.innerText = `🏷️ ${tagText}`;
    tagEl.className = `calc-field-tag badge-card-${productGroup.toLowerCase()}`;

    // แสดงคีย์บอร์ด
    document.getElementById('calcKeyboard').classList.remove('hidden');
    updatePreviewDisplay();

    // เลื่อนการ์ดสินค้าขึ้นมาให้อยู่ในระยะมองเห็น
    let cardEl = document.getElementById(`card_${productGroup}`);
    if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function closeCalcKeyboard() {
    if (activeInput) {
        handleBlurValidation(activeInput);
        activeInput.classList.remove('active-focus');
        activeInput = null;
    }
    document.getElementById('calcKeyboard').classList.add('hidden');
}

// ตรวจสอบเมื่อย้ายโฟกัส หากเป็น 0 ให้ล้างค่า
function handleBlurValidation(input) {
    let evalVal = evaluateExpression(input.value);
    if (!isNaN(evalVal) && evalVal === 0) {
        input.value = "";
    } else if (!isNaN(evalVal) && input.value.trim() !== "") {
        input.value = evalVal.toString();
    }
    evaluateAllFieldsAndCompare();
    checkAndAutoSaveBackground();
}

// ระบบกดปุ่มบน Custom Keyboard
function pressKey(key) {
    if (!activeInput) return;

    let val = activeInput.value;

    if (key === 'C') {
        val = '';
    } else if (key === 'DEL') {
        val = val.slice(0, -1);
    } else if (key === 'NEXT') {
        handleBlurValidation(activeInput);
        let currentIndex = inputSequence.indexOf(activeInput.id);
        let nextIndex = (currentIndex + 1) % inputSequence.length;
        let nextId = inputSequence[nextIndex];
        let nextEl = document.getElementById(nextId);
        
        let productGroup = nextId.includes('A') ? 'A' : (nextId.includes('B') ? 'B' : 'C');
        let fieldType = nextId.includes('price') ? 'price' : 'weight';
        let fieldName = fieldType === 'price' ? 'ราคา' : 'จำนวน';
        let tagText = `สินค้า ${productGroup} • ${fieldName}`;
        
        openCalcKeyboard(nextEl, productGroup, fieldType, tagText);
        return;
    } else {
        val += key;
    }

    activeInput.value = val;
    updatePreviewDisplay();
    evaluateAllFieldsAndCompare();
    checkAndAutoSaveBackground();
}

// อัปเดตแถบ Live Preview
function updatePreviewDisplay() {
    if (!activeInput) return;
    let rawVal = activeInput.value;
    let displayEl = document.getElementById('calcFormulaDisplay');

    if (!rawVal || rawVal.trim() === "") {
        displayEl.innerText = "0";
        return;
    }

    let evalVal = evaluateExpression(rawVal);
    if (!isNaN(evalVal) && rawVal !== evalVal.toString()) {
        displayEl.innerHTML = `${rawVal} <span class="calc-eval-result">(= ${evalVal})</span>`;
    } else {
        displayEl.innerText = rawVal;
    }
}

// คำนวณนิพจน์ทางคณิตศาสตร์อย่างปลอดภัย (รองรับ +, -, *, /, วงเล็บ)
function evaluateExpression(expr) {
    if (!expr || expr.trim() === "") return NaN;
    try {
        let sanitized = expr.replace(/[^0-9+\-*/().]/g, '');
        if (!sanitized) return NaN;
        let res = Function(`"use strict"; return (${sanitized})`)();
        return (typeof res === 'number' && !isNaN(res) && isFinite(res)) ? parseFloat(res.toFixed(4)) : NaN;
    } catch (e) {
        return NaN;
    }
}

function evaluateAllFieldsAndCompare() {
    comparePrice();
}

function checkAndAutoSaveBackground() {
    let priceA = evaluateExpression(document.getElementById('priceA').value);
    let weightA = evaluateExpression(document.getElementById('weightA').value);
    let priceB = evaluateExpression(document.getElementById('priceB').value);
    let weightB = evaluateExpression(document.getElementById('weightB').value);
    let priceC = evaluateExpression(document.getElementById('priceC').value);
    let weightC = evaluateExpression(document.getElementById('weightC').value);

    let validA = !isNaN(priceA) && !isNaN(weightA) && weightA > 0;
    let validB = !isNaN(priceB) && !isNaN(weightB) && weightB > 0;
    let validC = !isNaN(priceC) && !isNaN(weightC) && weightC > 0;
    let countValid = (validA ? 1 : 0) + (validB ? 1 : 0) + (validC ? 1 : 0);

    if (countValid >= 1 && currentCalculationResult) {
        let inputs = {
            priceA: document.getElementById('priceA').value,
            weightA: document.getElementById('weightA').value,
            priceB: document.getElementById('priceB').value,
            weightB: document.getElementById('weightB').value,
            priceC: document.getElementById('priceC').value,
            weightC: document.getElementById('weightC').value
        };
        localStorage.setItem('price_calc_autofill', JSON.stringify(inputs));
    } else {
        localStorage.removeItem('price_calc_autofill');
    }
}

function comparePrice() {
    let priceA = evaluateExpression(document.getElementById('priceA').value);
    let weightA = evaluateExpression(document.getElementById('weightA').value);
    let priceB = evaluateExpression(document.getElementById('priceB').value);
    let weightB = evaluateExpression(document.getElementById('weightB').value);
    let priceC = evaluateExpression(document.getElementById('priceC').value);
    let weightC = evaluateExpression(document.getElementById('weightC').value);

    let badgeA = document.getElementById('badgeA');
    let badgeB = document.getElementById('badgeB');
    let badgeC = document.getElementById('badgeC');
    let btnSave = document.getElementById('btnSave');

    badgeA.innerText = ''; badgeA.className = 'badge';
    badgeB.innerText = ''; badgeB.className = 'badge';
    badgeC.innerText = ''; badgeC.className = 'badge';

    let validA = !isNaN(priceA) && !isNaN(weightA) && weightA > 0;
    let validB = !isNaN(priceB) && !isNaN(weightB) && weightB > 0;
    let validC = !isNaN(priceC) && !isNaN(weightC) && weightC > 0;

    let countValid = (validA ? 1 : 0) + (validB ? 1 : 0) + (validC ? 1 : 0);

    if (countValid < 1) {
        btnSave.disabled = true;
        currentCalculationResult = null;
        return;
    }

    let items = [];
    if (validA) items.push({ id: 'A', name: 'สินค้า A', price: priceA, weight: weightA, unit: priceA / weightA, badge: badgeA });
    if (validB) items.push({ id: 'B', name: 'สินค้า B', price: priceB, weight: weightB, unit: priceB / weightB, badge: badgeB });
    if (validC) items.push({ id: 'C', name: 'สินค้า C', price: priceC, weight: weightC, unit: priceC / weightC, badge: badgeC });

    items.sort((x, y) => x.unit - y.unit);

    let best = items[0];
    best.badge.innerText = `คุ้มค่าที่สุด`;
    best.badge.classList.add('badge-best');

    for (let i = 1; i < items.length; i++) {
        let item = items[i];
        let diffPercent = ((best.unit - item.unit) / best.unit) * 100; 
        item.badge.innerText = `${diffPercent.toFixed(0)}%`;
        item.badge.classList.add('badge-worse');
    }

    currentCalculationResult = { 
        inputs: {
            priceA: document.getElementById('priceA').value,
            weightA: document.getElementById('weightA').value,
            priceB: document.getElementById('priceB').value,
            weightB: document.getElementById('weightB').value,
            priceC: document.getElementById('priceC').value,
            weightC: document.getElementById('weightC').value
        },
        items, 
        best 
    };
    btnSave.disabled = false;
}

function clearFields() {
    document.getElementById('priceA').value = '';
    document.getElementById('weightA').value = '';
    document.getElementById('priceB').value = '';
    document.getElementById('weightB').value = '';
    document.getElementById('priceC').value = '';
    document.getElementById('weightC').value = '';
    
    document.getElementById('badgeA').innerText = ''; document.getElementById('badgeA').className = 'badge';
    document.getElementById('badgeB').innerText = ''; document.getElementById('badgeB').className = 'badge';
    document.getElementById('badgeC').innerText = ''; document.getElementById('badgeC').className = 'badge';
    
    document.getElementById('btnSave').disabled = true;
    currentCalculationResult = null;
    lastLoadedHistoryName = null;
    closeCalcKeyboard();
    localStorage.removeItem('price_calc_autofill');
}

function promptSaveRecord() {
    if (!currentCalculationResult) return;

    let defaultName = lastLoadedHistoryName || "";
    let productName = prompt("กรอกชื่อสินค้าที่ต้องการบันทึก (เช่น น้ำยาปรับผ้านุ่ม):", defaultName);
    if (!productName || productName.trim() === "") return;

    let cleanName = productName.trim();
    let history = JSON.parse(localStorage.getItem('price_calc_history') || '[]');

    let existingIndex = history.findIndex(item => item.name.toLowerCase() === cleanName.toLowerCase());
    
    if (existingIndex !== -1) {
        let confirmOverwrite = confirm(`⚠️ มีชื่อ "${cleanName}" ในประวัติอยู่แล้ว! ต้องการเซฟทับรายการเดิมหรือไม่?`);
        if (!confirmOverwrite) {
            setTimeout(() => promptSaveRecord(), 100);
            return;
        }
        history.splice(existingIndex, 1);
    }

    let record = {
        id: Date.now(),
        name: cleanName,
        date: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }),
        inputs: currentCalculationResult.inputs,
        bestUnit: currentCalculationResult.best.unit,
        bestName: currentCalculationResult.best.name
    };

    history.unshift(record);
    if (history.length > 20) history.pop();

    localStorage.setItem('price_calc_history', JSON.stringify(history));
    alert("✅ บันทึกข้อมูลเรียบร้อยแล้ว!");
}

function openHistoryModal() {
    let modal = document.getElementById('historyModal');
    let listContainer = document.getElementById('historyList');
    
    let history = JSON.parse(localStorage.getItem('price_calc_history') || '[]');

    if (history.length === 0) {
        listContainer.innerHTML = `<p class="empty-history">ยังไม่มีประวัติการบันทึก</p>`;
    } else {
        listContainer.innerHTML = history.map(item => `
            <div class="history-item">
                <div class="history-info" onclick="loadHistoryItem(${item.id})" style="cursor: pointer; flex-grow: 1;">
                    <strong>${item.name}</strong>
                    <small>${item.date} — แนะนำ ${item.bestName} (${item.bestUnit.toFixed(2)} บ./หน่วย)</small>
                </div>
                <div class="history-actions" style="display: flex; gap: 4px;">
                    <button onclick="editHistoryItem(event, ${item.id})" class="btn-edit">แก้ไข</button>
                    <button onclick="deleteHistoryItem(event, ${item.id})" class="btn-del">ลบ</button>
                </div>
            </div>
        `).join('');
    }

    closeCalcKeyboard();
    modal.classList.remove('hidden');
}

function closeHistoryModal() {
    document.getElementById('historyModal').classList.add('hidden');
}

function editHistoryItem(event, id) {
    event.stopPropagation();
    let history = JSON.parse(localStorage.getItem('price_calc_history') || '[]');
    let target = history.find(item => item.id === id);
    if (!target) return;

    let newName = prompt("กรอกชื่อใหม่สำหรับบันทึกนี้:", target.name);
    if (newName === null) return;
    
    let cleanNewName = newName.trim();
    if (cleanNewName === "") return;

    let existingIndex = history.findIndex(item => item.name.toLowerCase() === cleanNewName.toLowerCase() && item.id !== id);
    if (existingIndex !== -1) {
        alert(`❌ มีชื่อ "${cleanNewName}" ในประวัติอยู่แล้ว!`);
        return;
    }

    target.name = cleanNewName;
    localStorage.setItem('price_calc_history', JSON.stringify(history));
    openHistoryModal();
}

function loadHistoryItem(id) {
    let history = JSON.parse(localStorage.getItem('price_calc_history') || '[]');
    let target = history.find(item => item.id === id);
    if (!target) return;

    document.getElementById('priceA').value = target.inputs.priceA || '';
    document.getElementById('weightA').value = target.inputs.weightA || '';
    document.getElementById('priceB').value = target.inputs.priceB || '';
    document.getElementById('weightB').value = target.inputs.weightB || '';
    document.getElementById('priceC').value = target.inputs.priceC || '';
    document.getElementById('weightC').value = target.inputs.weightC || '';

    lastLoadedHistoryName = target.name;

    checkAndAutoSaveBackground();
    closeHistoryModal();
    evaluateAllFieldsAndCompare();
}

function deleteHistoryItem(event, id) {
    event.stopPropagation();
    let history = JSON.parse(localStorage.getItem('price_calc_history') || '[]');
    let target = history.find(item => item.id === id);
    let nameText = target ? ` "${target.name}"` : '';

    if (confirm(`คุณต้องการลบประวัติรายการ${nameText} ใช่หรือไม่?`)) {
        history = history.filter(item => item.id !== id);
        localStorage.setItem('price_calc_history', JSON.stringify(history));
        openHistoryModal();
    }
}

// ฟังก์ชันอัปเดตระบบ: ล้างเฉพาะ Cache และ Service Worker โดยไม่ยุ่งกับ localStorage ของผู้ใช้
async function forceAppUpdate() {
    if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
            await registration.unregister();
        }
    }
    window.location.reload();
}
