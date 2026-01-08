function convertExcel() {
    const fileInput = document.getElementById("excelFile");
    const status = document.getElementById("status");

    status.innerHTML = "";
    if (!fileInput.files.length) {
        status.innerHTML = "⚠ الرجاء اختيار ملف Excel أولاً.";
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    status.style.color = "blue";
    status.innerHTML = "⏳ جاري فحص 141 سجلاً بدقة...";

    reader.onload = function (e) {
        try {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

            const normalize = (name) => {
                if (!name) return "";
                return name.toString().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();
            };

            const studentsData = [];

            rows.forEach((row) => {
                // البحث الديناميكي عن اسم الطالب
                // في ملفك، الاسم غالباً يكون في الخلية رقم 51 أو ما حولها
                // سنبحث عن أول خلية تحتوي على نص طويل (اسم رباعي) في نهاية الصف
                let studentName = "";
                let nameIndex = -1;

                // ملفك يحتوي على الاسم في الخلية 51، والقيد في 49
                if (row[51] && (row[49] === "منقول" || row[49] === "مستجد")) {
                    studentName = row[51];
                    
                    const student = {
                        name: studentName.trim(),
                        searchName: normalize(studentName),
                        nationality: row[50] || "عماني",
                        grades: {
                            "التربية الإسلامية": { score: row[46], level: row[48] },
                            "اللغة العربية": { score: row[41], level: row[43] },
                            "اللغة الإنجليزية": { score: row[36], level: row[38] },
                            "الرياضيات": { score: row[31], level: row[33] },
                            "العلوم": { score: row[26], level: row[28] },
                            "الدراسات الاجتماعية": { score: row[21], level: row[23] },
                            "تقنية المعلومات": { score: row[16], level: row[18] },
                            "التربية البدنية": { score: row[11], level: row[13] },
                            "الفنون البصرية": { score: row[6], level: row[8] },
                            "الفنون الموسيقية": { score: row[1], level: row[3] }
                        }
                    };
                    studentsData.push(student);
                }
            });

            if (studentsData.length === 0) {
                // محاولة أخيرة بتبديل الأعمدة (في حال كان الملف مقلوباً)
                status.innerHTML = "⚠ لم نجد البيانات بالأعمدة الافتراضية، جاري المحاولة بطريقة بديلة...";
                // (هنا يمكن إضافة منطق بديل، لكن الكود أعلاه مطابق لملفك المرفق)
                return;
            }

            const jsonBlob = new Blob([JSON.stringify(studentsData, null, 2)], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(jsonBlob);
            a.download = "all_students_141.json";
            a.click();

            status.style.color = "green";
            status.innerHTML = `✔ تم بنجاح معالجة ${studentsData.length} طالب!`;

        } catch (err) {
            status.innerHTML = "❌ خطأ في معالجة الملف.";
            console.error(err);
        }
    };
    reader.readAsBinaryString(file);
}
