let currentStudent = null;

async function showGrades() {
    const civil = document.getElementById("civil").value.trim();
    const status = document.getElementById("status");
    const studentName = document.getElementById("studentName");
    const studentInfo = document.getElementById("studentInfo");
    const gradesList = document.getElementById("gradesList");
    const encouragement = document.getElementById("encouragement");

    status.innerHTML = "";
    studentName.innerHTML = "";
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

    studentName.innerHTML = `الطالب: ${foundStudent["الاسم"]}`;
    studentInfo.innerHTML = `الصف: ${foundStudent["الصف"]} | الشعبة: ${foundStudent["الشعبة"]}`;

    let total = 0, count = 0, html = "<table><tr><th>المادة</th><th>الدرجة</th><th>ملاحظات</th></tr>";
    for (const key in foundStudent) {
        if (!["رقم_مدني","الاسم","الصف","الشعبة"].includes(key)) {
            let grade = parseFloat(foundStudent[key]);
            let note = "";
            let bgColor = "";

            if (grade >= 90) { note = "ممتاز جدًا"; bgColor = "#c8e6c9"; }
            else if (grade >= 75) { note = "جيد جدًا"; bgColor = "#bbdefb"; }
            else if (grade >= 50) { note = "مقبول"; bgColor = "#fff9c4"; }
            else { note = "ضعيف"; bgColor = "#ffcdd2"; }

            html += `<tr style="background-color:${bgColor};"><td>${key}</td><td>${grade}</td><td>${note}</td></tr>`;
            total += grade;
            count++;
        }
    }
    html += "</table>";
    gradesList.innerHTML = `<div style="overflow-x:auto;">${html}</div>`;

    let avg = total / count;
    let msg = avg >= 90 ? "أداء ممتاز جدًا" :
              avg >= 75 ? "مستوى جيد جدًا" :
              avg >= 50 ? "مستوى مقبول" :
                          "المستوى ضعيف";

    encouragement.innerHTML = `<strong>متوسطك العام: ${avg.toFixed(2)}</strong> | ${msg}`;
}

// طباعة الكشف
function printGrades() {
    if (!currentStudent) { alert("الرجاء عرض درجات الطالب أولاً."); return; }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

    doc.setFontSize(16);
    doc.text("صلالة الشرقية للتعليم الأساسي", 40, 40);
    doc.setFontSize(14);
    doc.text("الفصل الدراسي الأول 2025-2026", 40, 60);
    doc.text("سلطنة عمان | وزارة التربية والتعليم | المديرية العامة للتربية والتعليم بمحافظة ظفار", 40, 80);

    doc.setFontSize(14);
    doc.text(`الطالب: ${currentStudent["الاسم"]} | الرقم المدني: ${currentStudent["رقم_مدني"]}`, 40, 110);
    doc.text(`الصف: ${currentStudent["الصف"]} | الشعبة: ${currentStudent["الشعبة"]}`, 40, 130);
    doc.text(`متوسطك العام: ${(Object.keys(currentStudent).filter(k => !["رقم_مدني","الاسم","الصف","الشعبة"].includes(k))
        .reduce((sum,k)=>sum+parseFloat(currentStudent[k]),0)/4).toFixed(2)}`, 40, 150);

    // إنشاء جدول PDF
    const tableRows = [];
    Object.keys(currentStudent).forEach(key => {
        if (!["رقم_مدني","الاسم","الصف","الشعبة"].includes(key)) {
            let grade = parseFloat(currentStudent[key]);
            let note = grade >= 90 ? "ممتاز جدًا" :
                       grade >= 75 ? "جيد جدًا" :
                       grade >= 50 ? "مقبول" : "ضعيف";
            tableRows.push([key, grade.toString(), note]);
        }
    });

    doc.autoTable({
        head: [['المادة','الدرجة','ملاحظات']],
        body: tableRows,
        startY: 170
    });

    doc.save(`كشف_${currentStudent["الاسم"]}.pdf`);
}
