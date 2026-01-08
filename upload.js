import pandas as pd
import json
import os

def convert_excel_to_json(file_path, output_path):
    # قراءة ملف الإكسل بدون ترويسة
    df = pd.read_excel(file_path, header=None)
    
    students_data = []
    
    # تعريف المواد ومواقعها النسبية بناءً على التحليل الدقيق:
    # المادة: (عمود الدرجة، عمود المستوى)
    # ملاحظة: الترتيب في الملف من اليمين لليسار (الأعمدة الأعلى رقماً للمواد الأولى)
    # التربية الإسلامية: درجة 48، مستوى 46
    # اللغة العربية: درجة 43، مستوى 41
    # اللغة الإنجليزية: درجة 38، مستوى 36
    # الرياضيات: درجة 33، مستوى 30 (أو 31)
    # العلوم: درجة 28، مستوى 25 (أو 26)
    # الدراسات الاجتماعية: درجة 23، مستوى 21
    # تقنية المعلومات: درجة 19، مستوى 16
    # التربية البدنية: درجة 13، مستوى 11
    # الفنون البصرية: درجة 9، مستوى 6
    # الفنون الموسيقية: درجة 3، مستوى 1
    
    subjects_mapping = {
        "التربية الإسلامية": (48, 46),
        "اللغة العربية": (43, 41),
        "اللغة الإنجليزية": (38, 36),
        "الرياضيات": (33, 30),
        "العلوم": (28, 25),
        "الدراسات الاجتماعية": (23, 21),
        "تقنية المعلومات": (19, 16),
        "التربية البدنية": (13, 11),
        "الفنون البصرية": (9, 6),
        "الفنون الموسيقية": (3, 1)
    }
    
    # البحث عن الصفوف التي تحتوي على بيانات الطلاب
    # عمود حالة القيد هو 50، وعمود الاسم هو 53
    for index, row in df.iterrows():
        # تحويل الصف بالكامل لنصوص للبحث عن كلمة "منقول" أو "مستجد"
        row_str = row.astype(str).tolist()
        if "منقول" in row_str or "مستجد" in row_str:
            status = "منقول" if "منقول" in row_str else "مستجد"
            
            # الاسم موجود في العمود 53 بناءً على الفحص
            student_name = str(row[53]).strip()
            
            # استخراج الدرجات والمستويات لكل مادة
            results = {}
            for subject, (score_col, level_col) in subjects_mapping.items():
                score = row[score_col]
                level = row[level_col]
                
                # تنظيف البيانات
                try:
                    score_val = float(score) if pd.notnull(score) and str(score).replace('.','',1).isdigit() else (score if pd.notnull(score) else "")
                    if isinstance(score_val, float) and score_val.is_integer():
                        score_val = int(score_val)
                except:
                    score_val = str(score) if pd.notnull(score) else ""
                    
                level_val = str(level).strip() if pd.notnull(level) else ""
                
                results[subject] = {
                    "score": score_val,
                    "level": level_val
                }
            
            student_entry = {
                "name": student_name,
                "status": status,
                "results": results
            }
            students_data.append(student_entry)
    
    # حفظ البيانات في ملف JSON
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(students_data, f, ensure_ascii=False, indent=4)
    
    return len(students_data)

if __name__ == "__main__":
    input_file = "/home/ubuntu/upload/report-grade5.xls"
    output_file = "/home/ubuntu/students_data.json"
    
    try:
        count = convert_excel_to_json(input_file, output_file)
        print(f"Successfully processed {count} students.")
    except Exception as e:
        import traceback
        print(f"Error: {e}")
        traceback.print_exc()
