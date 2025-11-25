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

// تحميل PDF عربي صحيح
printBtn.addEventListener("click", () => {
    if (!currentStudent) { alert("الرجاء عرض درجات الطالب أولاً قبل التحميل."); return; }

    const element = document.querySelector(".container");
    const opt = {
        margin: 10,
        filename: `كشف_الدرجات_${currentStudent["الاسم"]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    html2pdf().set(opt).from(element).save();
});
