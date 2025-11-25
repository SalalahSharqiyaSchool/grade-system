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
    gradesList.innerHTML = ""; // نظف العرض
    const container = document.createElement("div");
    container.className = "card-container";

    for (const key in foundStudent) {
        if (!["رقم_مدني","الاسم","الصف","الشعبة"].includes(key)) {

            let grade = parseFloat(foundStudent[key]);
            let advice = grade >= 90 ? "ممتاز جدًا" :
                         grade >= 75 ? "جيد جدًا" :
                         grade >= 50 ? "مقبول" : "ضعيف";

            // ألوان فاتحة لكل ملاحظة
            let color =
                advice === "ممتاز جدًا" ? "#A8E6A3" :   // أخضر فاتح
                advice === "جيد جدًا"   ? "#A3C9E6" :   // أزرق فاتح
                advice === "مقبول"      ? "#FFD9A3" :   // برتقالي فاتح
                                          "#F7A8A8";    // أحمر فاتح

            const card = document.createElement("div");
            card.className = "grade-card";
            card.style.backgroundColor = color;
            card.innerHTML = `
                <div>${key}</div>
                <div>الدرجة: ${grade}</div>
                <div>${advice}</div>
            `;
            container.appendChild(card);

            total += grade;
            count++;
        }
    }

    gradesList.appendChild(container);

    let avg = total / count;
    let msg = avg >= 90 ? "أداء ممتاز جدًا" :
              avg >= 75 ? "مستوى جيد جدًا" :
              avg >= 50 ? "مستوى مقبول" : "المستوى ضعيف";

    encouragement.innerHTML = `متوسطك العام: ${avg.toFixed(2)} - ${msg}`;
});

// الطباعة
printBtn.addEventListener("click", () => {
    if (!currentStudent) {
        alert("الرجاء عرض الدرجات أولاً");
        return;
    }

    const printWindow = window.open("", "", "width=900,height=700");
    printWindow.document.write("<html><head><title>كشف الدرجات</title>");
    printWindow.document.write("<style>body{font-family:Arial; text-align:center;} .grade-card{display:inline-block;margin:5px;padding:15px;border-radius:10px;min-width:120px; max-width:160px; text-align:center;font-weight:bold;color:#333;}</style>");
    printWindow.document.write("</head><body>");
    printWindow.document.write(document.querySelector(".container").innerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
});
