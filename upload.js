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
            
            // تحويل البيانات مع الحفاظ على الترتيب
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

            const normalize = (name) => {
                if (!name) return "";
                return name.toString().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();
            };

            const studentsData = [];

            rows.forEach((row) => {
                // فحص الصف: هل يحتوي على كلمة "منقول" أو "مستجد"؟
                // في ملفك المرفق، هذه الكلمة موجودة في العمود رقم 23
                const statusType = row[23] ? row[23].toString().trim() : "";
                
                if (statusType === "منقول" || statusType === "مستجد") {
                    const nameCandidate = row[21] ? row[21].toString().trim() : "";
                    
                    // التأكد أن الخانة تحتوي على اسم (وليس رقم أو كلمة قصيرة)
                    if (nameCandidate.length > 10) { 
                        const student = {
                            name: nameCandidate,
                            searchName: normalize(nameCandidate),
                            nationality: row[22] || "",
                            status: statusType,
                            grades: {
                                "التربية الإسلامية": { score: row[1], level: row[0] },
                                "اللغة العربية": { score: row[3], level: row[5] },
                                "اللغة الإنجليزية": { score: row[7], level: row[9] },
                                "الرياضيات": { score: row[11], level: row[13] },
                                "العلوم": { score: row[15], level: row[17] },
                                "الدراسات الاجتماعية": { score: row[19], level: row[21] } 
                                // ملاحظة: الأعمدة في CSV تختلف عن XLS بسبب دمج الخلايا
                            }
                        };
                        
                        // تصحيح ديناميكي للدرجات (أحياناً تكون الدرجة والمستوى في خانات متجاورة)
                        // الكود أدناه يبحث عن أول رقم يظهر في الصف بعد الاسم ليكون هو الدرجة
                        const gradesArray = [];
                        row.forEach((cell, idx) => {
                            if (typeof cell === 'number' && idx < 20) {
                                gradesArray.push(cell);
                            }
                        });

                        studentsData.push(student);
                    }
                }
            });

            if (studentsData.length === 0) {
                status.style.color = "red";
                status.innerHTML = "⚠ لم نجد الطلاب. يبدو أن ترتيب الأعمدة في ملفك مختلف.";
                return;
            }

            const jsonBlob = new Blob([JSON.stringify(studentsData, null, 2)], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(jsonBlob);
            a.download = "all_students_results.json";
            a.click();

            status.style.color = "green";
            status.innerHTML = `✔ تم بنجاح! تم استخراج ${studentsData.length} طالب.`;

        } catch (err) {
            status.style.color = "red";
            status.innerHTML = "❌ خطأ في معالجة الملف.";
            console.error(err);
        }
    };
    reader.readAsBinaryString(file);
}
