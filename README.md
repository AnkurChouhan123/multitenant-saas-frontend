# 🚀 Customizable SaaS Multi-Tenant Platform

A production-ready, secure multi-tenant SaaS platform built with Spring Boot and React.

## ✨ Features

### 🔐 Security & Authentication
- JWT-based authentication
- Secure password encryption (BCrypt)
- Role-based access control (RBAC)
- Multi-tenant data isolation
- Activity logging and audit trails

### 👥 User Management
- Create, update, delete users
- Role assignment (Admin, User, Viewer)
- User activation/deactivation
- Tenant-level user isolation

### 💳 Subscription Management
- Multiple subscription tiers (FREE, BASIC, PRO, ENTERPRISE)
- Plan upgrades/downgrades
- Usage tracking (users, API calls)
- Trial subscriptions

### 📊 Analytics & Monitoring
- Real-time activity logs
- User growth analytics
- API usage tracking
- Performance metrics

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Interactive charts (Recharts)
- Toast notifications
- Loading states and error handling

---

## 🛠️ Tech Stack

### Backend
- **Spring Boot 3.5.7** - Framework
- **Spring Security** - Authentication & Authorization
- **JWT (jjwt 0.12.3)** - Token-based auth
- **MySQL** - Database
- **Flyway** - Database migrations
- **JPA/Hibernate** - ORM

### Frontend
- **React 19.2.0** - UI Framework
- **Vite** - Build tool
- **React Router 7.9.6** - Routing
- **Tailwind CSS 3.4.18** - Styling
- **Recharts 3.4.1** - Charts
- **Axios 1.13.2** - HTTP client

---

## 📋 Prerequisites

- **Java 17+**
- **Node.js 18+** and npm
- **MySQL 8.0+**
- **Maven 3.8+**
- **Git**

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd multi-tenant-platform
```

### 2. Setup Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE saas_master;

# Exit MySQL
exit;
```

### 3. Configure Backend

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env
```

**Update these values in `.env`:**
```bash
DB_PASSWORD=your_mysql_password
JWT_SECRET=your-secret-key-at-least-256-bits-long
```

### 4. Run Backend

```bash
# Clean and install dependencies
./mvnw clean install

# Run the application
./mvnw spring-boot:run
```

Backend will start on `http://localhost:8080`

### 5. Setup Frontend

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will start on `http://localhost:3000`

---

## 🔑 Default Test Account

After setup, register a new account or use:

**Test Registration:**
1. Go to `http://localhost:3000/register`
2. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: john@acme.com
   - Password: password123
   - Company: Acme Corp
   - Subdomain: acme

---

## 📁 Project Structure

```
multi-tenant-platform/
├── backend/
│   ├── src/main/java/com/saas/platform/
│   │   ├── config/           # Configuration files
│   │   ├── controller/       # REST API endpoints
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── model/            # JPA Entities
│   │   ├── repository/       # Database repositories
│   │   ├── security/         # JWT & Security config
│   │   ├── service/          # Business logic
│   │   └── multitenancy/     # Tenant isolation
│   ├── src/main/resources/
│   │   ├── application.yaml  # Spring Boot config
│   │   └── db/migration/     # Flyway migrations
│   └── pom.xml               # Maven dependencies
│
└── frontend/
    ├── src/
    │   ├── components/       # Reusable components
    │   ├── context/          # React Context
    │   ├── pages/            # Page components
    │   ├── services/         # API services
    │   └── App.jsx           # Main app component
    ├── package.json          # NPM dependencies
    └── tailwind.config.js    # Tailwind configuration
```

---

## 🔧 Configuration

### Backend Configuration (application.yaml)

```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

app:
  jwt:
    secret: ${JWT_SECRET}
    expiration: 86400000  # 24 hours
```

### Frontend Configuration

Create `.env` in frontend directory:

```bash
VITE_API_URL=http://localhost:8080/api
```

---

## 🔐 Security Features

### JWT Token Structure
```json
{
  "sub": "user@example.com",
  "userId": 1,
  "tenantId": 1,
  "role": "TENANT_ADMIN",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Protected Endpoints
All endpoints except `/api/auth/**` require valid JWT token.

---

## 📊 API Endpoints

### Authentication
```
POST /api/auth/register    # Register new tenant
POST /api/auth/login       # Login user
GET  /api/auth/health      # Health check
```

### Users
```
GET    /api/users/tenant/{tenantId}  # Get users
POST   /api/users?tenantId={}        # Create user
PUT    /api/users/{id}                # Update user
DELETE /api/users/{id}                # Delete user
```

### Subscriptions
```
GET  /api/subscriptions/tenant/{tenantId}     # Get subscription
GET  /api/subscriptions/plans                 # Get all plans
POST /api/subscriptions/{tenantId}/change-plan  # Change plan
```

### Activity Logs
```
GET /api/activities/tenant/{tenantId}            # Get all activities
GET /api/activities/tenant/{tenantId}/type/{type}  # Filter by type
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
./mvnw test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

---

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 📈 Monitoring

### Application Health
- Backend: `http://localhost:8080/actuator/health`
- Frontend: `http://localhost:3000`

### Database Access
```bash
mysql -u root -p saas_master
```

---

## 🔄 Database Migrations

Flyway automatically runs migrations on startup. Manual migration:

```bash
./mvnw flyway:migrate
```

---

## 🐛 Troubleshooting

### Backend Won't Start
1. Check MySQL is running: `mysql -u root -p`
2. Verify database exists: `SHOW DATABASES;`
3. Check application.yaml configuration
4. View logs: `tail -f logs/spring.log`

### Frontend Won't Start
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Check port 3000 is available: `lsof -i :3000`
3. Verify API connection: Check browser console

### Authentication Issues
1. Clear browser localStorage
2. Verify JWT_SECRET matches backend
3. Check token expiration (24 hours default)

---

## 📝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

**Your Name**
- GitHub: [@yourusername]
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- Spring Boot Team
- React Team
- Tailwind CSS
- All open-source contributors

---

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev)
- [JWT Introduction](https://jwt.io/introduction)
- [Multi-Tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/)

---

**Made with ❤️ by Ankur Chouhan**