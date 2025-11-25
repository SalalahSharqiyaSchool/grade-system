const searchBtn = document.getElementById("searchBtn");
const printBtn = document.getElementById("printBtn");

let currentStudent = null;

searchBtn.addEventListener("click", async () => {
    const civil = document.getElementById("civil").value.trim();
    const status = document.getElementById("status");
    const studentName = document.getElementById("studentName");
    const gradesList = document.getElementById("gradesList");
    const encouragement = document.getElementById("encouragement");
    const comparison = document.getElementById("comparison");

    status.innerHTML = "";
    studentName.innerHTML = "";
    gradesList.innerHTML = "";
    encouragement.innerHTML = "";
    comparison.innerHTML = "";
    currentStudent = null;

    if (!civil) { status.innerHTML = "الرجاء إدخال الرقم المدني"; return; }

    const files = ["grade5.json","grade6.json","grade7.json","grade8.json","grade9.json"];
    let foundStudent = null;
    let studentClass = "";

    for (const file of files) {
        try {
            const res = await fetch(file + "?time=" + Date.now());
            if (!res.ok) continue;
            const data = await res.json();
            const student = data.find(s => s["رقم_مدني"].toString().trim() === civil);
            if (student) {
                foundStudent = student;
                studentClass = file.replace(".json","");
                break;
            }
        } catch (err) { console.warn("خطأ في قراءة:", file, err); }
    }

    if (!foundStudent) { status.innerHTML = "لم يتم العثور على الرقم المدني في أي صف."; return; }

    currentStudent = foundStudent;

    // معلومات الطالب أعلى الجدول
    studentName.innerHTML = `الطالب: ${foundStudent["الاسم"]} | الرقم المدني: ${foundStudent["رقم_مدني"]}`;
    encouragement.innerHTML = `الفصل الدراسي: الأول 2025-2026 | الصف والشعبة: ${studentClass}`;
    comparison.innerHTML = "ملاحظة: حافظ على مستواك وراجع النقاط الصعبة!";

    // جدول الدرجات
    let total = 0, count = 0, html = "<table><tr><th>المادة</th><th>الدرجة</th><th>ملاحظات</th></tr>";
    for (const key in foundStudent) {
        if (key !== "رقم_مدني" && key !== "الاسم") {
            let grade = parseFloat(foundStudent[key]);
            let advice = grade >= 90 ? "ممتاز جدًا 🌟" :
                         grade >= 75 ? "جيد جدًا 👍" :
                         grade >= 50 ? "مقبول 📘" : "ضعيف 📌";
            html += `<tr><td>${key}</td><td>${grade}</td><td>${advice}</td></tr>`;
            total += grade; count++;
        }
    }
    html += "</table>";
    gradesList.innerHTML = `<div style="overflow-x:auto;">${html}</div>`;

    // متوسط الطالب
    let avg = total / count;
    let avgMsg = avg >= 90 ? "أداء ممتاز جداً! 🌟" :
                 avg >= 75 ? "مستوى جيد جداً 💪" :
                 avg >= 50 ? "مستوى مقبول 📚" : "المستوى ضعيف 🔔";
    comparison.innerHTML += `<br>متوسط الطالب: ${avg.toFixed(2)} | ${avgMsg}`;
});

// طباعة الجدول مع المعلومات
printBtn.addEventListener("click", () => {
    if (!currentStudent) { alert("الرجاء عرض درجات الطالب أولاً قبل الطباعة."); return; }

    const container = document.querySelector(".container");
    const printContent = `
        <div style="text-align:center; font-family:Arial;">
            <h2>كشف درجات الطالب</h2>
            <p>${container.querySelector("#studentName").innerHTML}</p>
            <p>${container.querySelector("#encouragement").innerHTML}</p>
            <p>${container.querySelector("#comparison").innerHTML}</p>
            ${container.querySelector("#gradesList").innerHTML}
        </div>
    `;

    const printWindow = window.open('', '', 'height=700,width=900');
    printWindow.document.write('<html><head><title>كشف الدرجات</title>');
    printWindow.document.write('<style>body { font-family: Arial; direction: rtl; text-align: center; } table { width: 100%; border-collapse: collapse; margin-top: 20px; } th, td { border: 1px solid #000; padding: 8px; text-align: center; } th { background-color: #00796b; color: white; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
});
