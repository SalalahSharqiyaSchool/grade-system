const searchBtn = document.getElementById("searchBtn");
const printBtn = document.getElementById("printBtn");

let currentStudent = null;

searchBtn.addEventListener("click", async () => {
    
    const civil = document.getElementById("civil").value.trim();
    const status = document.getElementById("status");
    const studentName = document.getElementById("studentName");
    const gradesList = document.getElementById("gradesList");
    const encouragement = document.getElementById("encouragement");

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
            console.log("خطأ:", file, err);
        }
    }

    if (!foundStudent) {
        status.innerHTML = "لم يتم العثور على الرقم المدني.";
        return;
    }

    currentStudent = foundStudent;
    studentName.innerHTML = `الطالب: ${foundStudent["الاسم"]}`;

    let total = 0;
    let count = 0;

    let html = `
        <table>
            <tr>
                <th>المادة</th>
                <th>الدرجة</th>
                <th>ملاحظات</th>
            </tr>
    `;

    for (const key in foundStudent) {
        if (key !== "رقم_مدني" && key !== "الاسم") {
            let grade = parseFloat(foundStudent[key]);

            let msg =
                grade >= 90 ? "ممتاز جدًا 🌟" :
                grade >= 75 ? "جيد جدًا 👍" :
                grade >= 50 ? "مقبول 📘" :
                "ضعيف 📌";

            html += `
                <tr>
                    <td>${key}</td>
                    <td>${grade}</td>
                    <td>${msg}</td>
                </tr>
            `;

            total += grade;
            count++;
        }
    }

    html += "</table>";
    gradesList.innerHTML = html;

    let avg = total / count;
    encouragement.innerHTML =
        `متوسطك العام: <strong>${avg.toFixed(2)}</strong><br>` +
        (avg >= 90 ? "أداء ممتاز! 🌟" :
         avg >= 75 ? "مستوى جيد جدًا 👍" :
         avg >= 50 ? "مقبول 📘" :
         "تحتاج لتحسين 🔔");
});


// ■■■ زر الطباعة — يعمل على الهاتف والكمبيوتر ■■■
printBtn.addEventListener("click", () => {

    const container = document.querySelector(".container");
    if (!container) return;

    let iframe = document.getElementById("printFrame");
    const doc = iframe.contentWindow.document;

    doc.open();
    doc.write(`
        <html>
        <head>
            <title>كشف الدرجات</title>
            <meta charset="UTF-8" />
            <style>
                body { font-family: Arial; direction: rtl; text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top:20px; }
                th, td { border: 1px solid #000; padding: 8px; }
                th { background:#00796b; color:white; }
            </style>
        </head>
        <body>
            ${container.innerHTML}
        </body>
        </html>
    `);

    doc.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
});
