set PATH=%PATH%;C:\Program Files\nodejs\
npx.cmd -y create-vite@latest temp-app --template react-ts
xcopy /E /Y temp-app\* .
rd /S /Q temp-app
npm.cmd install
npm.cmd install lucide-react three @types/three @react-three/fiber @react-three/drei tailwindcss @tailwindcss/vite
