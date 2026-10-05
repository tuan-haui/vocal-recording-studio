const fs = require('fs');
const path = require('path');

const envDir = './src/environments';
const prodPath = path.join(envDir, 'environment.prod.ts');
const devPath = path.join(envDir, 'environment.ts');

// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

// Kiểm tra nếu đang chạy trên Vercel (có YOUTUBE_API_KEY)
if (process.env.YOUTUBE_API_KEY) {
  // Nội dung file environment lấy từ process.env của Vercel
  const isProduction = process.env.isProduction === 'true' || true; // Mặc định khi build là true

  const envConfigFile = `export const environment = {
  production: ${isProduction},
  youtubeApiKey: '${process.env.YOUTUBE_API_KEY}',
  API_BASE_URL: '${process.env.API_BASE_URL || 'https://default-backend-url.com/'}'
};
`;

  // Ghi file cho cả production và default fallback
  fs.writeFileSync(prodPath, envConfigFile);
  fs.writeFileSync(devPath, envConfigFile);

  console.log('Environment files generated successfully with Vercel environment variables.');
} else {
  // Nếu chạy local (không có YOUTUBE_API_KEY trong terminal), bỏ qua để giữ nguyên file environment.ts hiện tại của bạn
  console.log('No YOUTUBE_API_KEY found in process.env. Using existing local environment files.');
}
