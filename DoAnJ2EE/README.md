# Game Portal - Trang Web Game Dành Cho Người Việt Nam

## Mô tả
Game Portal là một trang web game được phát triển bằng Spring Boot với giao diện đẹp và thân thiện với người dùng Việt Nam. Trang web cung cấp nhiều game khác nhau với hệ thống tính điểm và bảng xếp hạng.

## Tính năng chính

### 🎮 Danh sách Game
- Hiển thị các game với thông tin chi tiết
- Phân loại game theo thể loại
- Giao diện card đẹp mắt với hiệu ứng hover

### 🏆 Bảng Xếp Hạng
- Hiển thị top game theo điểm số cao nhất
- Thống kê số lượt chơi
- Giao diện xếp hạng với màu sắc phân biệt

### 🎯 Game Demo
- Game demo tương tác với JavaScript
- Hệ thống tính điểm real-time
- Lưu điểm số vào database
- Giao diện game đẹp mắt

### 📊 Thống kê
- Hiển thị số lượng game
- Thống kê lượt chơi
- Số người chơi
- Thời gian hoạt động

## Công nghệ sử dụng

### Backend
- **Spring Boot 3.5.3** - Framework chính
- **Spring Data JPA** - ORM và database
- **H2 Database** - Database in-memory
- **Thymeleaf** - Template engine
- **Maven** - Build tool

### Frontend
- **Bootstrap 5** - CSS framework
- **Font Awesome** - Icons
- **Google Fonts** - Typography
- **Vanilla JavaScript** - Client-side logic

## Cấu trúc dự án

```
DoAnJ2EE/
├── src/
│   ├── main/
│   │   ├── java/com/hutech/DoAnJ2EE/
│   │   │   ├── controller/
│   │   │   │   └── GameController.java
│   │   │   ├── model/
│   │   │   │   └── Game.java
│   │   │   ├── repository/
│   │   │   │   └── GameRepository.java
│   │   │   ├── service/
│   │   │   │   └── GameService.java
│   │   │   └── DoAnJ2EeApplication.java
│   │   └── resources/
│   │       ├── static/
│   │       │   └── js/
│   │       │       └── main.js
│   │       ├── templates/
│   │       │   ├── index.html
│   │       │   ├── game.html
│   │       │   ├── leaderboard.html
│   │       │   └── layout.html
│   │       └── application.properties
│   └── test/
├── pom.xml
└── README.md
```

## Cách chạy dự án

### Yêu cầu hệ thống
- Java 24 hoặc cao hơn
- Maven 3.6+
- IDE (IntelliJ IDEA, Eclipse, VS Code)

### Bước 1: Clone dự án
```bash
git clone <repository-url>
cd DoAnJ2EE
```

### Bước 2: Chạy ứng dụng
```bash
# Sử dụng Maven wrapper
./mvnw spring-boot:run

# Hoặc sử dụng Maven
mvn spring-boot:run
```

### Bước 3: Truy cập ứng dụng
Mở trình duyệt và truy cập: `http://localhost:8080`

## Các trang chính

### 🏠 Trang Chủ (`/`)
- Hiển thị danh sách tất cả game
- Thống kê tổng quan
- Giao diện hero section đẹp mắt

### 🎮 Trang Game (`/game/{id}`)
- Giao diện game demo
- Hệ thống tính điểm
- Hướng dẫn chơi
- Lưu điểm số

### 🏆 Bảng Xếp Hạng (`/leaderboard`)
- Top game theo điểm số
- Thống kê lượt chơi
- Giao diện xếp hạng

## Database

### Bảng Games
- `id` - ID duy nhất
- `name` - Tên game
- `description` - Mô tả game
- `category` - Thể loại game
- `imageUrl` - URL hình ảnh
- `gameUrl` - URL game
- `highScore` - Điểm cao nhất
- `playCount` - Số lượt chơi
- `isActive` - Trạng thái hoạt động

### Dữ liệu mẫu
Hệ thống tự động tạo 6 game mẫu khi khởi động:
1. Game Xếp Hình (Puzzle)
2. Game Đua Xe (Racing)
3. Game Bắn Súng (Action)
4. Game Đấu Bài (Card)
5. Game Phiêu Lưu (Adventure)
6. Game Thể Thao (Sports)

## API Endpoints

### GET `/`
- Trang chủ với danh sách game

### GET `/game/{id}`
- Trang game cụ thể

### POST `/game/save-score`
- Lưu điểm số game
- Parameters: `gameId`, `score`

### GET `/leaderboard`
- Trang bảng xếp hạng

### GET `/h2-console`
- Console quản lý database H2

## Tùy chỉnh

### Thêm game mới
1. Chỉnh sửa `GameService.initializeGames()`
2. Thêm game mới vào danh sách
3. Khởi động lại ứng dụng

### Thay đổi giao diện
1. Chỉnh sửa file CSS trong templates
2. Thay đổi màu sắc trong biến CSS
3. Cập nhật layout trong `layout.html`

### Cấu hình database
Chỉnh sửa `application.properties`:
```properties
# Thay đổi database
spring.datasource.url=jdbc:mysql://localhost:3306/gamedb
spring.datasource.username=root
spring.datasource.password=password
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
```

## Tính năng nâng cao

### Responsive Design
- Tương thích với mobile, tablet, desktop
- Giao diện thích ứng theo kích thước màn hình

### Animation & Effects
- Hiệu ứng hover cho game cards
- Animation loading
- Smooth scrolling
- Visual feedback khi tương tác

### Performance
- Lazy loading cho images
- Optimized CSS và JavaScript
- Database indexing

## Troubleshooting

### Lỗi thường gặp

1. **Port 8080 đã được sử dụng**
   ```bash
   # Thay đổi port trong application.properties
   server.port=8081
   ```

2. **Lỗi Java version**
   ```bash
   # Kiểm tra Java version
   java -version
   # Cài đặt Java 24 nếu cần
   ```

3. **Lỗi Maven**
   ```bash
   # Clean và rebuild
   mvn clean install
   ```

## Đóng góp

1. Fork dự án
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

Dự án này được phát triển bởi Hutech.

## Liên hệ

- Email: support@gameportal.com
- Website: https://gameportal.com
- GitHub: https://github.com/hutech/gameportal

---

**Chúc bạn có trải nghiệm game thú vị! 🎮** 