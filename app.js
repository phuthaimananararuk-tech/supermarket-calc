let activeInput = null;
let inputSequence = ['priceA', 'weightA', 'priceB', 'weightB', 'priceC', 'weightC'];

let originalValueBeforeFocus = "";
let userTypedInCurrentFocus = false;

// โหลดข้อมูล Auto-Save ทันทีที่เปิดแอป และตั้งค่า Default Focus
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

    // กำหนดค่าเริ่มต้น แต่ยังไม่บังคับล็อกโฟกัสค้าง
    let defaultInput = document.getElementById('priceA');
    // ให้เซ็ตค่าเฉยๆ ไม่เรียก setActiveInput ซ้อนตอนโหลด เพื่อป้องกันบล็อก
    activeInput = defaultInput;
    defaultInput.classList.add('active-focus');
    originalValueBeforeFocus = defaultInput.value;
    defaultInput.value = "";
});

// ฟังก์ชันเลือกช่องกรอก (เวอร์ชันปลอดภัย ไร้ลูปค้าง)
function setActiveInput(inputEl) {
    if (!inputEl) return;
    
    // ถ้าจิ้มช่องเดิมที่กำลังเลือกอยู่แล้ว ไม่ต้องทำอะไร
    if (activeInput === inputEl) return;

    // 1. ตรวจสอบและเคลียร์ค่าช่องเก่า (ถ้ามี)
    if (activeInput) {
        processBlur(activeInput);
    }

    // 2. สลับมาเป็นช่องใหม่
    activeInput = inputEl;
    userTypedInCurrentFocus = false;

    // เอาไฮไลต์ออกจากทุกช่อง แล้วใส่ให้ช่องใหม่
    document.querySelectorAll('input').forEach(i => i.classList.remove('active-focus'));
    inputEl.classList.add('active-focus');

    // 3. จำค่าเดิมไว้ แล้วเคลียร์ช่องให้ว่างเพื่อรอพิมพ์
    originalValueBeforeFocus = inputEl.value;
    inputEl.value = "";
}

// แยกฟังก์ชันประมวลผลตอนย้ายออก ป้องกันการเรียกซ้ำซ้อน
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

// ฟังก์ชันสำหรับเรียกตอนจำเป็นต้องตรวจสอบค่าทั้งหมด
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
        // บันทึกและตรวจสอบค่าช่องปัจจุบันก่อนย้าย
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

function nextSequenceId(index) {
    return inputSequence[index];
}
