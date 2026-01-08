import pandas as pd
import json
import os

def convert_excel_to_json(file_path, output_path):
    # قراءة ملف الإكسل بدون ترويسة
    df = pd.read_excel(file_path, header=None)
    
    students_data = []
    
    # الكلمات المستبعدة التي لا يمكن أن تكون اسماً للطالب
    excluded_keywords = ["عماني", "ذكر", "أنثى", "الجنسية", "الاسم", "مستجد", "منقول"]
    
    # تعريف المواد ومواقعها النسبية بناءً على التحليل الدقيق
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
    
    for index, row in df.iterrows():
        row_str_list = [str(cell).strip() for cell in row.tolist()]
        
        # التحقق من وجود حالة القيد في الصف
        if "منقول" in row_str_list or "مستجد" in row_str_list:
            status = "منقول" if "منقول" in row_str_list else "مستجد"
            
            # استخراج الاسم من العمود 53
            name_candidate = str(row[53]).strip()
            
            # تطبيق شروط الأمان الإضافية
            # 1. التأكد أن الاسم ليس من الكلمات المستبعدة
            # 2. التأكد أن الاسم ليس فارغاً أو مجرد أرقام
            # 3. التأكد من طول الاسم (الأسماء الحقيقية عادة أطول من 10 أحرف في هذا الملف)
            if (name_candidate not in excluded_keywords and 
                not name_candidate.isdigit() and 
                len(name_candidate) > 5):
                
                student_name = name_candidate
                
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
        print(f"Successfully processed {count} students with enhanced security filters.")
    except Exception as e:
        import traceback
        print(f"Error: {e}")
        traceback.print_exc()
