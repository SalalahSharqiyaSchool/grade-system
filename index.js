async function showGrades() {
    const civil = document.getElementById("civil").value.trim();
    const status = document.getElementById("status");
    const infoBox = document.getElementById("studentInfo");
    const tableArea = document.getElementById("gradesList");
    const rec = document.getElementById("recommendations");

    status.textContent = "";
    infoBox.style.display = "none";
    tableArea.innerHTML = "";
    rec.textContent = "";

    if (civil === "") {
        status.textContent = "يرجى إدخال الرقم المدني";
        return;
    }

    try {
        const url = "https://raw.githubusercontent.com/faissaltunisia/grade-system/main/data.json";
        const response = await fetch(url);
        const data = await response.json();

        const student = data.find(s => s.civil == civil);

        if (!student) {
            status.textContent = "الطالب غير موجود";
            return;
        }

        infoBox.style.display = "block";
        infoBox.innerHTML = `
            <div>اسم الطالب: ${student.name}</div>
            <div>الرقم المدني: ${student.civil}</div>
            <div>الصف: ${student.class}</div>
            <div>الشعبة: ${student.section}</div>
            <div>المتوسط العام: ${student.average}</div>
        `;

        rec.textContent = "توصيات: الاستمرار في الاجتهاد والحفاظ على مستواك الدراسي.";

        let table = `
            <table>
                <tr>
                    <th>المادة</th>
                    <th>الدرجة</th>
                </tr>
        `;

        student.grades.forEach(g => {
            table += `
                <tr>
                    <td>${g.subject}</td>
                    <td>${g.score}</td>
                </tr>`;
        });

        table += "</table>";
        tableArea.innerHTML = table;

    } catch (error) {
        status.textContent = "خطأ أثناء تحميل البيانات";
    }
}

function printReport() {
    window.print();
}
