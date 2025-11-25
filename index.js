const searchBtn = document.getElementById("searchBtn");
const printBtn = document.getElementById("printBtn");
let currentStudent = null;

searchBtn.addEventListener("click", async () => {
    const civil = document.getElementById("civil").value.trim();
    const status = document.getElementById("status");
    const studentName = document.getElementById("studentName");
    const gradesList = document.getElementById("gradesList");
    const encouragement = document.getElementById("encouragement");

    // إعادة تعيين المحتوى
    status.innerHTML = "";
    studentName.innerHTML = "";
    gradesList.innerHTML = "";
    encouragement.innerHTML = "";
    currentStudent = null;

    // التحقق من إدخال الرقم المدني
    if (!civil) { status.innerHTML = "الرجاء إدخال الرقم المدني"; return; }

    const files = ["grade5.json", "grade6.json", "grade7.json", "grade8.json", "grade9.json"];
    let foundStudent = null;

    // البحث في الملفات
    for (const file of files) {
        try {
            const res = await fetch(file + "?time=" + Date.now());
            if (!res.ok) continue;
            const data = await res.json();
            const student = data.find(s => s["رقم_مدني"].toString().trim() === civil);
            if (student) { foundStudent = student; break; }
        } catch (err) { console.warn("خطأ في قراءة:", file, err); }
    }

    // التحقق من العثور على الطالب
    if (!foundStudent) { status.innerHTML = "لم يتم العثور على الرقم المدني في أي صف."; return; }

    currentStudent = foundStudent;
    studentName.innerHTML = `الطالب: ${foundStudent["الاسم"]}`;

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

    let avg = total / count;
    let msg = avg >= 90 ? "أداء ممتاز جداً! 🌟" :
              avg >= 75 ? "مستوى جيد جداً 💪" :
              avg >= 50 ? "مستوى مقبول 📚" : "المستوى ضعيف 🔔";
    encouragement.innerHTML = `<strong>متوسطك العام: ${avg.toFixed(2)}</strong><br>${msg}`;
});

// دالة الطباعة
printBtn.addEventListener("click", () => {
    const element = document.querySelector(".container");
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>طباعة كشف الدرجات</title>');
    printWindow.document.write('<style>body { font-family: Arial, sans-serif; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #00796b; padding: 8px; text-align: center; } th { background-color: #004d40; color: white; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(element.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
});
