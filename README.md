# AWS Social Media App — Upgraded v2.0

A full-stack social media app built with **React + Node.js/Express + MySQL RDS**, deployed on **AWS EC2**, with **3 new AWS services** added:

| Service | What it does |
|---|---|
| 🔐 **AWS Cognito** | Real user sign-up / login with JWT tokens (replaces broken stub) |
| 🪣 **AWS S3** | Images uploaded directly from browser via pre-signed URLs (replaces base64 hack) |
| ⚡ **AWS Lambda** | Auto-generates 400×400 thumbnails every time an image lands in S3 |
| 🗄 **RDS MySQL** | Posts, comments, user profiles (existing, now with new tables) |
| 🖥 **EC2** | Hosts the Node.js backend + serves React build |

---

## Architecture Overview

```
Browser
  │
  ├─ PUT image ──────────────────────────────► S3 (main bucket)
  │                                                │
  │                                       S3 Event trigger
  │                                                ▼
  │                                         Lambda Function
  │                                     (sharp resize 400×400)
  │                                                │
  │                                       S3 (thumbnails bucket)
  │
  ├─ REST API calls ─────────────────────► EC2 (Node/Express :5000)
  │     Authorization: Bearer <JWT>             │
  │                                        JWT verified via
  │                                        Cognito JWKS endpoint
  │                                             │
  ├─ Auth calls ─────────────────────────► Cognito User Pool
  │
  └─ All data ───────────────────────────► RDS MySQL
```

---

## ─── PART 1 — AWS Console Setup ───────────────────────────

### Step 1 — Create a Cognito User Pool

1. Open **AWS Console → Cognito → User Pools → Create user pool**
2. **Authentication providers:** Email ✓
3. **Password policy:** Keep defaults (or relax for dev)
4. **MFA:** Optional (choose "No MFA" for simplicity)
5. **Email delivery:** Cognito (free tier, no SES setup needed)
6. **User pool name:** `socialmedia-pool`
7. **Initial app client:**
   - App type: **Public client**
   - App name: `socialmedia-web`
   - Auth flows: ✅ **ALLOW_USER_PASSWORD_AUTH** and **ALLOW_REFRESH_TOKEN_AUTH**
   - **No client secret** (public client)
8. Click **Create**
9. Note down:
   - **User Pool ID** → `us-east-1_XXXXXXXXX`
   - **App Client ID** → a 26-char string

```
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_APP_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### Step 2 — Create Two S3 Buckets

#### 2a — Main image bucket

1. **S3 → Create bucket**
2. Name: `your-socialmedia-images` (must be globally unique)
3. Region: `us-east-1` (match your EC2)
4. **Block Public Access:** Uncheck "Block all public access" → confirm
5. Create bucket
6. **Permissions tab → Bucket Policy** — paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::your-socialmedia-images/*"
  }]
}
```

7. **Permissions tab → CORS** — paste:

```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET","PUT","POST"],
  "AllowedOrigins": ["*"],
  "ExposeHeaders": []
}]
```

#### 2b — Thumbnail bucket

1. **S3 → Create bucket**
2. Name: `your-socialmedia-thumbnails`
3. Same region, same public-read settings and CORS as above
4. Note both bucket names.

---

### Step 3 — Create IAM User for the Server

1. **IAM → Users → Create user**
2. Name: `socialmedia-server`
3. **Permissions → Attach policies directly:**
   - `AmazonS3FullAccess`
   - `AmazonCognitoReadOnly` *(server only reads Cognito JWKS; Cognito SDK calls are made from the app using the client ID with no IAM key)*
4. **Create user → Security credentials tab → Create access key**
5. Use case: **Application running on AWS compute**
6. Copy and save:
   - Access Key ID
   - Secret Access Key

```
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

---

### Step 4 — Create RDS MySQL Database

1. **RDS → Create database**
2. Engine: **MySQL**, version 8.0
3. Template: **Free tier**
4. DB instance identifier: `socialmedia-db`
5. Master username: `admin`
6. Master password: choose a strong password
7. Instance: `db.t3.micro`
8. Storage: 20 GB gp2
9. **Connectivity:**
   - VPC: Default
   - Public access: **Yes** (for easy setup; restrict later)
   - VPC security group: Create new → name `rds-sg`
10. Click **Create database** — wait ~5 min
11. Once available, click the DB → copy the **Endpoint**

```
DB_HOST=socialmedia-db.cxxxxxxxxx.us-east-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=YourPassword123
DB_NAME=socialmedia
```

12. **Edit the RDS security group → Inbound rules → Add rule:**
    - Type: MySQL/Aurora, Port: 3306, Source: EC2 Security Group (or your IP for testing)

---

### Step 5 — Launch EC2 Instance

1. **EC2 → Launch Instance**
2. Name: `socialmedia-server`
3. AMI: **Amazon Linux 2023**
4. Instance type: **t2.micro** (free tier)
5. Key pair: Create new → download `socialmedia-key.pem`
6. Security Group — Inbound rules:
   - SSH (22) — My IP
   - Custom TCP (5000) — Anywhere 0.0.0.0/0
   - HTTP (80) — Anywhere 0.0.0.0/0
7. Launch
8. **Elastic IP:** EC2 → Elastic IPs → Allocate → Associate with instance

---

### Step 6 — Deploy Lambda Thumbnail Generator

#### 6a — Prepare the deployment package

On your local machine:

```bash
cd lambda/thumbnail-generator
npm install
zip -r thumbnail-lambda.zip .
```

#### 6b — Create the Lambda function

1. **Lambda → Create function**
2. Name: `socialmedia-thumbnail-generator`
3. Runtime: **Node.js 20.x**
4. Architecture: x86_64
5. Click **Create function**
6. **Code tab → Upload from → .zip file** → upload `thumbnail-lambda.zip`
7. **Configuration tab → General configuration:**
   - Handler: `index.handler`
   - Memory: **512 MB**
   - Timeout: **30 seconds**
8. **Configuration → Environment variables → Add:**
   - `THUMB_BUCKET` = `your-socialmedia-thumbnails`
   - `THUMB_MAX_DIM` = `400`
9. **Configuration → Permissions:**
   - Click the execution role link
   - Attach policy: `AmazonS3FullAccess`

#### 6c — Add S3 trigger

1. **Function overview → Add trigger → S3**
2. Bucket: `your-socialmedia-images`
3. Event type: **All object create events**
4. Prefix: `posts/`
5. Click **Add**

> ✅ Now whenever a post image is uploaded to `s3://your-socialmedia-images/posts/`, Lambda automatically creates a thumbnail in `s3://your-socialmedia-thumbnails/`.

---

## ─── PART 2 — Server Deployment ───────────────────────────

### Step 7 — Connect to EC2 and Install Node.js

```bash
# From your local machine:
chmod 400 socialmedia-key.pem
ssh -i socialmedia-key.pem ec2-user@YOUR_ELASTIC_IP

# On EC2:
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs git
node -v   # should show v20.x
```

### Step 8 — Upload Project to EC2

```bash
# From your local machine (in the project root):
scp -i socialmedia-key.pem -r ./socialmedia-upgraded ec2-user@YOUR_ELASTIC_IP:~/app
```

### Step 9 — Configure Server Environment

```bash
# On EC2:
cd ~/app/server
cp .env.example .env
nano .env
```

Fill in every value in `.env`:

```env
PORT_NUM=5000
AWS_REGION=us-east-1
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=YourPassword123
DB_NAME=socialmedia
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_APP_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
COGNITO_REGION=us-east-1
S3_BUCKET_NAME=your-socialmedia-images
S3_THUMBNAIL_BUCKET=your-socialmedia-thumbnails
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### Step 10 — Install Dependencies & Start Server

```bash
cd ~/app/server
npm install

# Test it runs:
npm start
# You should see: ✅  MySQL tables ready  🚀 Server running on port 5000

# Run permanently with PM2:
sudo npm install -g pm2
pm2 start "npm start" --name socialmedia-api
pm2 startup
pm2 save
```

### Step 11 — Build and Serve the React Client

```bash
cd ~/app/client

# Set the API URL to your EC2 IP:
echo "REACT_APP_API_URL=http://YOUR_ELASTIC_IP:5000" > .env

npm install
npm run build   # creates build/ folder

# Serve the build with a static server:
sudo npm install -g serve
pm2 start "serve -s build -l 3000" --name socialmedia-client
pm2 save
```

### Step 12 — (Optional) Nginx Reverse Proxy

```bash
sudo dnf install -y nginx

sudo tee /etc/nginx/conf.d/socialmedia.conf << 'NGINX'
server {
    listen 80;
    server_name YOUR_ELASTIC_IP;

    # Serve React build
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX

sudo systemctl enable nginx && sudo systemctl start nginx
```

Now your app is live at **http://YOUR_ELASTIC_IP** 🎉

---

## ─── PART 3 — Local Development ───────────────────────────

```bash
# 1. Server
cd server
cp .env.example .env     # fill in your values
npm install
npm run dev              # nodemon auto-restart

# 2. Client (new terminal)
cd client
echo "REACT_APP_API_URL=http://localhost:5000" > .env
npm install
npm start                # opens http://localhost:3000
```

---

## ─── PART 4 — Verify Everything Works ─────────────────────

| Test | Expected result |
|---|---|
| Open app → click Sign In | Redirected to Auth page |
| Register with email + password | Email confirmation code arrives |
| Enter confirmation code | "Email confirmed!" |
| Log in | Redirected to feed, username in Navbar |
| Create post with image | Image uploaded to S3, thumbnail appears |
| Check S3 console | Image in `posts/` folder of main bucket |
| Check thumbnail bucket | `thumb-posts/...` file created by Lambda |
| Check Lambda CloudWatch logs | "Thumbnail saved" log entry |
| Click Search icon | Search dialog opens |
| Type a word → search | Matching posts appear |
| Click 💬 Comments | Comment section expands |
| Click profile avatar | Profile page with post grid |

---

## ─── PART 5 — Cost Safety ──────────────────────────────────

```
⚠️  ALWAYS DO THIS after your demo / before sleeping:
  • EC2 Console → Stop instance (not terminate)
  • RDS Console → Stop temporarily (saves 750 hrs/month)
  • Lambda:  Free tier = 1M invocations/month — safe to leave
  • S3:      Free tier = 5 GB + 20K GETs — safe to leave
  • Cognito: Free tier = 50,000 MAUs — safe to leave

Set a billing alert:
  AWS Console → Billing → Budgets → Create budget
  → Zero spend budget (alerts you at $0.01)
```

---

## Project Structure

```
socialmedia-upgraded/
├── client/                       React frontend
│   └── src/
│       ├── API/index.js          All HTTP calls (axios)
│       ├── actions/              Redux action creators
│       │   ├── posts.js          ← S3 presigned upload flow
│       │   ├── auth.js           ← Cognito login/register
│       │   └── profile.js
│       ├── reducers/             Redux state
│       ├── components/
│       │   ├── Auth/Auth.js      ← FIXED: full Cognito flow
│       │   ├── Form/Form.js      ← FIXED: S3 file upload
│       │   ├── Posts/Post/Post.js← +Comments, S3 badge
│       │   ├── Comments/         NEW: comment section
│       │   ├── Search/           NEW: search dialog
│       │   └── Profile/          NEW: user profile page
│       └── App.js                Protected routes
│
├── server/
│   ├── config/
│   │   ├── mysql.js              RDS connection + table init
│   │   ├── cognito.js            NEW: Cognito SDK calls
│   │   └── s3.js                 NEW: S3 presigned URLs
│   ├── middleware/
│   │   └── auth.js               NEW: JWT JWKS verification
│   ├── models/
│   │   ├── postMessage.js        +imageUrl, thumbUrl, search
│   │   ├── comment.js            NEW
│   │   └── profile.js            NEW
│   ├── controllers/
│   │   ├── posts.js              +search, upload-url, comments
│   │   └── auth.js               NEW: register/login/profile
│   ├── routes/
│   │   ├── posts.js              Updated with auth middleware
│   │   └── auth.js               NEW
│   ├── index.js                  Updated
│   └── .env.example              Template for all secrets
│
└── lambda/
    └── thumbnail-generator/
        ├── index.mjs             NEW: sharp resize → S3
        └── package.json
```
