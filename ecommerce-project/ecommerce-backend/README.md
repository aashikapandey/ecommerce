# E-Commerce Backend System

A full-featured e-commerce backend built with **Spring Boot 2.7**, **Spring Security (JWT)**, **Spring Data JPA**, and **PostgreSQL**.

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- Docker & Docker Compose (or PostgreSQL 14+)

### Run with Docker
```bash
docker-compose up -d
mvn spring-boot:run
```

### Run without Docker
1. Create PostgreSQL database: `ecommerce_db`
2. Update `application.properties` with your DB credentials
3. Run: `mvn spring-boot:run`

## 📋 API Endpoints

| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| POST | /api/auth/register | Register user | Public |
| POST | /api/auth/login | Login | Public |
| GET | /api/products | List products | Public |
| GET | /api/products/{id} | Get product | Public |
| POST | /api/products | Create product | Admin |
| PUT | /api/products/{id} | Update product | Admin |
| DELETE | /api/products/{id} | Delete product | Admin |
| GET | /api/products/search | Search products | Public |
| GET | /api/cart | View cart | User |
| POST | /api/cart/add | Add to cart | User |
| DELETE | /api/cart/remove/{id} | Remove from cart | User |
| POST | /api/orders | Create order | User |
| GET | /api/orders | My orders | User |
| PUT | /api/orders/{id}/status | Update status | Admin |

## 📖 Swagger UI
Access API documentation at: `http://localhost:8080/swagger-ui.html`

## 🏗️ Project Structure
```
src/main/java/com/ecommerce/
├── config/         # Spring configuration
├── controller/     # REST controllers
├── service/        # Business logic
├── repository/     # Spring Data JPA repositories
├── model/          # JPA entities
├── dto/            # Data transfer objects
├── security/       # JWT + Spring Security
└── exception/      # Custom exceptions & handlers
```

## 🔐 Default Admin Credentials
- Email: `admin@ecommerce.com`
- Password: `admin123`

## 🧪 Testing
```bash
mvn test
```

## 🐳 Docker Build
```bash
mvn package -DskipTests
docker build -t ecommerce-backend .
```
