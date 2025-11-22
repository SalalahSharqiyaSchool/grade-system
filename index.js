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

    fetch("grades.json?time=" + Date.now())
        .then(res => res.json())
        .then(data => {
            const student = data.find(s => s.civil == civil);
            if (student) {
                studentName.innerHTML = `الطالب: ${student.name}`;

                let total = 0;
                let count = 0;
                let html = "<table>";
                html += "<tr><th>المادة</th><th>الدرجة</th><th>تحليل ونصيحة</th></tr>";

                for (const key in student) {
                    if (key !== "civil" && key !== "name") {
                        let grade = parseFloat(student[key]);
                        let advice = "";

                        if (grade >= 90) advice = "ممتاز! حافظ على هذا المستوى.";
                        else if (grade >= 75) advice = "جيد جدًا، ركز على مراجعة النقاط الصعبة.";
                        else if (grade >= 50) advice = "مقبول، يحتاج المزيد من الممارسة.";
                        else advice = "ضعيف، ننصح بمراجعة الدروس مع المعلم.";

                        html += `<tr><td>${key}</td><td>${grade}</td><td>${advice}</td></tr>`;
                        total += grade;
                        count++;
                    }
                }

                html += "</table>";
                gradesList.innerHTML = `<div style="overflow-x:auto;">${html}</div>`;

                let average = total / count;
                let generalAdvice = "";
                if (average >= 90) generalAdvice = "ممتاز! استمر على هذا المستوى الرائع 🌟";
                else if (average >= 75) generalAdvice = "جيد جدًا! ركز على المواد التي تحتاج تعزيزًا 💪";
                else if (average >= 50) generalAdvice = "مقبول، تحتاج لمزيد من الاجتهاد والمراجعة 📚";
                else generalAdvice = "ينصح بمراجعة شاملة والدعم من المعلم 🔔";

                encouragement.innerHTML = `<strong>متوسطك العام: ${average.toFixed(2)}</strong><br>${generalAdvice}`;
            } else {
                status.innerHTML = "لم يتم العثور على الرقم المدني";
            }
        })
        .catch(err => {
            status.innerHTML = "خطأ في تحميل الدرجات";
            console.error(err);
        });
}
