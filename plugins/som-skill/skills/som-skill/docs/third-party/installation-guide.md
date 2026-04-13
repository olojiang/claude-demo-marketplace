# 安装指南

空间智能系统的详细安装步骤。

## 系统要求

### 硬件要求

- CPU: 双核 2.0GHz 以上
- 内存: 4GB RAM 以上
- 存储: 10GB 可用空间

### 软件要求

- 操作系统: Linux/macOS/Windows
- Python: 3.8 或更高版本
- 数据库: MongoDB 4.4+

## 安装步骤

### 1. 准备环境

#### Linux/macOS

```bash
# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

#### Windows

```powershell
# 创建虚拟环境
python -m venv venv
venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

### 2. 配置数据库

安装并启动 MongoDB：

```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# 启动服务
mongod --dbpath /path/to/data
```

### 3. 配置环境变量

创建 `.env` 文件：

```env
DEVICE_MAC=your_device_mac
ENCLOSURE_ID=your_enclosure_id
```

### 4. 初始化系统

```bash
# 运行初始化脚本
python scripts/init_system.py

# 创建管理员账户
python scripts/create_admin.py
```

### 5. 启动服务

```bash
# 开发模式
python main.py

# 生产模式
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 常见安装问题

### 问题 1: Python 版本不兼容

**解决**: 确保使用 Python 3.8 或更高版本

```bash
python --version
```

### 问题 2: 依赖安装失败

**解决**: 升级 pip 后重试

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 问题 3: MongoDB 连接失败

**解决**: 检查 MongoDB 服务状态

```bash
# 检查服务
systemctl status mongod  # Linux
brew services list | grep mongodb  # macOS

# 启动服务
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

## 生产环境部署

### 使用 Docker

```bash
# 构建镜像
docker build -t space-smart .

# 运行容器
docker run -d \
  --name space-smart \
  -p 8000:8000 \
  space-smart
```

### 使用 Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

## 安全配置

### 1. 配置防火墙

```bash
# Ubuntu/Debian
sudo ufw allow 8000
sudo ufw enable
```

### 2. 设置 SSL/TLS

使用 Nginx 反向代理并配置 SSL：

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://server:8000;
    }
}
```

### 3. 环境变量安全

- 不要在代码中硬编码敏感信息
- 使用专门的密钥管理服务
- 定期轮换访问令牌

## 卸载

如需卸载系统：

```bash
# 停止服务
sudo systemctl stop space-smart

# 删除应用文件
rm -rf /opt/space-smart

# 删除数据库（谨慎操作）
mongo space_smart --eval "db.dropDatabase()"
```
