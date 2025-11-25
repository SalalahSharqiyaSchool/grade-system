const searchBtn = document.getElementById("searchBtn");
const printBtn = document.getElementById("printBtn");

let currentStudent = null;

// دالة الملاحظات بدون اسم المادة
function getDynamicFeedback(grade) {
    if (grade >= 90) 
        return `أداء ممتاز! حافظ على هذا المستوى.`;
    if (grade >= 75) 
        return `جيد جدًا، حاول التركيز على التفاصيل الصغيرة لتحسن أكثر.`;
    if (grade >= 50) 
        return `مقبول، من الأفضل مراجعة الدروس الأساسية.`;
    return `ضعيف، ينصح بعمل تمارين إضافية ومراجعة النقاط الأساسية.`;
}

searchBtn.addEventListener("click", async () => {
    const civil = document.getElementById("civil").value.trim();
    const status = document.getElementById("status");
    const studentName = document.getElementById("studentName");
    const studentClass = document.getElementById("studentClass");
    const gradesList = document.getElementById("gradesList");
    const encouragement = document.getElementById("encouragement");

    status.innerHTML = "";
    studentName.innerHTML = "";
    studentClass.innerHTML = "";
    gradesList.innerHTML = "";
    encouragement.innerHTML = "";
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
        } catch {}
    }

    if (!foundStudent) { 
        status.innerHTML = "لم يتم العثور على الرقم المدني في أي صف."; 
        return; 
    }

    currentStudent = foundStudent;

    studentName.innerHTML = `الطالب: ${foundStudent["الاسم"]}`;
    studentClass.innerHTML = `الصف والشعبة: ${foundStudent["الصف"]} - ${foundStudent["الشعبة"]}`;

    let total = 0, count = 0;
    let html = "<table><tr><th>المادة</th><th>الدرجة</th><th>ملاحظة</th></tr>";

    for (const key in foundStudent) {
        if (!["رقم_مدني","الاسم","الصف","الشعبة"].includes(key)) {
            let grade = parseFloat(foundStudent[key]);
            let feedback = getDynamicFeedback(grade); // بدون اسم المادة

            let color =
                grade >= 90 ? "#A8E6A3" :
                grade >= 75 ? "#A3C9E6" :
                grade >= 50 ? "#FFD9A3" :
                              "#F7A8A8";

            html += `
                <tr style="background-color:${color};">
                    <td>${key}</td>
                    <td>${grade}</td>
                    <td>${feedback}</td>
                </tr>
            `;

            total += grade;
            count++;
        }
    }

    html += "</table>";
    gradesList.innerHTML = html;

    let avg = total / count;
    let msg = avg >= 90 ? "أداء ممتاز جدًا" :
              avg >= 75 ? "مستوى جيد جدًا" :
              avg >= 50 ? "مستوى مقبول" : "المستوى ضعيف";

    encouragement.innerHTML = `متوسطك العام: ${avg.toFixed(2)}<br>المستوى: ${msg}`;
});

// الطباعة مع توسيط المحتوى وإضافة اسم المدرسة والفصل الدراسي
// وتنسيق الجدول كما في العرض (المادة يمين، الدرجة وسط، الملاحظة يسار)
printBtn.addEventListener("click", () => {
    if (!currentStudent) {
        alert("الرجاء عرض الدرجات أولاً");
        return;
    }

    const schoolName = "صلالة الشرقية للتعليم الأساسي"; // اسم المدرسة
    const semester = "الفصل الدراسي الأول 2025 - 2026"; // الفصل الدراسي

    const printWindow = window.open("", "", "width=800,height=700");
    printWindow.document.write("<html><head><title>كشف الدرجات</title>");
    printWindow.document.write("<style>");
    printWindow.document.write("body { text-align: center; font-family: Arial, sans-serif; }");
    printWindow.document.write("table { width: 80%; margin: 0 auto; border-collapse: collapse; direction: rtl; }"); // dir rtl
    printWindow.document.write("th, td { border: 1px solid #333; padding: 8px; }");
    printWindow.document.write("th:first-child, td:first-child { text-align: right; }");   // المادة من اليمين
    printWindow.document.write("th:nth-child(2), td:nth-child(2) { text-align: center; }"); // الدرجة في الوسط
    printWindow.document.write("th:last-child, td:last-child { text-align: left; }");      // الملاحظة على اليسار
    printWindow.document.write("</style></head><body>");
    
    printWindow.document.write(`<h2>${schoolName}</h2>`);
    printWindow.document.write(`<h3>${semester}</h3>`);
    printWindow.document.write(`<h3>${document.getElementById("studentName").innerHTML}</h3>`);
    printWindow.document.write(`<p>${document.getElementById("studentClass").innerHTML}</p>`);
    printWindow.document.write(`<p>${document.getElementById("encouragement").innerHTML}</p>`);

    // نسخة جديدة من الجدول مع dir=rtl
    const tableHTML = document.getElementById("gradesList").querySelector("table").outerHTML;
    printWindow.document.write(tableHTML);

    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
});
