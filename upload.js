function convertExcel() {
    const fileInput = document.getElementById("excelFile");
    const status = document.getElementById("status");

    status.innerHTML = "";
    status.style.color = "red";

    if (!fileInput.files.length) {
        status.innerHTML = "⚠ الرجاء اختيار ملف Excel أولاً.";
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    status.style.color = "blue";
    status.innerHTML = "⏳ جاري المعالجة الذكية للملف...";

    reader.onload = function (e) {
        try {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            
            // تحويل الشيت إلى مصفوفة صفوف (Array of Arrays) للتحكم الدقيق
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // دالة لتنظيف الاسم للبحث (إزالة الهمزات والتاء المربوطة)
            const normalize = (name) => {
                if (!name) return "";
                return name.toString()
                    .replace(/[أإآ]/g, 'ا')
                    .replace(/ة/g, 'ه')
                    .replace(/ى/g, 'ي')
                    .trim();
            };

            const studentsData = [];

            // البدء من الصفوف التي تحتوي على البيانات (تخطي العناوين)
            // ملاحظة: قد تحتاج لتعديل الرقم 8 بناءً على أول صف فيه اسم طالب في ملفك
            rows.forEach((row, index) => {
                // التأكد أن الصف يحتوي على اسم طالب (العمود رقم 51 تقريباً في ملفك)
                const studentName = row[51]; 
                
                if (studentName && index > 5) { // التأكد أنه ليس صف عنوان
                    const student = {
                        name: studentName.trim(),
                        searchName: normalize(studentName),
                        nationality: row[50] || "",
                        status: row[49] || "",
                        grades: {
                            "التربية الإسلامية": { score: row[46], level: row[44] },
                            "اللغة العربية": { score: row[41], level: row[39] },
                            "اللغة الإنجليزية": { score: row[36], level: row[34] },
                            "الرياضيات": { score: row[31], level: row[29] },
                            "العلوم": { score: row[26], level: row[24] },
                            "الدراسات الاجتماعية": { score: row[21], level: row[19] },
                            "تقنية المعلومات": { score: row[16], level: row[14] },
                            "التربية البدنية": { score: row[11], level: row[9] },
                            "الفنون البصرية": { score: row[6], level: row[4] },
                            "الفنون الموسيقية": { score: row[1], level: row[0] }
                        }
                    };
                    studentsData.push(student);
                }
            });

            if (studentsData.length === 0) {
                status.innerHTML = "⚠ لم يتم العثور على بيانات طلاب. تأكد من تنسيق الملف.";
                return;
            }

            // تنزيل الملف
            const jsonBlob = new Blob([JSON.stringify(studentsData, null, 2)], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(jsonBlob);
            a.download = "students_results.json";
            a.click();

            status.style.color = "green";
            status.innerHTML = `✔ تم تحويل ${studentsData.length} طالب بنجاح.`;

        } catch (err) {
            status.style.color = "red";
            status.innerHTML = "❌ خطأ في معالجة البيانات.";
            console.error(err);
        }
    };
    reader.readAsBinaryString(file);
}
