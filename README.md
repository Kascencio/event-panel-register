# Sistema de Gestión de Eventos

Sistema completo para registro de participantes, generación de códigos QR y control de acceso a eventos.

## 🚀 Instalación y Configuración

### 1. Instalar dependencias
\`\`\`bash
npm install
\`\`\`

### 2. Configurar base de datos
\`\`\`bash
# Copiar archivo de variables de entorno
cp .env.example .env

# Editar .env con tu DATABASE_URL de PostgreSQL
# DATABASE_URL="postgresql://username:password@localhost:5432/event_management?schema=public"
\`\`\`

### 3. Configurar Prisma
\`\`\`bash
# Generar cliente Prisma
npx prisma generate

# Aplicar esquema a la base de datos
npx prisma db push

# Poblar con datos de ejemplo (opcional)
npm run db:seed
\`\`\`

### 4. Ejecutar aplicación
\`\`\`bash
npm run dev
\`\`\`

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: API Routes, Prisma + PostgreSQL
- **QR**: Python con qrcode y Pillow
- **WhatsApp**: Python con requests
- **Despliegue**: Vercel
- **Escáner QR**: jsQR
- **Generación de QR**: qrcode

## 📋 Requisitos

- Node.js 18+
- Python 3.8+
- PostgreSQL (opcional, usa localStorage por defecto)
- WhatsApp Business API (opcional)

## 📱 Uso

1. **Página Principal**: http://localhost:3000
2. **Registro**: http://localhost:3000/register
3. **Escáner QR**: http://localhost:3000/scanner
4. **Admin**: http://localhost:3000/admin/login (admin/admin123)

## 🚀 Desarrollo Local

### Servidor accesible desde red local
\`\`\`bash
npm run dev:local
\`\`\`

### Probar scripts de Python
\`\`\`bash
npm run python:test
# o directamente
python3 scripts/test_whatsapp.py
\`\`\`

### Acceso desde dispositivos móviles
- Encuentra tu IP local: \`http://TU_IP_LOCAL:3000\`
- Ejemplo: \`http://192.168.1.100:3000\`

## 🌐 Despliegue en Vercel

### 1. Preparar despliegue
\`\`\`bash
chmod +x scripts/deploy-vercel.sh
./scripts/deploy-vercel.sh
\`\`\`

### 2. Configurar variables de entorno en Vercel
\`\`\`bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add WHATSAPP_TOKEN  # opcional
vercel env add WHATSAPP_PHONE_ID  # opcional
\`\`\`

### 3. Desplegar
\`\`\`bash
vercel --prod
\`\`\`

## 🔧 Configuración de WhatsApp

### WhatsApp Business API
1. Crear aplicación en [Facebook Developers](https://developers.facebook.com/)
2. Configurar WhatsApp Business API
3. Obtener token y phone number ID
4. Configurar en variables de entorno:
   \`\`\`
   WHATSAPP_TOKEN=tu_token_aqui
   WHATSAPP_PHONE_ID=tu_phone_id_aqui
   \`\`\`

### Alternativa: Twilio
\`\`\`bash
pip install twilio
\`\`\`
\`\`\`
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
\`\`\`

## 📊 Base de Datos

### Desarrollo (localStorage)
Por defecto usa localStorage del navegador.

### Producción (PostgreSQL)
\`\`\`bash
# Configurar DATABASE_URL
DATABASE_URL="postgresql://user:password@host:5432/database"

# Generar cliente Prisma
npx prisma generate

# Aplicar esquema
npx prisma db push

# Poblar datos iniciales
npx prisma db seed
\`\`\`

## 🧪 Testing

### Probar generación de QR
\`\`\`bash
python3 scripts/qr_generator.py '{"id":"test","fullName":"Test User","paymentStatus":"paid"}'
\`\`\`

### Probar envío de WhatsApp
\`\`\`bash
python3 scripts/whatsapp_sender.py '{"id":"test","fullName":"Test","phone":"+1234567890"}'
\`\`\`

### Prueba completa
\`\`\`bash
python3 scripts/test_whatsapp.py
\`\`\`

## 📁 Estructura del Proyecto

\`\`\`
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── admin/             # Panel administrativo
│   ├── register/          # Registro de participantes
│   ├── scanner/           # Escáner QR
│   └── qr-display/        # Visualización de QR
├── components/            # Componentes React
├── hooks/                 # Custom hooks
├── lib/                   # Utilidades y configuración
├── prisma/               # Esquema de base de datos
├── scripts/              # Scripts de Python
│   ├── qr_generator.py   # Generación de QR
│   ├── whatsapp_sender.py # Envío de WhatsApp
│   └── test_whatsapp.py  # Pruebas
└── public/               # Assets estáticos
\`\`\`

## 🔒 Seguridad

- Validación de entrada en cliente y servidor
- Sanitización de datos
- Autenticación básica para admin
- Variables de entorno para credenciales

## 📈 Características Avanzadas

- **Tiempo Real**: Actualizaciones automáticas
- **Offline**: Funciona sin conexión
- **PWA**: Instalable como app móvil
- **Responsive**: Adaptable a todos los dispositivos
- **Accesible**: Cumple estándares WCAG

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama: \`git checkout -b feature/nueva-caracteristica\`
3. Commit: \`git commit -m 'Agregar nueva característica'\`
4. Push: \`git push origin feature/nueva-caracteristica\`
5. Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## 📞 Soporte

- 📧 Email: soporte@evento.com
- 📱 WhatsApp: +1234567890
- 🐛 Issues: [GitHub Issues](https://github.com/tu-repo/issues)

## 🎯 Roadmap

- [ ] Múltiples eventos
- [ ] Integración con pasarelas de pago
- [ ] App móvil nativa
- [ ] Reportes avanzados
- [ ] API pública
- [ ] Integración con calendarios

## 📋 Características

- ✅ Registro de participantes
- ✅ Generación automática de QR
- ✅ Escáner QR en tiempo real
- ✅ Panel administrativo completo
- ✅ Gestión de pagos
- ✅ Estadísticas avanzadas
- ✅ Edición de datos
- ✅ Regeneración de QR
