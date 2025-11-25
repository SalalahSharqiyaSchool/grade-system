let currentStudent = null;

async function showGrades() {
    const civil = document.getElementById("civil").value.trim();
    const status = document.getElementById("status");
    const studentInfo = document.getElementById("studentInfo");
    const gradesList = document.getElementById("gradesList");
    const encouragement = document.getElementById("encouragement");

    status.innerHTML = "";
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

    // بيانات الطالب
    studentInfo.innerHTML = `
        الاسم: ${foundStudent["الاسم"]} — الرقم المدني: ${foundStudent["رقم_مدني"]} <br>
        الصف: ${foundStudent["الصف"]} — الشعبة: ${foundStudent["الشعبة"]}
    `;

    // جدول الدرجات مع تحليل ونصائح
    let total = 0, count = 0, html = "<table><tr><th>المادة</th><th>الدرجة</th><th>تحليل وملاحظات</th></tr>";
    for (const key in foundStudent) {
        if (!["رقم_مدني","الاسم","الصف","الشعبة"].includes(key)) {
            let grade = parseFloat(foundStudent[key]);
            let advice = "";
            if (grade >= 90) advice = "أداء ممتاز، حافظ على مستوى المراجعة الحالية واستمر في التحديات الجديدة.";
            else if (grade >= 75) advice = "أداء جيد، ركز على مراجعة النقاط الصعبة لكل درس.";
            else if (grade >= 50) advice = "أداء مقبول، يحتاج لمزيد من التدريب والمراجعة اليومية.";
            else advice = "أداء ضعيف، ننصح بمراجعة الدروس مع المعلم وممارسة التمارين الإضافية.";

            html += `<tr><td>${key}</td><td>${grade}</td><td>${advice}</td></tr>`;
            total += grade; count++;
        }
    }
    html += "</table>";
    gradesList.innerHTML = html;

    // متوسط
    let avg = total / count;
    let avgMessage = "";
    if (avg >= 90) avgMessage = "متوسط ممتاز، استمر على هذا المستوى.";
    else if (avg >= 75) avgMessage = "متوسط جيد، حاول تحسين بعض المواد.";
    else if (avg >= 50) avgMessage = "متوسط مقبول، يحتاج لمزيد من المتابعة.";
    else avgMessage = "متوسط ضعيف، ينصح بالدعم والمراجعة المكثفة.";

    encouragement.innerHTML = `<strong>متوسطك العام: ${avg.toFixed(2)}</strong><br>${avgMessage}`;
}

// طباعة جزء من الصفحة
function printGrades() {
    if (!currentStudent) { alert("الرجاء عرض درجات الطالب أولاً."); return; }

    const content = `
        <div style="text-align:center;">
            <h1>صلالة الشرقية للتعليم الأساسي</h1>
            <h2>محافظة ظفار — الفصل الدراسي الأول 2025-2026</h2>
            <p style="font-weight:bold; font-size:16px;">
                الاسم: ${currentStudent["الاسم"]} — الرقم المدني: ${currentStudent["رقم_مدني"]} <br>
                الصف: ${currentStudent["الصف"]} — الشعبة: ${currentStudent["الشعبة"]} <br>
                ${document.getElementById("encouragement").innerHTML}
            </p>
            ${document.getElementById("gradesList").innerHTML}
        </div>
    `;

    const printWindow = window.open('', '', 'height=700,width=900');
    printWindow.document.write('<html><head><title>كشف الدرجات</title>');
    printWindow.document.write('<style>body{font-family:Arial;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #000;padding:8px;text-align:center;}th{background-color:#00796b;color:white;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(content);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}
