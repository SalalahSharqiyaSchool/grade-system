const searchBtn = document.getElementById("searchBtn");
const rankBtn   = document.getElementById("rankBtn");
const printBtn  = document.getElementById("printBtn");

let currentStudent = null;

function getDynamicFeedback(grade){
  if(grade>=90) return "أداء ممتاز! حافظ على هذا المستوى.";
  if(grade>=75) return "جيد جدًا، حاول التركيز على التفاصيل الصغيرة لتحسن أكثر.";
  if(grade>=50) return "مقبول، من الأفضل مراجعة الدروس الأساسية.";
  return "ضعيف، ينصح بعمل تمارين إضافية ومراجعة النقاط الأساسية.";
}

// روابط ملفات JSON من GitHub
const files = [
  "https://raw.githubusercontent.com/SalalahSharqiyaSchool/grade-system/main/grade5.json",
  "https://raw.githubusercontent.com/SalalahSharqiyaSchool/grade-system/main/grade6.json",
  "https://raw.githubusercontent.com/SalalahSharqiyaSchool/grade-system/main/grade7.json",
  "https://raw.githubusercontent.com/SalalahSharqiyaSchool/grade-system/main/grade8.json",
  "https://raw.githubusercontent.com/SalalahSharqiyaSchool/grade-system/main/grade9.json"
];

searchBtn.addEventListener("click", async ()=>{
  const civil = document.getElementById("civil").value.trim();
  const status = document.getElementById("status");
  const studentName = document.getElementById("studentName");
  const studentClass = document.getElementById("studentClass");
  const gradesList = document.getElementById("gradesList");
  const encouragement = document.getElementById("encouragement");

  status.textContent = studentName.textContent = studentClass.textContent = encouragement.textContent = "";
  gradesList.innerHTML = "";
  currentStudent = null;

  if(!civil){ status.textContent="الرجاء إدخال الرقم المدني"; return; }

  let foundStudent = null;
  for(const file of files){
    try{
      const res = await fetch(file+"?t="+Date.now());
      if(!res.ok) continue;
      const data = await res.json();
      const student = data.find(s=>s["رقم_مدني"].toString().trim()===civil);
      if(student){ foundStudent=student; break; }
    }catch{}
  }
  if(!foundStudent){ status.textContent="لم يتم العثور على الرقم المدني في أي صف."; return; }

  currentStudent = foundStudent;
  studentName.textContent = `الطالب: ${foundStudent["الاسم"]}`;
  studentClass.textContent = `الصف والشعبة: ${foundStudent["الصف"]} - ${foundStudent["الشعبة"]}`;

  let total=0,count=0;
  let html="<table><tr><th>المادة</th><th>الدرجة</th><th>ملاحظة</th></tr>";

  for(const key in foundStudent){
    if(!["رقم_مدني","الاسم","الصف","الشعبة"].includes(key)){
      const grade=parseFloat(foundStudent[key]);
      const feedback=getDynamicFeedback(grade);
      const color = grade>=90?"#A8E6A3":grade>=75?"#A3C9E6":grade>=50?"#FFD9A3":"#F7A8A8";
      html+=`<tr style="background-color:${color};"><td>${key}</td><td>${grade}</td><td>${feedback}</td></tr>`;
      total+=grade; count++;
    }
  }
  html+="</table>";
  gradesList.innerHTML = html;
  const avg=total/count;
  const msg = avg>=90?"أداء ممتاز جدًا":avg>=75?"المستوى: جيد جدًا":avg>=50?"المستوى: مقبول":"المستوى: ضعيف";
  encouragement.textContent=`${msg} --- متوسطك العام: ${avg.toFixed(2)}`;
});

rankBtn.addEventListener("click", async ()=>{
  const rankResult = document.getElementById("rankResult");
  if(!currentStudent){ rankResult.textContent="الرجاء عرض الدرجات أولاً"; return; }

  const classFile = `https://raw.githubusercontent.com/SalalahSharqiyaSchool/grade-system/main/grade${currentStudent["الصف"]}.json`;
  try{
    const res = await fetch(classFile+"?t="+Date.now());
    const data = await res.json();

    const studentsTotals = data.map(s=>{
      let total=0,count=0;
      for(const key in s){
        if(!["رقم_مدني","الاسم","الصف","الشعبة"].includes(key)){
          total+=parseFloat(s[key]);
          count++;
        }
      }
      return {name:s["الاسم"],civil:s["رقم_مدني"],total,average:total/count};
    });
    studentsTotals.sort((a,b)=>b.total-a.total);
    const top1=studentsTotals[0],top2=studentsTotals[1],top3=studentsTotals[2];
    const myRank=studentsTotals.findIndex(s=>s.civil==currentStudent["رقم_مدني"])+1;

    rankResult.innerHTML=`
      <table border="1" style="width:80%; margin:auto; border-collapse:collapse; text-align:center;">
        <tr><th>المركز</th><th>اسم الطالب</th><th>مجموع الدرجات</th></tr>
        <tr><td>الأول</td><td>${top1.name}</td><td>${top1.total}</td></tr>
        <tr><td>الثاني</td><td>${top2.name}</td><td>${top2.total}</td></tr>
        <tr><td>الثالث</td><td>${top3.name}</td><td>${top3.total}</td></tr>
      </table>
      <h3 style="margin-top:15px;text-align:center;">
        ترتيبك في الصف: <span style="color:blue;">${myRank}</span> من أصل ${studentsTotals.length} طالب
      </h3>
    `;
  }catch{ rankResult.textContent="حدث خطأ أثناء تحميل بيانات الصف"; }
});

printBtn.addEventListener("click", ()=>{
  if(!currentStudent){ alert("الرجاء عرض الدرجات أولاً"); return; }

  const schoolName="صلالة الشرقية للتعليم الأساسي (5-9)";
  const semester="الفصل الدراسي الأول 2025‑2026";
  const printWindow=window.open("","", "width=800,height=700");
  printWindow.document.write("<html><head><title>كشف الدرجات</title>");
  printWindow.document.write("<style>body{text-align:center;font-family:Arial,sans-serif;}table{width:80%;margin:0 auto;border-collapse:collapse;direction:rtl;}th,td{border:1px solid #333;padding:8px;}th:first-child,td:first-child{text-align:right;}th:nth-child(2),td:nth-child(2){text-align:center;}th:last-child,td:last-child{text-align:left;}</style></head><body>");
  printWindow.document.write(`<h2>${schoolName}</h2><h3>${semester}</h3><h3>${document.getElementById("studentName").innerHTML}</h3>`);
  printWindow.document.write(`<p>${document.getElementById("studentClass").innerHTML}</p><p>${document.getElementById("encouragement").innerHTML}</p>`);
  const tableHTML=document.getElementById("gradesList").querySelector("table").outerHTML;
  printWindow.document.write(tableHTML);
  printWindow.document.write(`<p style="margin-top:20px; font-size:14px; color:#555;">© 2025 - جميع الحقوق محفوظة للأستاذ فيصل العريبي</p>`);
  printWindow.document.write("</body></html>");
  printWindow.document.close();
  printWindow.print();
});
