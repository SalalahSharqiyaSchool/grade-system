const searchBtn = document.getElementById("searchBtn");
const printBtn = document.getElementById("printBtn");

let currentStudent = null;

searchBtn.addEventListener("click", async () => {
    const civil = document.getElementById("civil").value.trim();
    const status = document.getElementById("status");
    const studentName = document.getElementById("studentName");
    const studentClass = document.getElementById("studentClass");
    const gradesList = document.getElementById("gradesList");
    const encouragement = document.getElementById("encouragement");

    // إعادة تهيئة العرض
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

    // اسم الطالب
    studentName.innerHTML = `الطالب: ${foundStudent["الاسم"]}`;

    // عرض الصف والشعبة أولاً
    studentClass.innerHTML = `الصف والشعبة: ${foundStudent["الصف"]} - ${foundStudent["الشعبة"]}`;

    // حساب المتوسط وإنشاء الجدول
    let total = 0, count = 0;
    let html = "<table><tr><th>المادة</th><th>الدرجة</th><th>ملاحظات</th></tr>";

    for (const key in foundStudent) {
        if (!["رقم_مدني","الاسم","الصف","الشعبة"].includes(key)) {
            let grade = parseFloat(foundStudent[key]);
            let advice = grade >= 90 ? "ممتاز جدًا" :
                         grade >= 75 ? "جيد جدًا" :
                         grade >= 50 ? "مقبول" : "ضعيف";

            let color =
                advice === "ممتاز جدًا" ? "#A8E6A3" :
                advice === "جيد جدًا"   ? "#A3C9E6" :
                advice === "مقبول"      ? "#FFD9A3" :
                                          "#F7A8A8";

            html += `
                <tr style="background-color:${color};">
                    <td>${key}</td>
                    <td>${grade}</td>
                    <td>${advice}</td>
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

    // عرض متوسطك العام ثم المستوى
    encouragement.innerHTML = `متوسطك العام: ${avg.toFixed(2)}<br>المستوى: ${msg}`;
});

// الطباعة مع توسيط البيانات
printBtn.addEventListener("click", () => {
    if (!currentStudent) {
        alert("الرجاء عرض الدرجات أولاً");
        return;
    }

    const printWindow = window.open("", "", "width=800,height=700");
    printWindow.document.write("<html><head><title>كشف الدرجات</title>");
    
    // CSS لتوسيط المحتوى
    printWindow.document.write("<style>");
    printWindow.document.write("body { text-align: center; font-family: Arial, sans-serif; }");
    printWindow.document.write("table { width: 80%; margin: 0 auto; border-collapse: collapse; }");
    printWindow.document.write("td, th { border: 1px solid #333; padding: 8px; text-align: center; }");
    printWindow.document.write("</style></head><body>");
    
    // عرض المعلومات بالترتيب الجديد في منتصف الصفحة
    printWindow.document.write(`<h3>${document.getElementById("studentName").innerHTML}</h3>`);
    printWindow.document.write(`<p>${document.getElementById("studentClass").innerHTML}</p>`);
    printWindow.document.write(`<p>${document.getElementById("encouragement").innerHTML}</p>`);
    printWindow.document.write(document.getElementById("gradesList").innerHTML);

    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
});
