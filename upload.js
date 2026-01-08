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
    status.innerHTML = "⏳ جاري قراءة كشف مدرسة صلالة الشرقية...";

    reader.onload = function (e) {
        try {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            
            // قراءة البيانات كمصفوفة خام مع الاحتفاظ بالخانات الفارغة لضبط الترقيم
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

            const normalize = (name) => {
                if (!name) return "";
                return name.toString().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();
            };

            const studentsData = [];

            rows.forEach((row, index) => {
                // في ملفك: الاسم موجود في العمود رقم 51
                // الحالة (منقول/مستجد) في العمود رقم 49
                const studentName = row[51]; 
                const statusField = row[49];

                // نتأكد أن الصف يحتوي على اسم طالب وليس عنواناً جانبياً
                if (studentName && (statusField === "منقول" || statusField === "مستجد")) {
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
                status.style.color = "red";
                status.innerHTML = "⚠ لم يتم العثور على طلاب. يرجى التأكد من اختيار الملف الصحيح.";
                return;
            }

            // تحميل الملف الناتج
            const jsonBlob = new Blob([JSON.stringify(studentsData, null, 2)], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(jsonBlob);
            a.download = "grades_data.json";
            a.click();

            status.style.color = "green";
            status.innerHTML = `✔ تم بنجاح! تحويل بيانات ${studentsData.length} طالب.`;

        } catch (err) {
            status.style.color = "red";
            status.innerHTML = "❌ حدث خطأ أثناء المعالجة.";
            console.error(err);
        }
    };
    reader.readAsBinaryString(file);
}
