# Next.js PouchDB Authentication Setup

## Installation Steps

1. **Create a new Next.js app:**
   ```bash
   npx create-next-app@latest school-management-system
   cd school-management-system
   ```

2. **Install dependencies:**
   ```bash
   npm install pouchdb pouchdb-find
   ```

3. **Install Tailwind CSS:**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

4. **Configure Tailwind CSS (`tailwind.config.js`):**
   ```javascript
   /** @type {import('tailwindcss').Config} */
   module.exports = {
     content: [
       './pages/**/*.{js,ts,jsx,tsx,mdx}',
       './components/**/*.{js,ts,jsx,tsx,mdx}',
       './app/**/*.{js,ts,jsx,tsx,mdx}',
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

5. **Add Tailwind directives to `app/globals.css`:**
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

6. **Create the file structure:**
   ```
   app/
   ├── layout.js
   ├── page.js
   ├── login/
   │   └── page.js
   ├── dashboard/
   │   └── page.js
   ├── admin/
   │   └── page.js
   ├── teachers/
   │   └── page.js
   └── unauthorized/
       └── page.js
   
   components/
   ├── LoginForm.js
   ├── Dashboard.js
   ├── ProtectedRoute.js
   └── UserManagement.js
   
   contexts/
   └── AuthContext.js
   
   lib/
   └── db.js
   ```

## Key Features

### Authentication System
- **PouchDB Integration**: Uses PouchDB for local data storage
- **Session Management**: Handles user sessions with expiration
- **Role-based Access**: Four user roles (Admin, Teacher, Student, Parent)
- **Predefined Users**: Comes with sample admin and teacher accounts

### Predefined Test Accounts
- **Admin**: admin@school.com / admin123
- **Teacher 1**: john.doe@school.com / teacher123 (Grade 5, Code: T5001)
- **Teacher 2**: jane.smith@school.com / teacher123 (Grade 3, Code: T3002)

### Authorization Features
- **Route Protection**: Protects pages based on user roles
- **Component-level Auth**: Conditional rendering based on permissions
- **Role Hierarchy**: Admin > Teacher > Student > Parent
- **Protected Components**: AdminOnly, TeacherAndAdmin, AuthenticatedOnly

### Database Schema

#### Users Collection
```javascript
{
  _id: "user_id",
  email: "user@example.com",
  password: "hashed_password", // In production, use proper hashing
  role: "admin|teacher|student|parent",
  fullName: "Full Name",
  classLevel: "Grade 5", // Teachers only
  teacherPassCode: "T5001", // Teachers only
  isActive: true,
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

#### Sessions Collection
```javascript
{
  _id: "session_id",
  userId: "user_id",
  role: "user_role",
  createdAt: "2024-01-01T00:00:00.000Z",
  expiresAt: "2024-01-02T00:00:00.000Z"
}
```

## Usage Examples

### Protecting Routes
```javascript
// Admin only page
import { AdminOnly } from '@/components/ProtectedRoute'

export default function AdminPage() {
  return (
    <AdminOnly>
      <div>Admin content here</div>
    </AdminOnly>
  )
}

// Teacher and Admin page
import { TeacherAndAdmin } from '@/components/ProtectedRoute'

export default function TeachersPage() {
  return (
    <TeacherAndAdmin>
      <div>Teacher content here</div>
    </TeacherAndAdmin>
  )
}
```

### Using Authentication Context
```javascript
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, hasRole, logout } = useAuth()
  
  if (hasRole('admin')) {
    return <AdminPanel />
  }
  
  return <RegularContent />
}
```

### Creating New Users
```javascript
import { createUser, USER_ROLES } from '@/lib/db'

const newStudent = {
  email: 'student@example.com',
  password: 'student123',
  fullName: 'John Student',
  role: USER_ROLES.STUDENT
}

const result = await createUser(newStudent)
```

## Security Considerations

### Current Implementation (Development)
- Passwords stored in plain text
- Client-side session storage
- No password complexity requirements
- No rate limiting

### Production Recommendations
1. **Hash passwords** using bcrypt or similar
2. **Use HTTPS** for all communications
3. **Implement rate limiting** for login attempts
4. **Add password complexity** requirements
5. **Use secure session storage** (httpOnly cookies)
6. **Add CSRF protection**
7. **Implement proper error handling**
8. **Add logging and monitoring**

## Running the Application

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   Navigate to `http://localhost:3000`

3. **Login with test accounts:**
   Use the predefined accounts to test different role permissions

## File Structure Explanation

- **`lib/db.js`**: Database initialization and authentication functions
- **`contexts/AuthContext.js`**: React context for authentication state
- **`components/ProtectedRoute.js`**: Route protection components
- **`components/LoginForm.js`**: Login form component
- **`components/Dashboard.js`**: Role-based dashboard
- **`components/UserManagement.js`**: Admin user management interface

## Extending the System

### Adding New Roles
1. Add role to `USER_ROLES` in `lib/db.js`
2. Update role hierarchy in `hasPermission` function
3. Create role-specific components and pages
4. Update dashboard to handle new role

### Adding New Features
1. Create new PouchDB collections for additional data
2. Add new API functions in `lib/db.js`
3. Create corresponding UI components
4. Implement proper authorization checks

This setup provides a solid foundation for a school management system with proper authentication and authorization using PouchDB in a Next.js application.

