const showBtn = document.getElementById("showBtn");
const status = document.getElementById("status");
const studentInfo = document.getElementById("studentInfo");
const gradesList = document.getElementById("gradesList");
const encouragement = document.getElementById("encouragement");

showBtn.addEventListener("click", async () => {
    const civil = document.getElementById("civil").value.trim();
    status.textContent = "";
    studentInfo.innerHTML = "";
    gradesList.innerHTML = "";
    encouragement.textContent = "";

    if (!civil) {
        status.textContent = "الرجاء إدخال الرقم المدني";
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
        } catch(err) {
            console.warn("خطأ في قراءة:", file, err);
        }
    }

    if (!foundStudent) {
        status.textContent = "لم يتم العثور على الرقم المدني في أي صف.";
        return;
    }

    // بيانات الطالب
    studentInfo.innerHTML = `
        <p><strong>الطالب:</strong> ${foundStudent["الاسم"]} | <strong>الرقم المدني:</strong> ${foundStudent["رقم_مدني"]}</p>
        <p><strong>الصف:</strong> ${foundStudent["الصف"]} | <strong>الشعبة:</strong> ${foundStudent["الشعبة"]}</p>
    `;

    // جدول الدرجات
    let total = 0, count = 0;
    let html = "<table><tr><th>المادة</th><th>الدرجة</th><th>تحليل وملاحظات</th></tr>";

    for (const key in foundStudent) {
        if (!["رقم_مدني","الاسم","الصف","الشعبة"].includes(key)) {
            let grade = parseFloat(foundStudent[key]);
            let advice = grade >= 90 ? "ممتاز جدًا" :
                         grade >= 75 ? "جيد جدًا" :
                         grade >= 50 ? "مقبول" : "ضعيف";
            html += `<tr><td>${key}</td><td>${grade}</td><td>${advice}</td></tr>`;
            total += grade; count++;
        }
    }
    html += "</table>";
    gradesList.innerHTML = html;

    // متوسط عام وملاحظة
    const avg = total / count;
    let msg = avg >= 90 ? "أداء ممتاز جدًا!" :
              avg >= 75 ? "مستوى جيد جدًا" :
              avg >= 50 ? "مقبول، يحتاج تحسين" :
                          "ضعيف، يحتاج مراجعة";
    encouragement.innerHTML = `<strong>متوسطك العام: ${avg.toFixed(2)}</strong> | ${msg}`;
});
