# Raw Node.js & TypeScript CRUD API

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
[![GitHub Stars](https://img.shields.io/github/stars/md-abu-kayser/raw-node-typescript-crud-api?style=social)](https://github.com/md-abu-kayser/raw-node-typescript-crud-api)

A professional, production-ready CRUD (Create, Read, Update, Delete) API built entirely with raw Node.js and TypeScript. This project demonstrates advanced server-side development techniques without relying on frameworks like Express, showcasing deep understanding of HTTP protocols, routing, and asynchronous programming.

## 🚀 Features

- **Framework-Free**: Built with raw Node.js HTTP module for maximum control and minimal dependencies
- **TypeScript Integration**: Full type safety with custom interfaces and type definitions
- **Custom Router**: High-performance routing system supporting static and dynamic routes
- **Environment Configuration**: Secure environment-based configuration using dotenv
- **JSON Database**: Lightweight file-based database with atomic write operations
- **Comprehensive CRUD Operations**: Complete user management API with validation
- **Error Handling**: Robust error handling with proper HTTP status codes
- **Async/Await Support**: Modern asynchronous programming patterns
- **Input Validation**: Built-in validation for API inputs
- **Modular Architecture**: Clean, maintainable code structure

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.0+
- **HTTP Handling**: Node.js built-in `http` module
- **Configuration**: dotenv
- **Development**: ts-node-dev, nodemon-like hot reloading
- **Testing**: Manual testing with curl/Postman
- **Database**: JSON file (easily replaceable with real databases)

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/md-abu-kayser/raw-node-typescript-crud-api.git
   cd raw-node-typescript-crud-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup** (Optional)
   Create a `.env` file in the root directory:

   ```env
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000` (or your configured PORT).

## 🎯 Usage

### Development

```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm run start        # Run production server
npm run typecheck    # Run TypeScript type checking
```

### Testing the API

Use curl, Postman, or any HTTP client to test the endpoints.

#### Health Check

```bash
curl http://localhost:5000/health
```

#### Get All Users

```bash
curl http://localhost:5000/api/users
```

#### Create a New User

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "country": "United States",
    "study": "Computer Science"
  }'
```

#### Get a Specific User

```bash
curl http://localhost:5000/api/users/1
```

#### Update a User

```bash
curl -X PUT http://localhost:5000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "country": "Canada"
  }'
```

#### Delete a User

```bash
curl -X DELETE http://localhost:5000/api/users/1
```

## 📋 API Endpoints

| Method | Endpoint         | Description         | Request Body                |
| ------ | ---------------- | ------------------- | --------------------------- |
| GET    | `/`              | Welcome message     | -                           |
| GET    | `/health`        | Server health check | -                           |
| GET    | `/api/users`     | Get all users       | -                           |
| GET    | `/api/users/:id` | Get user by ID      | -                           |
| POST   | `/api/users`     | Create new user     | `{name, country, study}`    |
| PUT    | `/api/users/:id` | Update user by ID   | `{name?, country?, study?}` |
| DELETE | `/api/users/:id` | Delete user by ID   | -                           |

### Request/Response Examples

#### Successful Response

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "country": "United States",
    "study": "Computer Science",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Error Response

```json
{
  "success": false,
  "message": "User not found"
}
```

## 🏗 Project Structure

```
raw-node-typescript-crud-api/
├── src/
│   ├── server.ts           # Main server file
│   ├── config/
│   │   └── index.ts        # Environment configuration
│   ├── data/
│   │   └── users.json      # JSON database file
│   ├── helpers/
│   │   ├── router.ts       # Custom routing system
│   │   ├── sendJson.ts     # JSON response helper
│   │   ├── parseBody.ts    # Request body parser
│   │   ├── fileDb.ts       # File database operations
│   │   └── validators.ts   # Input validation utilities
│   ├── routes/
│   │   └── index.ts        # API route definitions
│   └── types/
│       ├── http.ts         # HTTP type definitions
│       └── user.ts         # User data types
├── package.json
├── tsconfig.json
├── .env                    # Environment variables (create if needed)
└── README.md
```

## 🔧 Key Components

### Custom Router

- **High Performance**: O(1) route lookups using Map data structures
- **Dynamic Routes**: Support for parameterized routes (e.g., `/users/:id`)
- **Method-Based Routing**: Separate route maps for each HTTP method

### File-Based Database

- **Atomic Operations**: Uses temporary files to prevent data corruption
- **Error Recovery**: Graceful handling of file read/write errors
- **Easy Migration**: Simple to replace with SQL/NoSQL databases

### TypeScript Integration

- **Type Safety**: Comprehensive interfaces for all data structures
- **IntelliSense**: Full IDE support with autocompletion
- **Compile-Time Checks**: Catch errors before runtime

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Use conventional commit messages

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Md Abu Kayser**

- GitHub: [@md-abu-kayser](https://github.com/md-abu-kayser)
- LinkedIn: [Your LinkedIn Profile]
- Email: [your.email@example.com]

## 🙏 Acknowledgments

- Node.js community for the amazing runtime
- TypeScript team for the powerful type system
- Open source contributors who make projects like this possible

---

⭐ **Star this repo if you found it helpful!**

For questions or support, please open an issue on GitHub.
