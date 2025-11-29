function convertExcel() {
    const fileInput = document.getElementById("excelFile");
    const status = document.getElementById("status");

    // مسح الرسالة السابقة
    status.innerHTML = "";
    status.style.color = "red";

    // التأكد أن المستخدم اختار ملف
    if (!fileInput.files.length) {
        status.innerHTML = "⚠ الرجاء اختيار ملف Excel أولاً.";
        return;
    }

    const file = fileInput.files[0];
    const fileName = file.name.toLowerCase();

    // فحص نوع الملف
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
        status.innerHTML = "⚠ الملف يجب أن يكون بصيغة Excel فقط.";
        return;
    }

    status.style.color = "blue";
    status.innerHTML = "⏳ جاري قراءة الملف…";

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: "binary" });

            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // تحويل البيانات إلى JSON
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            // التحقق أن الملف فيه بيانات
            if (jsonData.length === 0) {
                status.style.color = "red";
                status.innerHTML = "⚠ الملف فارغ ولا يحتوي بيانات.";
                return;
            }

            // إنشاء ملف JSON
            const jsonBlob = new Blob(
                [JSON.stringify(jsonData, null, 2)],
                { type: "application/json" }
            );

            const a = document.createElement("a");
            a.href = URL.createObjectURL(jsonBlob);
            a.download = "grades.json";
            a.click();

            status.style.color = "green";
            status.innerHTML = "✔ تم تحويل الملف وتنزيل JSON بنجاح.";
        }

        catch (err) {
            status.style.color = "red";
            status.innerHTML = "❌ حدث خطأ أثناء تحويل الملف.";
            console.error("Excel Error:", err);
        }
    };

    reader.readAsBinaryString(file);
}
