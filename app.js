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

    // เคลียร์สถานะป้ายกำกับเดิมก่อน
    badgeA.innerText = ''; badgeA.className = 'badge';
    badgeB.innerText = ''; badgeB.className = 'badge';
    badgeC.innerText = ''; badgeC.className = 'badge';

    let validA = !isNaN(priceA) && !isNaN(weightA) && weightA > 0;
    let validB = !isNaN(priceB) && !isNaN(weightB) && weightB > 0;
    let validC = !isNaN(priceC) && !isNaN(weightC) && weightC > 0;

    let countValid = (validA ? 1 : 0) + (validB ? 1 : 0) + (validC ? 1 : 0);

    // ต้องกรอกอย่างน้อย 2 ชิ้นถึงจะเริ่มเทียบ
    if (countValid < 2) return;

    let items = [];
    if (validA) items.push({ id: 'A', unit: priceA / weightA, badge: badgeA });
    if (validB) items.push({ id: 'B', unit: priceB / weightB, badge: badgeB });
    if (validC) items.push({ id: 'C', unit: priceC / weightC, badge: badgeC });

    // เรียงจากถูกที่สุดไปแพงที่สุด
    items.sort((x, y) => x.unit - y.unit);

    let best = items[0];

    // แสดงผลตัวที่คุ้มที่สุด
    best.badge.innerText = `คุ้มค่าที่สุด`;
    best.badge.classList.add('badge-best');

    // แสดงผลเปรียบเทียบตัวอื่นๆ เป็นเปอร์เซ็นต์ส่วนต่างติดลบ
    for (let i = 1; i < items.length; i++) {
        let item = items[i];
        let diffPercent = ((best.unit - item.unit) / best.unit) * 100; // ได้ค่าติดลบ เช่น -11%
        item.badge.innerText = `${diffPercent.toFixed(0)}%`;
        item.badge.classList.add('badge-worse');
    }
}

function clearFields() {
    document.getElementById('priceA').value = '';
    document.getElementById('weightA').value = '';
    document.getElementById('priceB').value = '';
    document.getElementById('weightB').value = '';
    document.getElementById('priceC').value = '';
    document.getElementById('weightC').value = '';
    
    let badgeA = document.getElementById('badgeA');
    let badgeB = document.getElementById('badgeB');
    let badgeC = document.getElementById('badgeC');

    badgeA.innerText = ''; badgeA.className = 'badge';
    badgeB.innerText = ''; badgeB.className = 'badge';
    badgeC.innerText = ''; badgeC.className = 'badge';
}
