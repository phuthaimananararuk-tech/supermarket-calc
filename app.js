let activeInput = null;
let inputSequence = ['priceA', 'weightA', 'priceB', 'weightB', 'priceC', 'weightC'];

let originalValueBeforeFocus = "";
let userTypedInCurrentFocus = false;

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
    setActiveInput(defaultInput);
});

// ฟังก์ชันเลือกช่องกรอก (แก้ไขปัญหาระบบล็อกและจำค่าเดิมให้แม่นยำ)
function setActiveInput(inputEl) {
    if (!inputEl) return;
    
    // ถ้าจิ้มซ้ำช่องเดิมที่กำลังโฟกัสอยู่แล้ว ไม่ต้องทำอะไรเพิ่ม
    if (activeInput === inputEl) return;

    // ถ้ามีช่องเก่าค้างอยู่ ให้ตรวจสอบและเคลียร์ค่าเก่าก่อน
    if (activeInput) {
        handleBlurValidation(activeInput);
    }

    activeInput = inputEl;

    // บันทึกค่าปัจจุบันไว้ก่อนเคลียร์ (เฉพาะตอนที่ช่องยังไม่ถูกเคลียร์)
    originalValueBeforeFocus = inputEl.value;
    userTypedInCurrentFocus = false;

    document.querySelectorAll('input').forEach(i => i.classList.remove('active-focus'));
    inputEl.classList.add('active-focus');

    // เคลียร์ค่าให้ว่างเพื่อให้พิมพ์ใหม่ได้ทันที
    inputEl.value = "";
}

// ตรวจสอบเมื่อย้ายโฟกัสออก
function handleBlurValidation(input) {
    if (!input) return;

    // ถ้าไม่ได้พิมพ์อะไรเลย และช่องว่างเปล่า ➔ คืนค่าเดิมกลับมา
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
    evaluateAllFieldsAndCompare();
    checkAndAutoSaveBackground();
}

// ระบบกดปุ่มบนคีย์บอร์ด
function pressKey(key) {
    if (!activeInput) {
        setActiveInput(document.getElementById('priceA'));
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
        handleBlurValidation(activeInput);
        let currentIndex = inputSequence.indexOf(activeInput.id);
        let nextIndex = (currentIndex + 1) % inputSequence.length;
        let nextEl = document.getElementById(nextSequenceId(nextIndex));
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
