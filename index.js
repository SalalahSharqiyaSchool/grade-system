let currentStudent = null;

// دالة عرض الدرجات
async function showGrades() {
    const civil = document.getElementById("civil").value.trim();
    const status = document.getElementById("status");
    const studentName = document.getElementById("studentName");
    const gradesList = document.getElementById("gradesList");
    const encouragement = document.getElementById("encouragement");

    // إعادة تعيين
    status.innerHTML = "";
    studentName.innerHTML = "";
    gradesList.innerHTML = "";
    encouragement.innerHTML = "";
    currentStudent = null;

    if (!civil) {
        status.innerHTML = "الرجاء إدخال الرقم المدني";
        return;
    }

    const files = [
        "grade5.json",
        "grade6.json",
        "grade7.json",
        "grade8.json",
        "grade9.json"
    ];

    let foundStudent = null;

    for (const file of files) {
        try {
            const res = await fetch(file + "?t=" + Date.now());
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

    let total = 0;
    let count = 0;
    let html = "<table><tr><th>المادة</th><th>الدرجة</th><th>ملاحظات</th></tr>";

    for (const key in foundStudent) {
        if (key !== "رقم_مدني" && key !== "الاسم") {
            const grade = parseFloat(foundStudent[key]);
            let advice = "";

            if (grade >= 90) advice = "ممتاز جدًا 🌟";
            else if (grade >= 75) advice = "جيد جدًا 👍";
            else if (grade >= 50) advice = "مقبول 📘";
            else advice = "ضعيف 📌";

            html += `<tr><td>${key}</td><td>${grade}</td><td>${advice}</td></tr>`;
            total += grade;
            count++;
        }
    }

    html += "</table>";
    gradesList.innerHTML = html;

    const avg = total / count;
    let msg = "";
    if (avg >= 90) msg = "أداء ممتاز جدًا 🌟";
    else if (avg >= 75) msg = "مستوى جيد جدًا 👍";
    else if (avg >= 50) msg = "مقبول 📘";
    else msg = "تحتاج لتحسين 🔔";

    encouragement.innerHTML = `<strong>متوسطك العام: ${avg.toFixed(2)}</strong><br>${msg}`;
}

// دالة الطباعة (جدول فقط + اسم المدرسة + الطالب + المحافظة + الفصل الدراسي)
function printGrades() {
    if (!currentStudent) {
        alert("الرجاء عرض درجات الطالب أولاً قبل الطباعة.");
        return;
    }

    const table = document.querySelector("#gradesList table");
    const encouragement = document.querySelector("#encouragement");
    if (!table) {
        alert("لا يوجد جدول درجات للطباعة.");
        return;
    }

    // إزالة أي iframe موجود
    let iframe = document.getElementById("printFrame");
    if (iframe) iframe.remove();

    // إنشاء iframe مخفي للطباعة
    iframe = document.createElement("iframe");
    iframe.id = "printFrame";
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();

    doc.write(`
        <html>
        <head>
            <meta charset="UTF-8">
            <title>كشف الدرجات</title>
            <style>
                body { font-family: Arial; direction: rtl; text-align: center; margin: 20px; }
                h1, h2, h3 { margin: 5px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #000; padding: 8px; text-align: center; }
                th { background-color: #00796b; color: white; }
                .notes { margin-top: 15px; font-weight: bold; color: #00796b; }
            </style>
        </head>
        <body>
            <h1>صلالة الشرقية للتعليم الأساسي</h1>
            <h2>محافظة ظفار</h2>
            <h3>الفصل الدراسي الأول 2025-2026</h3>
            <h3>الطالب: ${currentStudent["الاسم"]}</h3>
            ${table.outerHTML}
            <div class="notes">${encouragement.innerHTML}</div>
        </body>
        </html>
    `);

    doc.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
}
