const searchBtn = document.getElementById("searchBtn");
const printBtn = document.getElementById("printBtn");

let currentStudent = null;

searchBtn.addEventListener("click", async () => {
    const civil = document.getElementById("civil").value.trim();
    const status = document.getElementById("status");
    const studentName = document.getElementById("studentName");
    const studentClass = document.getElementById("studentClass");
    const gradesList = document.getElementById("gradesList");
    const encouragement = document.getElementById("encouragement");

    status.innerHTML = "";
    studentName.innerHTML = "";
    studentClass.innerHTML = "";
    gradesList.innerHTML = "";
    encouragement.innerHTML = "";
    currentStudent = null;

    if (!civil) { 
        status.innerHTML = "الرجاء إدخال الرقم المدني"; 
        return; 
    }

    const files = ["grade5.json","grade6.json","grade7.json","grade8.json","grade9.json"];
    let foundStudent = null;

    for (const file of files) {
        try {
            const res = await fetch(file + "?time=" + Date.now());
            if (!res.ok) continue;
            const data = await res.json();
            const student = data.find(s => s["رقم_مدني"].toString().trim() === civil);
            if (student) {
                foundStudent = student;
                break;
            }
        } catch (err) { 
            console.warn("خطأ في قراءة:", file, err); 
        }
    }

    if (!foundStudent) { 
        status.innerHTML = "لم يتم العثور على الرقم المدني في أي صف."; 
        return; 
    }

    currentStudent = foundStudent;
    studentName.innerHTML = `الطالب: ${foundStudent["الاسم"]}`;
    studentClass.innerHTML = `الصف والشعبة: ${foundStudent["الصف"]} - ${foundStudent["الشعبة"]}`;

    let total = 0, count = 0;
    let html = "<table><tr><th>المادة</th><th>الدرجة</th><th>ملاحظات</th></tr>";

    for (const key in foundStudent) {
        if (!["رقم_مدني","الاسم","الصف","الشعبة"].includes(key)) {

            let grade = parseFloat(foundStudent[key]);
            let advice = grade >= 90 ? "ممتاز جدًا" :
                         grade >= 75 ? "جيد جدًا" :
                         grade >= 50 ? "مقبول" : "ضعيف";

            // 🔵 جميع الصفوف باللون الأخضر الفاتح
            let rowColor = "style='background-color:#d4f9d4;'";

            html += `<tr ${rowColor}><td>${key}</td><td>${grade}</td><td>${advice}</td></tr>`;

            total += grade;
            count++;
        }
    }

    html += "</table>";
    gradesList.innerHTML = `<div style="overflow-x:auto;">${html}</div>`;

    let avg = total / count;
    let msg = avg >= 90 ? "أداء ممتاز جداً" :
              avg >= 75 ? "مستوى جيد جداً" :
              avg >= 50 ? "مستوى مقبول" : "المستوى ضعيف";
    encouragement.innerHTML = `<strong>متوسطك العام: ${avg.toFixed(2)}</strong> - ${msg}`;
});

// طباعة الكشف
printBtn.addEventListener("click", () => {
    if (!currentStudent) { 
        alert("الرجاء عرض درجات الطالب أولاً قبل الطباعة."); 
        return; 
    }

    const printContent = `
        <div style="text-align:center; font-family:Arial;">
            <h1>صلالة الشرقية للتعليم الأساسي</h1>
            <h2>الفصل الدراسي الثاني 2025-2026</h2>
            <p><strong>الطالب:</strong> ${currentStudent["الاسم"]}</p>
            <p><strong>الرقم المدني:</strong> ${currentStudent["رقم_مدني"]}</p>
            <p><strong>الصف والشعبة:</strong> ${currentStudent["الصف"]} - ${currentStudent["الشعبة"]}</p>
            <p><strong>متوسطك العام:</strong> ${document.getElementById("encouragement").innerText}</p>
            ${document.getElementById("gradesList").innerHTML}
        </div>
    `;

    const printWindow = window.open('', '', 'height=700,width=800');
    printWindow.document.write('<html><head><title>كشف الدرجات</title>');
    printWindow.document.write('<style>table {width:100%; border-collapse:collapse;} th, td {border:1px solid #00796b; padding:8px; text-align:center;} th {background-color:#004d40; color:white;} body{font-family:Arial;} td{background:#d4f9d4;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
});
