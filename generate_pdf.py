import os
import re
from fpdf import FPDF

class DocPDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 8)
        self.set_text_color(120, 120, 120)
        title_text = "AI Skin Intelligence Platform - Complete Technical Documentation"
        self.cell(0, 10, title_text, 0, new_x="LMARGIN", new_y="NEXT", align='R')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def create_documentation_pdf():
    pdf = DocPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    files_to_convert = [
        "PROJECT_DOCUMENTATION.md",
        "PROJECT_SUMMARY.md",
        "ARCHITECTURE.md",
        "FRONTEND_GUIDE.md",
        "BACKEND_GUIDE.md",
        "AI_MODULE_GUIDE.md",
        "API_DOCUMENTATION.md",
        "DATABASE_GUIDE.md",
        "DEPLOYMENT_GUIDE.md",
        "MENTOR_PRESENTATION_GUIDE.md",
        "BEGINNER_LEARNING_GUIDE.md",
        "INTERVIEW_PREPARATION.md"
    ]
    
    base_dir = r"c:\Users\LENOVO\OneDrive\Desktop\infosys internship"
    
    # Title Page
    pdf.add_page()
    pdf.set_font("helvetica", "B", 24)
    pdf.set_text_color(15, 23, 42) # slate-900
    pdf.ln(50)
    pdf.cell(0, 15, "AI Skin Intelligence Platform", 0, new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_font("helvetica", "", 13)
    pdf.set_text_color(100, 116, 139) # slate-500
    pdf.cell(0, 10, "Complete Technical Documentation & Handover Package", 0, new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(40)
    
    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(79, 70, 229) # indigo-600
    pdf.cell(0, 8, "Target Audience: Mentors, Evaluators, and Developers", 0, new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_font("helvetica", "", 9)
    pdf.set_text_color(150, 150, 150)
    pdf.cell(0, 8, "Generated on: 2026-08-06", 0, new_x="LMARGIN", new_y="NEXT", align="C")
    
    # Process files
    for filename in files_to_convert:
        filepath = os.path.join(base_dir, filename)
        if not os.path.exists(filepath):
            continue
            
        pdf.add_page()
        pdf.set_x(15)
        pdf.set_font("helvetica", "B", 16)
        pdf.set_text_color(79, 70, 229)
        pdf.cell(pdf.epw, 10, filename.replace(".md", "").replace("_", " "), 0, new_x="LMARGIN", new_y="NEXT")
        pdf.ln(5)
        
        with open(filepath, "r", encoding="utf-8") as f:
            lines = f.readlines()
            
        in_mermaid = False
        
        for line in lines:
            line = line.strip()
            if not line:
                pdf.ln(2)
                continue
                
            # Filter out Mermaid blocks for clean text presentation
            if line.startswith("```mermaid"):
                in_mermaid = True
                continue
            if in_mermaid and line.startswith("```"):
                in_mermaid = False
                continue
            if in_mermaid:
                continue
                
            # Basic markdown translation & unicode cleaning
            line = line.replace("\u2014", "-").replace("\u201c", '"').replace("\u201d", '"').replace("\u2192", "->").replace("\u22a5", "T").replace("\u2264", "<=").replace("\u2265", ">=")
            line = re.sub(re.escape("file:///") + r"\S+", "", line)
            line = re.sub(r"\[([^\]]+)\]\([^\)]*\)", r"\1", line)
            line = re.sub(r"\*\*([^*]+)\*\*", r"\1", line)
            line = line.replace("`", "")
            
            # Skip diagram/table ASCII frames to prevent text width exceptions
            if "+" in line and "-" in line and len(line) > 15:
                continue
            if line.startswith("|") and line.endswith("|") and "---" in line:
                continue
                
            # Split extremely long words (like continuous hyphens or URLs) to fit margins safely
            words = line.split(" ")
            sanitized_words = []
            for word in words:
                if len(word) > 30:
                    word = word[:30] + "..."
                sanitized_words.append(word)
            line = " ".join(sanitized_words)
            
            # Escape to latin-1
            safe_line = line.encode('latin-1', 'replace').decode('latin-1')
            
            # Guarantee cursor resets to left margin before printing line
            pdf.set_x(15)
            w = pdf.epw
            
            if safe_line.startswith("# "):
                pdf.ln(4)
                pdf.set_x(15)
                pdf.set_font("helvetica", "B", 13)
                pdf.set_text_color(15, 23, 42)
                pdf.multi_cell(w, 6, safe_line[2:])
                pdf.ln(1)
            elif safe_line.startswith("## "):
                pdf.ln(3)
                pdf.set_x(15)
                pdf.set_font("helvetica", "B", 11)
                pdf.set_text_color(15, 23, 42)
                pdf.multi_cell(w, 5, safe_line[3:])
                pdf.ln(1)
            elif safe_line.startswith("### "):
                pdf.ln(2)
                pdf.set_x(15)
                pdf.set_font("helvetica", "B", 10)
                pdf.set_text_color(79, 70, 229)
                pdf.multi_cell(w, 5, safe_line[4:])
            elif safe_line.startswith("- ") or safe_line.startswith("* "):
                pdf.set_font("helvetica", "", 9)
                pdf.set_text_color(71, 85, 105)
                pdf.multi_cell(w, 5, f"  o  {safe_line[2:]}")
            else:
                # Text normal
                pdf.set_font("helvetica", "", 9)
                pdf.set_text_color(71, 85, 105)
                pdf.multi_cell(w, 4.5, safe_line)

    output_pdf_path = os.path.join(base_dir, "PROJECT_DOCUMENTATION_PACKAGE.pdf")
    pdf.output(output_pdf_path)
    print(f"[OK] Generated consolidated PDF: {output_pdf_path}")

if __name__ == "__main__":
    create_documentation_pdf()
