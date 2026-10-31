let currentCalculationResult = null;
let fieldState = {};

// โหลดข้อมูล Auto-Save เมื่อเปิดแอป
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
            comparePrice();
        } catch (e) {}
    }
});

function saveAutoState() {
    let inputs = {
        priceA: document.getElementById('priceA').value,
        weightA: document.getElementById('weightA').value,
        priceB: document.getElementById('priceB').value,
        weightB: document.getElementById('weightB').value,
        priceC: document.getElementById('priceC').value,
        weightC: document.getElementById('weightC').value
    };
    localStorage.setItem('price_calc_autofill', JSON.stringify(inputs));
}

function handleFocus(input) {
    fieldState[input.id] = {
        initialValue: input.value,
        isTouched: false
    };
    input.value = "";
}

function handleInputChange(input) {
    // ถ้าผู้ใช้พิมพ์เลข 0 ให้ล้างข้อมูลในช่องนั้นทันที
    if (input.value === "0") {
        input.value = "";
    }

    if (fieldState[input.id]) {
        fieldState[input.id].isTouched = true;
    }
    saveAutoState();
    comparePrice();
}

function handleBlur(input) {
    let state = fieldState[input.id];
    if (state && !state.isTouched && input.value === "" && state.initialValue !== "") {
        input.value = state.initialValue;
        comparePrice();
    } else {
        saveAutoState();
        comparePrice();
    }
}

function comparePrice() {
    let priceA = parseFloat(document.getElementById('priceA').value);
    let weightA = parseFloat(document.getElementById('weightA').value);
    let priceB = parseFloat(document.getElementById('priceB').value);
    let weightB = parseFloat(document.getElementById('weightB').value);
    let priceC = parseFloat(document.getElementById('priceC').value);
    let weightC = parseFloat(document.getElementById('weightC').value);

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
        inputs: { priceA, weightA, priceB, weightB, priceC, weightC },
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
    fieldState = {};
    localStorage.removeItem('price_calc_autofill');
}

function promptSaveRecord() {
    if (!currentCalculationResult) return;

    let productName = prompt("กรอกชื่อสินค้าที่ต้องการบันทึก (เช่น น้ำยาปรับผ้านุ่ม):");
    if (!productName || productName.trim() === "") return;

    let cleanName = productName.trim();
    let history = JSON.parse(localStorage.getItem('price_calc_history') || '[]');

    let existingIndex = history.findIndex(item => item.name.toLowerCase() === cleanName.toLowerCase());
    
    if (existingIndex !== -1) {
        let confirmOverwrite = confirm(`❌ มีชื่อ "${cleanName}" ในประวัติอยู่แล้ว!\nต้องการเซฟทับรายการเดิมหรือไม่?`);
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
                <button onclick="deleteHistoryItem(event, ${item.id})" class="btn-del">ลบ</button>
            </div>
        `).join('');
    }

    modal.classList.remove('hidden');
}

function closeHistoryModal() {
    document.getElementById('historyModal').classList.add('hidden');
}

function loadHistoryItem(id) {
    let history = JSON.parse(localStorage.getItem('price_calc_history') || '[]');
    let target = history.find(item => item.id === id);
    if (!target) return;

    document.getElementById('priceA').value = isNaN(target.inputs.priceA) ? '' : target.inputs.priceA;
    document.getElementById('weightA').value = isNaN(target.inputs.weightA) ? '' : target.inputs.weightA;
    document.getElementById('priceB').value = isNaN(target.inputs.priceB) ? '' : target.inputs.priceB;
    document.getElementById('weightB').value = isNaN(target.inputs.weightB) ? '' : target.inputs.weightB;
    document.getElementById('priceC').value = isNaN(target.inputs.priceC) ? '' : target.inputs.priceC;
    document.getElementById('weightC').value = isNaN(target.inputs.weightC) ? '' : target.inputs.weightC;

    saveAutoState();
    closeHistoryModal();
    comparePrice();
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
    window.location.reload(true);
}
