const searchBtn = document.getElementById("searchBtn");
const printBtn = document.getElementById("printBtn");
let currentStudent = null;
let chartInstance = null;

// ملاحظات ديناميكية بدون AI خارجي
function getDynamicFeedback(grade) {
    if (grade >= 90) return `أداء ممتاز! حافظ على هذا المستوى.`;
    if (grade >= 75) return `جيد جدًا، حاول التركيز على التفاصيل الصغيرة لتحسن أكثر.`;
    if (grade >= 50) return `مقبول، من الأفضل مراجعة الدروس الأساسية.`;
    return `ضعيف، ينصح بعمل تمارين إضافية ومراجعة النقاط الأساسية.`;
}

searchBtn.addEventListener("click", async () => {
    const civil = document.getElementById("civil").value.trim();
    const status = document.getElementById("status");
    const studentName = document.getElementById("studentName");
    const studentClass = document.getElementById("studentClass");
    const gradesList = document.getElementById("gradesList");
    const encouragement = document.getElementById("encouragement");
    const gradesChart = document.getElementById("gradesChart");

    status.innerHTML = "";
    studentName.innerHTML = "";
    studentClass.innerHTML = "";
    gradesList.innerHTML = "";
    encouragement.innerHTML = "";
    if(chartInstance) chartInstance.destroy();
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
        } catch {}
    }

    if (!foundStudent) { status.innerHTML = "لم يتم العثور على الرقم المدني في أي صف."; return; }

    currentStudent = foundStudent;
    studentName.innerHTML = `الطالب: ${foundStudent["الاسم"]}`;
    studentClass.innerHTML = `الصف والشعبة: ${foundStudent["الصف"]} - ${foundStudent["الشعبة"]}`;

    let total = 0, count = 0;
    let html = "<table><tr><th>المادة</th><th>الدرجة</th><th>ملاحظة</th></tr>";
    let labels = [], dataGrades = [];

    for (const key in foundStudent) {
        if (!["رقم_مدني","الاسم","الصف","الشعبة"].includes(key)) {
            let grade = parseFloat(foundStudent[key]);
            let feedback = getDynamicFeedback(grade);

            let color = grade >= 90 ? "#A8E6A3" : grade >= 75 ? "#A3C9E6" : grade >= 50 ? "#FFD9A3" : "#F7A8A8";

            html += `<tr style="background-color:${color};"><td>${key}</td><td>${grade}</td><td>${feedback}</td></tr>`;
            total += grade; count++;

            labels.push(key); dataGrades.push(grade);
        }
    }

    html += "</table>";
    gradesList.innerHTML = html;

    let avg = total / count;
    let msg = avg >= 90 ? "أداء ممتاز جدًا" : avg >= 75 ? "مستوى جيد جدًا" : avg >= 50 ? "مستوى مقبول" : "المستوى ضعيف";
    encouragement.innerHTML = `متوسطك العام: ${avg.toFixed(2)}<br>المستوى: ${msg}`;

    // رسم بياني
    chartInstance = new Chart(gradesChart, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'الدرجة',
                data: dataGrades,
                backgroundColor: '#4e79a7'
            }]
        },
        options: { indexAxis: 'y', responsive:true }
    });
});

// الطباعة
printBtn.addEventListener("click", () => {
    if (!currentStudent) { alert("الرجاء عرض الدرجات أولاً"); return; }

    const schoolName = "صلالة الشرقية للتعليم الأساسي";
    const semester = "الفصل الدراسي الأول 2025 - 2026";

    const printWindow = window.open("", "", "width=800,height=700");
    printWindow.document.write("<html><head><title>كشف الدرجات</title>");
    printWindow.document.write("<style>");
    printWindow.document.write("body { text-align: center; font-family: Arial, sans-serif; }");
    printWindow.document.write("table { width: 80%; margin: 0 auto; border-collapse: collapse; direction: rtl; }");
    printWindow.document.write("th, td { border: 1px solid #333; padding: 8px; }");
    printWindow.document.write("th:first-child, td:first-child { text-align: right; }");
    printWindow.document.write("th:nth-child(2), td:nth-child(2) { text-align: center; }");
    printWindow.document.write("th:last-child, td:last-child { text-align: left; }");
    printWindow.document.write("</style></head><body>");
    printWindow.document.write(`<h2>${schoolName}</h2>`);
    printWindow.document.write(`<h3>${semester}</h3>`);
    printWindow.document.write(`<h3>${document.getElementById("studentName").innerHTML}</h3>`);
    printWindow.document.write(`<p>${document.getElementById("studentClass").innerHTML}</p>`);
    printWindow.document.write(`<p>${document.getElementById("encouragement").innerHTML}</p>`);
    printWindow.document.write(document.getElementById("gradesList").innerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
});
