function comparePrice() {
    let priceA = parseFloat(document.getElementById('priceA').value);
    let weightA = parseFloat(document.getElementById('weightA').value);
    let priceB = parseFloat(document.getElementById('priceB').value);
    let weightB = parseFloat(document.getElementById('weightB').value);

    let resultCard = document.getElementById('resultCard');
    let resultText = document.getElementById('resultText');
    let resultDetail = document.getElementById('resultDetail');

    // ถ้ายังกรอกข้อมูลไม่ครบทุกช่อง ให้ซ่อนการ์ดผลลัพธ์ไว้ก่อน
    if (isNaN(priceA) || isNaN(weightA) || isNaN(priceB) || isNaN(weightB) || weightA <= 0 || weightB <= 0) {
        resultCard.classList.add('hidden');
        return;
    }

    let unitA = priceA / weightA;
    let unitB = priceB / weightB;
    
    resultCard.classList.remove('hidden');

    if (unitA < unitB) {
        let savePercent = ((unitB - unitA) / unitB) * 100;
        resultCard.className = "result-card success";
        resultText.innerText = "🎉 สินค้า A คุ้มกว่า!";
        resultDetail.innerText = `A ถูกกว่า B ประมาณ ${savePercent.toFixed(1)}% (A: ${unitA.toFixed(2)} บาท/หน่วย vs B: ${unitB.toFixed(2)} บาท/หน่วย)`;
    } else if (unitB < unitA) {
        let savePercent = ((unitA - unitB) / unitA) * 100;
        resultCard.className = "result-card success";
        resultText.innerText = "🎉 สินค้า B คุ้มกว่า!";
        resultDetail.innerText = `B ถูกกว่า A ประมาณ ${savePercent.toFixed(1)}% (B: ${unitB.toFixed(2)} บาท/หน่วย vs A: ${unitA.toFixed(2)} บาท/หน่วย)`;
    } else {
        resultCard.className = "result-card";
        resultText.innerText = "⚖️ ราคาคุ้มค่าเท่ากัน";
        resultDetail.innerText = `ตกหน่วยละ ${unitA.toFixed(2)} บาทเท่ากันครับ`;
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
