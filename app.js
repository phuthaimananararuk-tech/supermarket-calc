let activeInput = null;
let inputSequence = ['priceA', 'weightA', 'priceB', 'weightB', 'priceC', 'weightC'];

// ตัวแปรสำหรับจำค่าเดิมและเช็คสถานะการพิมพ์ (พฤติกรรมแบบ v2.0)
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

    let defaultInput = document.getElementById('priceA');
    setActiveInput(defaultInput);
});

// ฟังก์ชันเลือกช่องกรอก (v2.0 Logic: จิ้มปุ๊บตัวเลขหาย จำค่าเดิมไว้)
function setActiveInput(inputEl) {
    if (!inputEl) return;

    if (activeInput && activeInput !== inputEl) {
        handleBlurValidation(activeInput);
    }

    activeInput = inputEl;

    // บันทึกค่าเดิมก่อนเคลียร์ และรีเซ็ตสถานะการพิมพ์
    originalValueBeforeFocus = inputEl.value;
    userTypedInCurrentFocus = false;

    document.querySelectorAll('input').forEach(i => i.classList.remove('active-focus'));
    inputEl.classList.add('active-focus');

    // เคลียร์ค่าชั่วคราวให้ว่างทันทีที่จิ้ม
    inputEl.value = "";
}

// ตรวจสอบเมื่อย้ายโฟกัส (ถ้าไม่ได้พิมพ์อะไรเลย แล้วย้ายหนี ให้คืนค่าเดิมกลับมา)
function handleBlurValidation(input) {
    if (!input) return;

    // ถ้าไม่ได้พิมพ์อะไรเลยในช่วงที่โฟกัส และช่องว่างเปล่า ➔ คืนค่าเดิมกลับมา
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

    // หากมีการกดปุ่มใดๆ (ที่ไม่ใช่ NEXT) ให้ถือว่าผู้เริ่มพิมพ์/แก้ไขแล้ว
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
