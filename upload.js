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
    status.innerHTML = "⏳ جاري استخراج الأسماء والدرجات بدقة...";

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
                // البحث عن كلمة "منقول" أو "مستجد" لتحديد صف الطالب
                const statusIndex = row.findIndex(cell => 
                    cell.toString().trim() === "منقول" || cell.toString().trim() === "مستجد"
                );

                if (statusIndex !== -1) {
                    // تصحيح: اسم الطالب عادة يكون في العمود رقم 51 في الأصل 
                    // في المصفوفة، سنبحث عن النص الطويل (الاسم الرباعي) بجانب عمود الجنسية
                    // الجنسية غالباً في statusIndex + 1، والاسم في statusIndex + 2
                    
                    let nameCandidate = "";
                    // نفحص الخلايا المجاورة للحالة، ونختار الخلية التي تحتوي على أكثر من اسمين (طولها > 12 حرف)
                    [row[statusIndex + 2], row[statusIndex + 1], row[statusIndex + 3]].forEach(cell => {
                        if (cell && cell.toString().trim().length > 12) {
                            nameCandidate = cell.toString().trim();
                        }
                    });

                    if (nameCandidate && nameCandidate !== "عماني") {
                        const student = {
                            name: nameCandidate,
                            searchName: normalize(nameCandidate),
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
                }
            });

            if (studentsData.length === 0) {
                status.innerHTML = "❌ لم نجد أسماء طلاب (فقط وجدنا الجنسية). تأكد من تنسيق الملف.";
                return;
            }

            const jsonBlob = new Blob([JSON.stringify(studentsData, null, 2)], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(jsonBlob);
            a.download = "students_final_results.json";
            a.click();

            status.style.color = "green";
            status.innerHTML = `✔ تم استخراج ${studentsData.length} طالب بنجاح مع أسمائهم الصحيحة!`;

        } catch (err) {
            console.error(err);
            status.innerHTML = "❌ خطأ في المعالجة.";
        }
    };
    reader.readAsBinaryString(file);
}
