let currentStudent = null;
let currentClassData = null;

// دالة عرض الدرجات
async function showGrades() {
    const civil = document.getElementById("civil").value.trim();
    const status = document.getElementById("status");
    const studentName = document.getElementById("studentName");
    const gradesList = document.getElementById("gradesList");
    const encouragement = document.getElementById("encouragement");
    const comparisonDiv = document.getElementById("comparison");

    // إعادة تعيين
    status.innerHTML = "";
    studentName.innerHTML = "";
    gradesList.innerHTML = "";
    encouragement.innerHTML = "";
    if (comparisonDiv) comparisonDiv.innerHTML = "";
    currentStudent = null;
    currentClassData = null;

    if (!civil) {
        status.innerHTML = "الرجاء إدخال الرقم المدني";
        return;
    }

    const files = ["grade5.json","grade6.json","grade7.json","grade8.json","grade9.json"];
    let foundStudent = null;
    let foundClassData = null;

    for (const file of files) {
        try {
            const res = await fetch(file + "?t=" + Date.now());
            if (!res.ok) continue;
            const data = await res.json();
            const student = data.find(s => s["رقم_مدني"].toString().trim() === civil);
            if (student) {
                foundStudent = student;
                foundClassData = data;
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
    currentClassData = foundClassData;

    studentName.innerHTML = `الطالب: ${foundStudent["الاسم"]}`;

    // إنشاء جدول الدرجات
    let total = 0, count = 0;
    let html = "<table><tr><th>المادة</th><th>الدرجة</th><th>ملاحظات</th><th>متوسط الصف</th></tr>";
    const subjects = [];

    // حساب متوسط كل مادة في الصف
    const classAvg = {};
    for (const key in foundStudent) {
        if (key !== "رقم_مدني" && key !== "الاسم") subjects.push(key);
    }

    subjects.forEach(sub => {
        let sum = 0;
        let n = 0;
        foundClassData.forEach(s => {
            if (s[sub] != null) {
                sum += parseFloat(s[sub]);
                n++;
            }
        });
        classAvg[sub] = n > 0 ? (sum / n) : 0;
    });

    subjects.forEach(sub => {
        const grade = parseFloat(foundStudent[sub]);
        let advice = grade >= 90 ? "ممتاز جدًا 🌟" :
                     grade >= 75 ? "جيد جدًا 👍" :
                     grade >= 50 ? "مقبول 📘" : "ضعيف 📌";
        html += `<tr>
                    <td>${sub}</td>
                    <td>${grade}</td>
                    <td>${advice}</td>
                    <td>${classAvg[sub].toFixed(2)}</td>
                 </tr>`;
        total += grade;
        count++;
    });

    html += "</table>";
    gradesList.innerHTML = html;

    // متوسط الطالب
    const avg = total / count;
    let msg = avg >= 90 ? "أداء ممتاز جدًا 🌟" :
              avg >= 75 ? "مستوى جيد جدًا 👍" :
              avg >= 50 ? "مقبول 📘" : "تحتاج لتحسين 🔔";
    encouragement.innerHTML = `<strong>متوسطك العام: ${avg.toFixed(2)}</strong><br>${msg}`;

    // ترتيب الطالب في الصف
    const sorted = [...foundClassData].sort((a,b) => {
        let sumA = 0, sumB = 0, c = 0;
        subjects.forEach(sub => {
            if(a[sub]!=null){ sumA+=parseFloat(a[sub]); c++; }
            if(b[sub]!=null){ sumB+=parseFloat(b[sub]); }
        });
        return (sumB/c) - (sumA/c);
    });
    const rank = sorted.findIndex(s => s["رقم_مدني"].toString().trim() === civil) + 1;
    const totalStudents = foundClassData.length;
    if(comparisonDiv) comparisonDiv.innerHTML = `ترتيبك في الصف: ${rank} من ${totalStudents} طالبًا`;
}

// دالة الطباعة (تقرير كامل مع متوسط الصف)
function printGrades() {
    if (!currentStudent || !currentClassData) {
        alert("الرجاء عرض درجات الطالب أولاً قبل الطباعة.");
        return;
    }

    const table = document.querySelector("#gradesList table");
    const encouragement = document.querySelector("#encouragement");
    const comparisonDiv = document.querySelector("#comparison");
    if (!table) return alert("لا يوجد جدول درجات للطباعة.");

    // إزالة أي iframe موجود
    let iframe = document.getElementById("printFrame");
    if (iframe) iframe.remove();

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
                h1,h2,h3 { margin: 5px; }
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
            <div class="notes">${comparisonDiv ? comparisonDiv.innerHTML : ""}</div>
        </body>
        </html>
    `);

    doc.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
}
