let currentStudent = null;

async function showGrades() {
    const civil = document.getElementById("civil").value.trim();
    const status = document.getElementById("status");
    const studentInfo = document.getElementById("studentInfo");
    const gradesList = document.getElementById("gradesList");

    status.innerHTML = "";
    studentInfo.innerHTML = "";
    gradesList.innerHTML = "";
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

    // عرض بيانات الطالب
    studentInfo.innerHTML = `
        <p><strong>اسم الطالب:</strong> ${foundStudent["الاسم"]} &nbsp;&nbsp; 
           <strong>الرقم المدني:</strong> ${foundStudent["رقم_مدني"]}</p>
        <p><strong>الصف:</strong> ${foundStudent["الصف"] || "-"} &nbsp;&nbsp;
           <strong>الشعبة:</strong> ${foundStudent["الشعبة"] || "-"}</p>
    `;

    // إنشاء جدول الدرجات
    let total = 0, count = 0, html = "<table><tr><th>المادة</th><th>الدرجة</th><th>ملاحظات</th></tr>";
    for (const key in foundStudent) {
        if (!["رقم_مدني","الاسم","الصف","الشعبة"].includes(key)) {
            const grade = parseFloat(foundStudent[key]);
            const advice = grade >= 90 ? "ممتاز جدًا 🌟" :
                           grade >= 75 ? "جيد جدًا 👍" :
                           grade >= 50 ? "مقبول 📘" : "ضعيف 📌";
            html += `<tr><td>${key}</td><td>${grade}</td><td>${advice}</td></tr>`;
            total += grade; count++;
        }
    }
    html += "</table>";
    gradesList.innerHTML = `<div style="overflow-x:auto;">${html}</div>`;

    // متوسط درجات الطالب
    const avg = total / count;
    studentInfo.innerHTML += `<p><strong>متوسط الدرجات:</strong> ${avg.toFixed(2)}</p>`;
}

// طباعة جدول الطالب مع معلوماته
function printGrades() {
    if (!currentStudent) { alert("الرجاء عرض درجات الطالب أولاً."); return; }

    const printContent = `
        <h2>صلالة الشرقية للتعليم الأساسي</h2>
        <p>محافظة ظفار</p>
        <p>الفصل الدراسي الأول 2025-2026</p>
        ${document.getElementById("studentInfo").innerHTML}
        ${document.getElementById("gradesList").innerHTML}
    `;

    const printWindow = window.open('', '', 'height=700,width=900');
    printWindow.document.write('<html><head><title>كشف الدرجات</title>');
    printWindow.document.write('<style>body { font-family: Arial; text-align: center; direction: rtl; } table { width: 100%; border-collapse: collapse; margin-top: 10px; } th, td { border: 1px solid #00796b; padding: 8px; text-align: center; } th { background-color: #004d40; color: white; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}
