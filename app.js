function comparePrice() {
    // 1. ดึงค่าจากช่องกรอกข้อมูล
    let priceA = parseFloat(document.getElementById('priceA').value);
    let weightA = parseFloat(document.getElementById('weightA').value);
    let priceB = parseFloat(document.getElementById('priceB').value);
    let weightB = parseFloat(document.getElementById('weightB').value);

    // 2. ดึงกล่องแสดงผลลัพธ์มาเตรียมไว้
    let resultCard = document.getElementById('resultCard');
    let resultText = document.getElementById('resultText');
    let resultDetail = document.getElementById('resultDetail');

    // 3. ตรวจสอบข้อมูลก่อนคำนวณ (ถ้าไม่ครบให้แจ้งเตือน)
    if (isNaN(priceA) || isNaN(weightA) || isNaN(priceB) || isNaN(weightB) || weightA <= 0 || weightB <= 0) {
        resultCard.className = "result-card";
        resultCard.classList.remove('hidden');
        resultText.innerText = "❌ ข้อมูลไม่ครบ";
        resultDetail.innerText = "กรุณากรอกตัวเลขให้ครบทั้งราคาและปริมาณ";
        return;
    }

    // 4. คำนวณหาตัวที่คุ้มที่สุด
    let unitA = priceA / weightA;
    let unitB = priceB / weightB;
    
    // เปิดแสดงกล่องผลลัพธ์
    resultCard.classList.remove('hidden');

    if (unitA < unitB) {
        let savePercent = ((unitB - unitA) / unitB) * 100;
        resultCard.className = "result-card success";
        resultText.innerText = "🎉 สินค้า A คุ้มกว่า!";
        resultDetail.innerText = `ชิ้น A ถูกกว่า ชิ้น B อยู่ประมาณ ${savePercent.toFixed(1)}%`;
    } else if (unitB < unitA) {
        let savePercent = ((unitA - unitB) / unitA) * 100;
        resultCard.className = "result-card success";
        resultText.innerText = "🎉 สินค้า B คุ้มกว่า!";
        resultDetail.innerText = `ชิ้น B ถูกกว่า ชิ้น A อยู่ประมาณ ${savePercent.toFixed(1)}%`;
    } else {
        resultCard.className = "result-card";
        resultText.innerText = "⚖️ ราคาเท่ากัน";
        resultDetail.innerText = "ความคุ้มค่าต่อหน่วยไม่ต่างกันครับ";
    }
}

function clearFields() {
    document.getElementById('priceA').value = '';
    document.getElementById('weightA').value = '';
    document.getElementById('priceB').value = '';
    document.getElementById('weightB').value = '';
    
    let resultCard = document.getElementById('resultCard');
    if (resultCard) {
        resultCard.classList.add('hidden');
    }
}
