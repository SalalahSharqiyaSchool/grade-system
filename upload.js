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
    status.innerHTML = "⏳ جاري الفحص الذكي لـ 141 طالب...";

    reader.onload = function (e) {
        try {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            // تحويل الشيت لمصفوفة خام
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

            const normalize = (name) => {
                if (!name) return "";
                return name.toString().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();
            };

            const studentsData = [];

            rows.forEach((row) => {
                // البحث عن الخلية التي تحتوي على حالة القيد (منقول أو مستجد)
                const statusIndex = row.findIndex(cell => 
                    cell.toString().trim() === "منقول" || cell.toString().trim() === "مستجد"
                );

                if (statusIndex !== -1) {
                    // الاسم عادة يكون في الخلية المجاورة مباشرة لحالة القيد (إما قبلها أو بعدها)
                    // في ملفك، الاسم يكون بعد حالة القيد بخلية واحدة أو خليتين
                    let nameCandidate = "";
                    if (row[statusIndex + 2] && row[statusIndex + 2].length > 10) nameCandidate = row[statusIndex + 2];
                    else if (row[statusIndex + 1] && row[statusIndex + 1].length > 10) nameCandidate = row[statusIndex + 1];
                    else if (row[statusIndex - 1] && row[statusIndex - 1].length > 10) nameCandidate = row[statusIndex - 1];

                    if (nameCandidate) {
                        // استخراج كافة الأرقام (الدرجات) والحروف (المستويات) من الصف
                        const allGrades = row.filter(cell => cell !== "" && cell !== nameCandidate);
                        
                        const student = {
                            name: nameCandidate.trim(),
                            searchName: normalize(nameCandidate),
                            status: row[statusIndex],
                            // سنقوم هنا بسحب الدرجات بناءً على ترتيب المواد المعروف في كشوف السلطنة
                            // الترتيب من اليمين لليسار في الملف
                            results: {
                                "التربية الإسلامية": { score: row[statusIndex - 3], level: row[statusIndex - 1] },
                                "اللغة العربية": { score: row[statusIndex - 8], level: row[statusIndex - 6] },
                                "اللغة الإنجليزية": { score: row[statusIndex - 13], level: row[statusIndex - 11] },
                                "الرياضيات": { score: row[statusIndex - 18], level: row[statusIndex - 16] },
                                "العلوم": { score: row[statusIndex - 23], level: row[statusIndex - 21] },
                                "الدراسات الاجتماعية": { score: row[statusIndex - 28], level: row[statusIndex - 26] },
                                "تقنية المعلومات": { score: row[statusIndex - 33], level: row[statusIndex - 31] },
                                "التربية البدنية": { score: row[statusIndex - 38], level: row[statusIndex - 36] },
                                "الفنون البصرية": { score: row[statusIndex - 43], level: row[statusIndex - 41] },
                                "الفنون الموسيقية": { score: row[statusIndex - 48], level: row[statusIndex - 46] }
                            }
                        };
                        studentsData.push(student);
                    }
                }
            });

            if (studentsData.length === 0) {
                status.style.color = "red";
                status.innerHTML = "❌ فشل العثور على الأسماء. تأكد من رفع ملف الـ Excel الأصلي المستخرج من النظام مباشرة.";
                return;
            }

            const jsonBlob = new Blob([JSON.stringify(studentsData, null, 2)], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(jsonBlob);
            a.download = "students_data.json";
            a.click();

            status.style.color = "green";
            status.innerHTML = `✔ تم بنجاح استخراج ${studentsData.length} طالب!`;

        } catch (err) {
            status.style.color = "red";
            status.innerHTML = "❌ خطأ في النظام.";
            console.error(err);
        }
    };
    reader.readAsBinaryString(file);
}
