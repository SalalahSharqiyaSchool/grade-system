function convertExcel() {
    const fileInput = document.getElementById("excelFile");
    const status = document.getElementById("status");

    if (!fileInput.files.length) {
        status.innerHTML = "الرجاء اختيار ملف Excel أولاً.";
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // تحويل Excel إلى JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // حفظ JSON في ملف
        const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });

        const a = document.createElement("a");
        a.href = URL.createObjectURL(jsonBlob);
        a.download = "grades.json";
        a.click();

        status.innerHTML = "تم توليد ملف JSON — قم الآن برفعه إلى GitHub.";
    };

    reader.readAsBinaryString(file);
}
