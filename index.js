function showGrades() {
    const civil = document.getElementById("civil").value.trim();
    const status = document.getElementById("status");
    const studentInfo = document.getElementById("studentInfo");
    const gradesList = document.getElementById("gradesList");
    const encouragement = document.getElementById("encouragement");

    status.innerHTML = "";
    studentInfo.innerHTML = "";
    gradesList.innerHTML = "";
    encouragement.innerHTML = "";

    if (!civil) {
        status.innerHTML = "الرجاء إدخال الرقم المدني";
        return;
    }

    // ملفات الصفوف
    const files = ["grade5.json", "grade6.json", "grade7.json", "grade8.json", "grade9.json"];
    let found = null;

    Promise.all(
        files.map(file => fetch(file).then(res => res.json()).catch(() => []))
    ).then(allData => {

        for (const gradeList of allData) {
            const student = gradeList.find(s => s["رقم_مدني"] == civil);
            if (student) { found = student; break; }
        }

        if (!found) {
            status.innerHTML = "لم يتم العثور على الطالب.";
            return;
        }

        // عرض بيانات الطالب
        studentInfo.innerHTML = `
            <p><strong>اسم الطالب:</strong> ${found["الاسم"]}</p>
            <p><strong>الرقم المدني:</strong> ${found["رقم_مدني"]}</p>
            <p><strong>الصف:</strong> ${found["الصف"] || ""}</p>
            <p><strong>الشعبة:</strong> ${found["الشعبة"] || ""}</p>
        `;

        // بناء جدول الدرجات
        let total = 0, count = 0;

        let tableHTML = `
            <table>
                <tr>
                    <th>المادة</th>
                    <th>الدرجة</th>
                    <th>التوصيات</th>
                </tr>
        `;

        for (const key in found) {
            if (["الاسم", "رقم_مدني", "الصف", "الشعبة"].includes(key)) continue;

            let grade = parseFloat(found[key]);

            let advice =
                grade >= 90 ? "ممتاز جدًا 🌟" :
                grade >= 75 ? "جيد جدًا 👍" :
                grade >= 50 ? "مقبول" :
                "يحتاج تحسين 🔔";

            tableHTML += `
                <tr>
                    <td>${key}</td>
                    <td>${grade}</td>
                    <td>${advice}</td>
                </tr>
            `;

            total += grade;
            count++;
        }

        tableHTML += "</table>";
        gradesList.innerHTML = tableHTML;

        // متوسط عام
        let avg = (total / count).toFixed(2);
        encouragement.innerHTML = `<strong>المتوسط العام:</strong> ${avg}`;
    });
}

function printGrades() {
    window.print();
}
