let currentStudent = null;

async function showGrades() {
    const civil = document.getElementById("civil").value.trim();
    const status = document.getElementById("status");
    const studentInfo = document.getElementById("studentInfo");
    const gradesList = document.getElementById("gradesList");

    status.textContent = "";
    studentInfo.innerHTML = "";
    gradesList.innerHTML = "";
    currentStudent = null;

    if (!civil) {
        status.textContent = "الرجاء إدخال الرقم المدني";
        return;
    }

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
        } catch (err) {
            console.warn("خطأ في قراءة:", file, err);
        }
    }

    if (!foundStudent) {
        status.textContent = "لم يتم العثور على الرقم المدني في أي صف.";
        return;
    }

    currentStudent = foundStudent;

    // عرض بيانات الطالب قبل الجدول
    let total = 0, count = 0;
    for (const key in foundStudent) {
        if (key !== "رقم_مدني" && key !== "الاسم") {
            total += parseFloat(foundStudent[key]);
            count++;
        }
    }
    const avg = (total / count).toFixed(2);

    let advice = avg >= 90 ? "أداء ممتاز جداً 🌟" :
                 avg >= 75 ? "مستوى جيد جداً 💪" :
                 avg >= 50 ? "مستوى مقبول 📚" : "المستوى ضعيف 🔔";

    studentInfo.innerHTML = `
        <p><strong>الطالب:</strong> ${foundStudent["الاسم"]}</p>
        <p><strong>الرقم المدني:</strong> ${foundStudent["رقم_مدني"]}</p>
        <p><strong>الصف والشعبة:</strong> ${studentClass}</p>
        <p><strong>متوسط الدرجات:</strong> ${avg}</p>
        <p><strong>ملاحظات:</strong> ${advice}</p>
    `;

    // إنشاء جدول الدرجات
    let tableHtml = "<table><tr><th>المادة</th><th>الدرجة</th><th>ملاحظات</th></tr>";
    for (const key in foundStudent) {
        if (key !== "رقم_مدني" && key !== "الاسم") {
            const grade = parseFloat(foundStudent[key]);
            let remark = grade >= 90 ? "ممتاز 🌟" :
                         grade >= 75 ? "جيد جدًا 👍" :
                         grade >= 50 ? "مقبول 📘" : "ضعيف 📌";
            tableHtml += `<tr><td>${key}</td><td>${grade}</td><td>${remark}</td></tr>`;
        }
    }
    tableHtml += "</table>";
    gradesList.innerHTML = tableHtml;
}

// طباعة الجزء الخاص بالطالب
function printGrades() {
    if (!currentStudent) {
        alert("الرجاء عرض درجات الطالب أولاً قبل الطباعة.");
        return;
    }
    const content = document.querySelector(".container").innerHTML;
    const printWindow = window.open('', '', 'height=700,width=900');
    printWindow.document.write('<html><head><title>كشف الدرجات</title>');
    printWindow.document.write('<style>body{font-family:Arial;direction:rtl;text-align:right;} table{width:100%;border-collapse:collapse;margin-top:10px;} th,td{border:1px solid #000;padding:8px;text-align:center;} th{background-color:#00796b;color:white;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(content);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}
