Set-Content README.md @"
# 🏥 CareSync - Full Stack Healthcare System

CareSync is a comprehensive healthcare management platform featuring an administrator dashboard, a medical staff interface, and a client-facing web application.

## 📁 Project Structure

- **Backend/**: Node.js & Express API with MongoDB and Cloudinary integrations.
- **Frontend/**: Patient application for searching doctors and booking appointments.
- **admin/**: Administrative portal for managing doctors, schedules, and analytics.

## ⚙️ Local Installation & Setup

### 1. Install Dependencies
Run the installation command inside each of the three directories:
\`\`\`bash
cd Backend && npm install
cd ../Frontend && npm install
cd ../admin && npm install
\`\`\`

### 2. Environment Variables (.env)
Create a \`.env\` file inside the **Backend** folder and include your configurations:
\`\`\`text
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_secret_key
JWT_SECRET=your_jwt_secret
\`\`\`

### 3. Run the Applications
Open separate terminals for each service and launch them:
\`\`\`bash
# Backend Server
cd Backend && npm run dev

# Frontend Client
cd Frontend && npm run dev

# Admin Panel
cd admin && npm run dev
\`\`\`
"@
