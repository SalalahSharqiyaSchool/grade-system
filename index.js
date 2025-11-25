// ------------------------------
// دالة البحث وعرض الدرجات
// ------------------------------
async function showGrades() {
    const civil = document.getElementById("civil").value.trim();
    const status = document.getElementById("status");
    const studentName = document.getElementById("studentName");
    const gradesList = document.getElementById("gradesList");
    const encouragement = document.getElementById("encouragement");

    status.innerHTML = "";
    studentName.innerHTML = "";
    gradesList.innerHTML = "";
    encouragement.innerHTML = "";

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
            const res = await fetch(file + "?time=" + Date.now());
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

    studentName.innerHTML = `الطالب: ${foundStudent["الاسم"]}`;

    let total = 0;
    let count = 0;
    let html = "<table>";
    html += "<tr><th>المادة</th><th>الدرجة</th><th>ملاحظات</th></tr>";

    for (const key in foundStudent) {
        if (key !== "رقم_مدني" && key !== "الاسم") {
            let grade = parseFloat(foundStudent[key]);
            let advice = "";
            if (grade >= 90) advice = "ممتاز جدًا 🌟";
            else if (grade >= 75) advice = "جيد جدًا 👍";
            else if (grade >= 50) advice = "مقبول، يحتاج جهدًا أكثر 📘";
            else advice = "ضعيف، يرجى المراجعة والدعم 📌";

            html += `<tr>
                        <td>${key}</td>
                        <td>${grade}</td>
                        <td>${advice}</td>
                     </tr>`;
            total += grade;
            count++;
        }
    }

    html += "</table>";
    gradesList.innerHTML = `<div style="overflow-x:auto;">${html}</div>`;

    let avg = total / count;
    let msg = "";
    if (avg >= 90) msg = "أداء ممتاز جداً! استمر على هذا المستوى الرائع 🌟";
    else if (avg >= 75) msg = "مستوى جيد جداً، حاول تعزيز بعض المواد 💪";
    else if (avg >= 50) msg = "مستوى مقبول، تحتاج للمزيد من المتابعة 📚";
    else msg = "المستوى ضعيف، ننصح بالدعم الإضافي والمراجعة 🔔";

    encouragement.innerHTML = `<strong>متوسطك العام: ${avg.toFixed(2)}</strong><br>${msg}`;
}

// ------------------------------
// دالة الطباعة (متوافقة مع الهاتف والكمبيوتر)
// ------------------------------
function printGrades() {
    const container = document.querySelector(".container");
    if (!container) return;

    // إزالة أي iframe سابق
    let iframe = document.getElementById("printFrame");
    if (iframe) iframe.remove();

    // إنشاء iframe جديد مخفي
    iframe = document.createElement("iframe");
    iframe.id = "printFrame";
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write('<html><head><title>كشف الدرجات</title>');
    doc.write('<style>');
    doc.write('body { font-family: Arial; direction: rtl; text-align: center; }');
    doc.write('table { width: 100%; border-collapse: collapse; margin-top: 20px; }');
    doc.write('th, td { border: 1px solid #000; padding: 8px; text-align: center; }');
    doc.write('th { background-color: #00796b; color: whit
