let currentStudent = null;

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

// دالة الطباعة
function printGrades() {
    if (!currentStudent) {
        alert("الرجاء عرض درجات الطالب أولاً قبل الطباعة.");
        return;
    }

    const container = document.querySelector(".container");
    const printContent = container.innerHTML;

    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
        <html>
        <head>
            <title>كشف الدرجات</title>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial; direction: rtl; text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top:20px; }
                th, td { border: 1px solid #000; padding: 8px; }
                th { background: #00796b; color: white; }
            </style>
        </head>
        <body>
            ${printContent}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}
