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
            if (student) { foundStudent = student; break; }
        } catch (err) {
            console.warn("خطأ في قراءة:", file, err);
        }
    }

    if (!foundStudent) {
        status.innerHTML = "لم يتم العثور على الرقم المدني في أي صف.";
        return;
    }

    currentStudent = foundStudent;

    // بيانات الطالب قبل الجدول
    studentInfo.innerHTML = `
        <p>الاسم: ${foundStudent["الاسم"]} &nbsp;&nbsp; الرقم المدني: ${foundStudent["رقم_مدني"]}</p>
        <p>الصف: ${foundStudent["الصف"] || "-"} &nbsp;&nbsp; الشعبة: ${foundStudent["الشعبة"] || "-"}</p>
        <p>ملاحظة: ${foundStudent["ملاحظة"] || "لا توجد ملاحظات"}</p>
    `;

    // جدول الدرجات
    let total = 0, count = 0, html = `<table><tr><th>المادة</th><th>الدرجة</th><th>ملاحظات</th></tr>`;
    for (const key in foundStudent) {
        if (!["رقم_مدني","الاسم","الصف","الشعبة","ملاحظة"].includes(key)) {
            let grade = parseFloat(foundStudent[key]);
            let advice = grade >= 90 ? "ممتاز جدًا 🌟" :
                         grade >= 75 ? "جيد جدًا 👍" :
                         grade >= 50 ? "مقبول 📘" : "ضعيف 📌";
            html += `<tr><td>${key}</td><td>${grade}</td><td>${advice}</td></tr>`;
            total += grade; count++;
        }
    }
    html += "</table>";

    // المتوسط
    let avg = total / count;
    html += `<p style="font-size:18px; font-weight:bold; margin-top:10px;">
                المتوسط العام: ${avg.toFixed(2)} &nbsp;&nbsp; ${
                    avg >= 90 ? "أداء ممتاز 🌟" :
                    avg >= 75 ? "جيد جدًا 👍" :
                    avg >= 50 ? "مقبول 📘" : "ضعيف 📌"
                }
            </p>`;

    gradesList.innerHTML = html;
}

// دالة الطباعة
function printGrades() {
    if (!currentStudent) {
        alert("الرجاء عرض درجات الطالب أولاً قبل الطباعة.");
        return;
    }

    const printContent = document.querySelector(".container").innerHTML;
    const printWindow = window.open('', '', 'height=700,width=900');
    printWindow.document.write('<html><head><title>كشف الدرجات</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: Arial; direction: rtl; text-align: right; }');
    printWindow.document.write('h1,h2,h3,p,strong { font-weight:bold; }');
    printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-top: 10px; }');
    printWindow.document.write('th, td { border: 1px solid #00796b; padding: 10px; text-align: center; font-weight:bold; }');
    printWindow.document.write('th { background-color: #004d40; color: white; }');
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}
