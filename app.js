{\rtf1\ansi\ansicpg1252\cocoartf2908
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 function comparePrice() \{\
    let priceA = parseFloat(document.getElementById('priceA').value);\
    let weightA = parseFloat(document.getElementById('weightA').value);\
    let priceB = parseFloat(document.getElementById('priceB').value);\
    let weightB = parseFloat(document.getElementById('weightB').value);\
\
    let resultCard = document.getElementById('resultCard');\
    let resultText = document.getElementById('resultText');\
    let resultDetail = document.getElementById('resultDetail');\
\
    if (!priceA || !weightA || !priceB || !weightB || weightA <= 0 || weightB <= 0) \{\
        resultCard.className = "result-card";\
        resultCard.classList.remove('hidden');\
        resultText.innerText = "\uc0\u10060  \u3586 \u3657 \u3629 \u3617 \u3641 \u3621 \u3652 \u3617 \u3656 \u3588 \u3619 \u3610 ";\
        resultDetail.innerText = "\uc0\u3585 \u3619 \u3640 \u3603 \u3634 \u3585 \u3619 \u3629 \u3585 \u3651 \u3627 \u3657 \u3588 \u3619 \u3610 \u3607 \u3633 \u3657 \u3591 \u3619 \u3634 \u3588 \u3634 \u3649 \u3621 \u3632 \u3611 \u3619 \u3636 \u3617 \u3634 \u3603 ";\
        return;\
    \}\
\
    let unitA = priceA / weightA;\
    let unitB = priceB / weightB;\
    resultCard.classList.remove('hidden');\
\
    if (unitA < unitB) \{\
        let savePercent = ((unitB - unitA) / unitB) * 100;\
        resultCard.className = "result-card success";\
        resultText.innerText = "\uc0\u55356 \u57225  \u3626 \u3636 \u3609 \u3588 \u3657 \u3634  A \u3588 \u3640 \u3657 \u3617 \u3585 \u3623 \u3656 \u3634 !";\
        resultDetail.innerText = `\uc0\u3594 \u3636 \u3657 \u3609  A \u3606 \u3641 \u3585 \u3585 \u3623 \u3656 \u3634  \u3594 \u3636 \u3657 \u3609  B \u3629 \u3618 \u3641 \u3656  $\{savePercent.toFixed(1)\}%`;\
    \} else if (unitB < unitA) \{\
        let savePercent = ((unitA - unitB) / unitA) * 100;\
        resultCard.className = "result-card success";\
        resultText.innerText = "\uc0\u55356 \u57225  \u3626 \u3636 \u3609 \u3588 \u3657 \u3634  B \u3588 \u3640 \u3657 \u3617 \u3585 \u3623 \u3656 \u3634 !";\
        resultDetail.innerText = `\uc0\u3594 \u3636 \u3657 \u3609  B \u3606 \u3641 \u3585 \u3585 \u3623 \u3656 \u3634  \u3594 \u3636 \u3657 \u3609  A \u3629 \u3618 \u3641 \u3656  $\{savePercent.toFixed(1)\}%`;\
    \} else \{\
        resultCard.className = "result-card";\
        resultText.innerText = "\uc0\u9878 \u65039  \u3619 \u3634 \u3588 \u3634 \u3648 \u3607 \u3656 \u3634 \u3585 \u3633 \u3609 ";\
        resultDetail.innerText = "\uc0\u3588 \u3623 \u3634 \u3617 \u3588 \u3640 \u3657 \u3617 \u3588 \u3656 \u3634 \u3605 \u3656 \u3629 \u3627 \u3609 \u3656 \u3623 \u3618 \u3652 \u3617 \u3656 \u3605 \u3656 \u3634 \u3591 \u3585 \u3633 \u3609 \u3588 \u3619 \u3633 \u3610 ";\
    \}\
\}\
\
function clearFields() \{\
    document.getElementById('priceA').value = '';\
    document.getElementById('weightA').value = '';\
    document.getElementById('priceB').value = '';\
    document.getElementById('weightB').value = '';\
    document.getElementById('resultCard').classList.add('hidden');\
\}}