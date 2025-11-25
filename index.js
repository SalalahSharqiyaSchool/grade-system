let currentStudent = null;

async function showGrades() {
    const civil = document.getElementById("civil").value.trim();
    const status = document.getElementById("status");
    const studentInfo = document.getElementById("studentInfo");
    const gradesList = document.getElementById("gradesList");
    const encouragement = document.getElementById("encouragement");

    status.innerHTML = "";
    studentInfo.innerHTML = "";
    gradesList.innerHTML = "";
    encouragement.innerHTML = "";
    currentStudent = null;

    if (!civil) { status.innerHTML = "الرجاء إدخال الرقم المدني"; return; }

    const files = ["grade5.json","grade6.json","grade7.json","grade8.json","grade9.json"];
    let foundStudent = null;

    for (const file of files) {
        try {
            const res = await fetch(file + "?time=" + Date.now());
            if (!res.ok) continue;
            const data = await res.json();
            const student = data.find(s => s["رقم_مدني"].toString().trim() === civil);
            if (student) { foundStudent = student; break; }
        } catch (err) { console.warn("خطأ في قراءة:", file, err); }
    }

    if (!foundStudent) { status.innerHTML = "لم يتم العثور على الرقم المدني في أي صف."; return; }

    currentStudent = foundStudent;

    // بيانات الطالب والصف والشعبة
    studentInfo.innerHTML = `
        <strong>الطالب:</strong> ${foundStudent["الاسم"]} &nbsp;&nbsp;
        <strong>الرقم المدني:</strong> ${foundStudent["رقم_مدني"]} <br>
        <strong>الصف:</strong> ${foundStudent["الصف"]} &nbsp;&nbsp;
        <strong>الشعبة:</strong> ${foundStudent["الشعبة"]} 
    `;

    // جدول المواد والدرجات والملاحظات
    let total = 0, count = 0;
    let html = "<table><tr><th>المادة</th><th>الدرجة</th><th>ملاحظات</th></tr>";
    for (const key in foundStudent) {
        if (!["رقم_مدني","الاسم","الصف","الشعبة"].includes(key)) {
            let grade = parseFloat(foundStudent[key]);
            let advice = grade >= 90 ? "ممتاز جدًا" :
                         grade >= 75 ? "جيد جدًا" :
                         grade >= 50 ? "مقبول" : "ضعيف";
            html += `<tr><td>${key}</td><td>${grade}</td><td>${advice}</td></tr>`;
            total += grade; count++;
        }
    }
    html += "</table>";
    gradesList.innerHTML = html;

    // متوسط ونصيحة عامة
    let avg = total / count;
    encouragement.innerHTML = `متوسطك العام: ${avg.toFixed(2)} - نصيحة: راجع المواد التي تحتاج تحسين`;
}

// دالة الطباعة
function printGrades() {
    if (!currentStudent) { alert("الرجاء عرض درجات الطالب أولاً."); return; }

    const container = document.createElement("div");
    container.innerHTML = `
        <div style="text-align:center; font-weight:bold; font-size:18px; margin-bottom:10px;">
            صلالة الشرقية للتعليم الأساسي
        </div>
        <div style="text-align:right; font-size:12px;">
            محافظة ظفار<br>
            الفصل الدراسي الأول 2025-2026
        </div>
        <div style="margin-top:10px; font-size:14px;">
            <strong>الطالب:</strong> ${currentStudent["الاسم"]} &nbsp;&nbsp;
            <strong>الرقم المدني:</strong> ${currentStudent["رقم_مدني"]} <br>
            <strong>الصف:</strong> ${currentStudent["الصف"]} &nbsp;&nbsp;
            <strong>الشعبة:</strong> ${currentStudent["الشعبة"]} <br>
            متوسطك العام: ${((Object.keys(currentStudent).length - 4) > 0 ? 
                (Object.values(currentStudent).slice(4).reduce((a,b)=>a+parseFloat(b),0)/(Object.keys(currentStudent).length-4)).toFixed(2) : 0)}
        </div>
        <div style="margin-top:10px;">
            ${document.getElementById("gradesList").innerHTML}
        </div>
    `;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>كشف الدرجات</title>');
    printWindow.document.write('<style>body{font-family:Arial;direction:rtl;} table{width:100%;border-collapse:collapse;margin-top:10px;} th,td{border:1px solid #000;padding:6px;text-align:center;} th{background-color:#00796b;color:white;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(container.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}
