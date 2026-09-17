\# GlowSense AI – AI Skin Intelligence \& Personalized Skincare Planner



GlowSense AI is an AI-assisted personalized skincare web application that helps users understand their skin, generate personalized skincare routines, explore skincare products and ingredients, monitor skin health, and track progress over time.



\## ✨ Key Features



\* 🔐 User authentication and role-based access

\* 🧴 Personalized skin assessment

\* 🤖 AI-assisted skin intelligence

\* 🌅 Morning and evening skincare routines

\* 📅 Weekly and seasonal skincare routines

\* 🧪 Ingredient intelligence and interaction analysis

\* 🛍️ Personalized product recommendations

\* 📊 Skin Health Score

\* 📈 Skin progress and trend analysis

\* ✅ Routine adherence tracking

\* 👤 User Dashboard

\* 👨‍💼 Consultant Dashboard

\* 👩‍⚕️ Dermatologist Dashboard

\* 🛠️ Admin Dashboard

\* 💬 Consultation and recommendation workflows



\## 📚 Project Modules



| Module    | Description                             |

| --------- | --------------------------------------- |

| Module 1  | User Authentication \& Role-Based Access |

| Module 2  | Skin Profile Management                 |

| Module 3  | Skin Assessment Engine                  |

| Module 4  | Personalized Routine Generator          |

| Module 5  | Ingredient Intelligence Module          |

| Module 6  | Product Recommendation Engine           |

| Module 7  | Skin Health Scoring Engine              |

| Module 8  | Progress Tracking \& Analytics           |

| Module 9  | Dashboard \& Analytics                   |

| Module 10 | Notification \& Reminder System          |

| Module 11 | Reports \& Export System                 |

| Module 12 | Final Integration, Testing \& Deployment |



\## 🧴 Personalized Routine Generator



The routine generator creates personalized skincare routines based on available user assessment and profile information.



Routine types include:



\* Morning routine

\* Evening routine

\* Weekly routine

\* Seasonal routine



Routine categories include cleansing, exfoliation, treatment, moisturizing, sun protection, and night care.



\## 🧪 Ingredient Intelligence



The Ingredient Intelligence module helps users understand skincare ingredients and their suitability.



It supports analysis related to:



\* Ingredient suitability

\* Ingredient interactions

\* Allergy-related conflicts

\* Ingredient education



Examples include Retinoids, Niacinamide, Vitamin C, Hyaluronic Acid, Salicylic Acid, Ceramides, Peptides, and AHAs/BHAs.



\## 🛍️ Product Recommendations



GlowSense AI connects recommendations with the application's product catalog.



Product information can include:



\* Product name

\* Product image

\* Price

\* Product suitability

\* Ingredient considerations

\* External shopping links



Suitability can consider skin type, skin concerns, sensitivity, allergies, and ingredient conflicts.



\## 📊 Skin Health Score



The Skin Health Scoring Engine calculates a numerical skin health score using available assessment-related information.



Historical scores can be used to observe changes over time.



\## 📈 Progress Tracking \& Analytics



Module 8 provides:



\* Skin progress monitoring

\* Routine adherence tracking

\* Improvement analysis

\* Before/after comparison support

\* Trend analysis



Routine completion information is persisted using the `routine\_completions` data model.



Progress analysis can include:



\* Acne

\* Pigmentation

\* Redness

\* Dryness

\* Oiliness

\* Sensitivity

\* Hydration

\* Fine lines

\* Visible pores



The application uses real stored data rather than fabricated progress values.



\## 📊 Dashboard \& Analytics



\### User Dashboard



Provides access to:



\* Skin Health Score

\* Personalized Routine

\* Product Recommendations

\* Progress Tracking

\* Routine Adherence



\### Consultant Dashboard



Provides consultant-specific workflows including recommendation management and user-related information.



\### Dermatologist Dashboard



Provides dermatologist-specific workflows including treatment recommendations and progress analysis.



\### Admin Dashboard



Provides administrative monitoring and analytics including:



\* Platform Analytics

\* Recommendation Monitoring

\* System Reports

\* Routine statistics

\* Product recommendation statistics

\* Feedback statistics



\## 🏗️ Technology Stack



\### Frontend



\* HTML5

\* CSS3

\* JavaScript

\* Vite



\### Backend



\* Node.js

\* Express.js



\### Database



\* Supabase

\* PostgreSQL



\### Authentication



\* Supabase Authentication



\### AI / ML



\* Gemini / configured ML services



\### Version Control



\* Git

\* GitHub



\## 🗄️ Database



Important database tables include:



\* `profiles`

\* `user\_profiles`

\* `skin\_assessments`

\* `assessment\_concerns`

\* `assessment\_risks`

\* `recommendations`

\* `consultation\_requests`

\* `consultations`

\* `routines`

\* `routine\_feedback`

\* `adaptive\_updates`

\* `products`

\* `product\_recommendations`

\* `ingredients`

\* `ingredient\_interactions`

\* `ingredient\_analyses`

\* `skin\_health\_scores`

\* `routine\_completions`



\## 📁 Project Structure



```text

infosys-glowsense/

│

├── backend/

├── frontend/

│   ├── admin/

│   ├── consultant/

│   ├── dermatologist/

│   ├── user/

│   └── js/

│

├── ml-service/

├── supabase/

├── Documentation/

│   ├── GlowSense\_AI\_Technical\_Documentation.docx

│   └── GlowSense\_AI\_User\_Guide.docx

│

├── package.json

└── README.md

```



\## ⚙️ Installation \& Setup



\### 1. Clone the repository



```bash

git clone <repository-url>

cd infosys-glowsense

```



\### 2. Install dependencies



```bash

npm install

```



\### 3. Configure environment variables



Configure the required Supabase and AI/ML service credentials in the appropriate environment configuration.



Do not expose private API keys or service-role credentials in frontend code or GitHub.



\### 4. Start the application



```bash

npm run dev

```



Open the Vite URL displayed in the terminal.



\## 🔐 Authentication \& Roles



GlowSense AI uses authentication to protect user accounts and application data.



The application supports role-based dashboards for:



\* User

\* Skincare Consultant

\* Dermatologist

\* Administrator



Users are directed to the appropriate dashboard after authentication.



\## 🧪 Testing



The project includes validation such as:



\* JavaScript syntax checks

\* HTML structure checks

\* Duplicate-ID checks

\* Database migration checks

\* Dashboard feature checks

\* Routine completion persistence checks

\* Product recommendation checks

\* Loading, empty, and error-state checks



\## 📖 Documentation



Detailed documentation is available in the `Documentation` folder:



\* \*\*GlowSense AI Technical Documentation\*\* – technical architecture, modules, database, setup, testing, and security.

\* \*\*GlowSense AI User Guide\*\* – instructions for using the application's major features and dashboards.



\## 🔒 Security



The application should follow these practices:



\* Keep private credentials secure.

\* Use authenticated sessions for protected data.

\* Apply appropriate database access policies.

\* Validate API inputs.

\* Do not expose sensitive user information.

\* Never commit private API keys or service credentials.



\## 🚀 Future Enhancements



Possible future improvements include:



\* Advanced longitudinal skin analytics

\* Expanded product catalog integrations

\* Additional AI/ML capabilities

\* More automated end-to-end testing

\* Improved deployment automation



\## 👩‍💻 Project



\*\*GlowSense AI – Skin Intelligence \& Personalized Skincare Planner\*\*



An integrated skincare intelligence platform combining assessment, personalization, AI-assisted recommendations, ingredient intelligence, skin health scoring, progress tracking, and role-based analytics.



