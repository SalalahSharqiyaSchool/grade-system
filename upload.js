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
    status.innerHTML = "⏳ جاري استخراج بيانات 141 طالب من كشف صلالة الشرقية...";

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

            rows.forEach((row, index) => {
                // في ملفك الفعلي (CSV): 
                // العمود 58 هو الاسم، العمود 56 هو حالة القيد (منقول/مستجد)
                const studentName = row[58]; 
                const statusType = row[56] ? row[56].toString().trim() : "";
                
                if (studentName && (statusType === "منقول" || statusType === "مستجد")) {
                    const student = {
                        name: studentName.trim(),
                        searchName: normalize(studentName),
                        nationality: row[57] || "",
                        status: statusType,
                        grades: {
                            "التربية الإسلامية": { score: row[53], level: row[51] },
                            "اللغة العربية": { score: row[48], level: row[46] },
                            "اللغة الإنجليزية": { score: row[43], level: row[41] },
                            "الرياضيات": { score: row[38], level: row[36] },
                            "العلوم": { score: row[33], level: row[31] },
                            "الدراسات الاجتماعية": { score: row[28], level: row[26] },
                            "تقنية المعلومات": { score: row[23], level: row[21] },
                            "التربية البدنية": { score: row[18], level: row[16] },
                            "الفنون البصرية": { score: row[13], level: row[11] },
                            "الفنون الموسيقية": { score: row[8], level: row[6] }
                        }
                    };
                    studentsData.push(student);
                }
            });

            if (studentsData.length === 0) {
                status.style.color = "red";
                status.innerHTML = "❌ لم نجد بيانات. جرب رفع الملف بصيغة Excel الأصلية (.xls) وليس CSV.";
                return;
            }

            const jsonBlob = new Blob([JSON.stringify(studentsData, null, 2)], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(jsonBlob);
            a.download = "final_students_results.json";
            a.click();

            status.style.color = "green";
            status.innerHTML = `✔ تم بنجاح! استخراج ${studentsData.length} طالب.`;

        } catch (err) {
            status.style.color = "red";
            status.innerHTML = "❌ خطأ في معالجة الملف.";
            console.error(err);
        }
    };
    reader.readAsBinaryString(file);
}
