function comparePrice() {
    let priceA = parseFloat(document.getElementById('priceA').value);
    let weightA = parseFloat(document.getElementById('weightA').value);
    let priceB = parseFloat(document.getElementById('priceB').value);
    let weightB = parseFloat(document.getElementById('weightB').value);
    let priceC = parseFloat(document.getElementById('priceC').value);
    let weightC = parseFloat(document.getElementById('weightC').value);

    let resultCard = document.getElementById('resultCard');
    let resultText = document.getElementById('resultText');
    let resultDetail = document.getElementById('resultDetail');

    // เงื่อนไข: ต้องกรอกอย่างน้อย 2 ชิ้นขึ้นไปถึงจะเริ่มเทียบความคุ้มค่าให้
    let validA = !isNaN(priceA) && !isNaN(weightA) && weightA > 0;
    let validB = !isNaN(priceB) && !isNaN(weightB) && weightB > 0;
    let validC = !isNaN(priceC) && !isNaN(weightC) && weightC > 0;

    let countValid = (validA ? 1 : 0) + (validB ? 1 : 0) + (validC ? 1 : 0);

    if (countValid < 2) {
        resultCard.classList.add('hidden');
        return;
    }

    // คำนวณราคาต่อหน่วย (เก็บข้อมูลเฉพาะอันที่กรอกครบ)
    let items = [];
    if (validA) items.push({ name: 'สินค้า A', unit: priceA / weightA });
    if (validB) items.push({ name: 'สินค้า B', unit: priceB / weightB });
    if (validC) items.push({ name: 'สินค้า C', unit: priceC / weightC });

    // เรียงลำดับจากถูกที่สุดไปแพงที่สุด
    items.sort((x, y) => x.unit - y.unit);

    let best = items[0];
    let second = items[1];

    resultCard.classList.remove('hidden');
    resultCard.className = "result-card success";

    let savePercent = ((second.unit - best.unit) / second.unit) * 100;
    
    // สร้างข้อความสรุปผล
    resultText.innerText = `🎉 ${best.name} คุ้มที่สุด!`;
    
    let detailsText = `${best.name} (${best.unit.toFixed(2)} บ./หน่วย) ถูกกว่าอันดับรองลงมาประมาณ ${savePercent.toFixed(1)}%\n`;
    detailsText += `สรุปราคาต่อหน่วย: ` + items.map(i => `${i.name}: ${i.unit.toFixed(2)} บ.`).join(' | ');
    
    resultDetail.innerText = detailsText;
}

function clearFields() {
    document.getElementById('priceA').value = '';
    document.getElementById('weightA').value = '';
    document.getElementById('priceB').value = '';
    document.getElementById('weightB').value = '';
    document.getElementById('priceC').value = '';
    document.getElementById('weightC').value = '';
    
    let resultCard = document.getElementById('resultCard');
    if (resultCard) {
        resultCard.classList.add('hidden');
    }
}
