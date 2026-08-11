# 📘 Beginner's Guide — Learning the Project from Scratch

Welcome! This guide is written in simple, plain language to help you understand every part of the **AI Skin Intelligence & Personalized Skincare Planner** project even if you are learning web development and AI for the first time.

---

## 1. What is This Project? (Analogy Time! 💡)

Imagine you want to take care of your skin, but you don't know which cream or lotion to buy. You go to a store, see 100 different bottles, and end up buying something that makes your skin red or dry.

**AI Skin Intelligence** is like having a **personal dermatologist in your pocket**:
1. You take a selfie or upload a photo of your face.
2. The AI scans your photo and tells you: *"You have 15% redness, 80% dryness, and your skin needs hydration."*
3. The platform generates a step-by-step morning and evening routine for you.
4. It checks if the products you are using are safe to mix together.

---

## 2. Key Terms Explained Simply

| Technical Term | Simple Explanation | Everyday Analogy |
| :--- | :--- | :--- |
| **Frontend (React)** | The visual part of the website you see and click on. | The dashboard and steering wheel of a car. |
| **Backend (FastAPI)** | The invisible engine that processes requests, checks passwords, and runs calculations. | The car engine under the hood. |
| **Database (PostgreSQL)** | The digital filing cabinet that safely stores user accounts, scan histories, and profiles. | A secure bank vault with filing drawers. |
| **JWT (JSON Web Token)** | A digital key card given to you when you log in so the server knows who you are. | A hotel room key card. |
| **Pillow (Image Processor)** | A Python library that resizes, rotates, and cleans up uploaded photos before AI scans them. | A digital photo editing app. |

---

## 3. How Data Moves Through the Website

```
1. You click "Scan Image" in your browser.
                      ↓
2. React packages your image and sends an HTTP request to FastAPI.
                      ↓
3. FastAPI receives the image, checks your JWT key card, and passes the photo to Pillow.
                      ↓
4. Pillow resizes the photo and the AI engine calculates scores for Acne, Redness, and Dryness.
                      ↓
5. The result is saved to PostgreSQL and sent back to your browser.
                      ↓
6. React displays colorful progress bars and recommendations on your screen.
```
