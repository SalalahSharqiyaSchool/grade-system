function showGrades() {
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

    status.innerHTML = "جارٍ تحميل البيانات...";

    // ضع هنا رابط ملف JSON على GitHub
    const url = "https://raw.githubusercontent.com/YOUR_USERNAME/SalalahSharqiyaSchool/main/grades.json?time=" + Date.now();

    fetch(url)
        .then(res => res.json())
        .then(data => {
            status.innerHTML = "";

            const student = data.find(s => s.رقم_مدني == civil);
            if (!student) {
                status.innerHTML = "لم يتم العثور على الرقم المدني";
                return;
            }

            studentName.innerHTML = `الطالب: ${student.اسم}`;

            const adviceMap = [
                { min: 90, msg: "ممتاز! حافظ على هذا المستوى." },
                { min: 75, msg: "جيد جدًا، ركز على مراجعة النقاط الصعبة." },
                { min: 50, msg: "مقبول، يحتاج المزيد من الممارسة." },
                { min: 0,  msg: "ضعيف، ننصح بمراجعة الدروس مع المعلم." }
            ];

            let html = "<table><tr><th>المادة</th><th>الدرجة</th><th>تحليل ونصيحة</th></tr>";
            let total = 0, count = 0;

            for (const key in student) {
                if (key !== "رقم_مدني" && key !== "اسم") {
                    const grade = parseFloat(student[key]);
                    const advice = adviceMap.find(a => grade >= a.min).msg;
                    let color = grade >= 90 ? "#c8e6c9" : grade >= 75 ? "#fff9c4" : grade >= 50 ? "#ffe0b2" : "#ffcdd2";

                    html += `<tr style="background-color:${color}"><td>${key}</td><td>${grade}</td><td>${advice}</td></tr>`;
                    total += grade;
                    count++;
                }
            }

            html += "</table>";
            gradesList.innerHTML = `<div style="overflow-x:auto;">${html}</div>`;

            const average = total / count;
            let generalAdvice = average >= 90 ? "ممتاز! استمر على هذا المستوى الرائع 🌟"
                              : average >= 75 ? "جيد جدًا! ركز على المواد التي تحتاج تعزيزًا 💪"
                              : average >= 50 ? "مقبول، تحتاج لمزيد من الاجتهاد والمراجعة 📚"
                              : "ينصح بمراجعة شاملة والدعم من المعلم 🔔";

            encouragement.innerHTML = `<strong>متوسطك العام: ${average.toFixed(2)}</strong><br>${generalAdvice}`;
        })
        .catch(err => {
            status.innerHTML = "خطأ في تحميل الدرجات";
            console.error(err);
        });
}

function printGrades() {
    const printContent = document.querySelector(".container").innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
}
