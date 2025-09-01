# 📱 Subscription Management App

**[日本語版 README はこちら (Japanese README)](https://github.com/youzoom64/subscription-manager-web/blob/main/README_jp.md)**

> Smart household budget management through payment visualization

## 🌟 App Overview

This application is a tool for centrally managing payments for growing subscription services like Netflix, Spotify, Adobe Creative Cloud, and more. It helps streamline household budget management by tracking monthly fees, managing payment dates, and discovering unused services.

### Key Features

| Feature                            | Description                                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 💰 **Monthly Fee Visualization**   | Annual subscription services are also displayed as monthly equivalents, making actual monthly expenses clear at a glance |
| 📅 **Payment Date Management**     | Automatically calculates next payment dates to support household budget management                                       |
| 💳 **Card Information Management** | Register multiple credit cards and manage which services are charged to which cards                                      |
| 🔗 **Direct Access**               | Direct access to each service's management page                                                                          |

## 🚀 Getting Started

### 1. Login

1. Click the `Sign in with Google` button on the top page
2. Sign in with your Google account

> 💡 **Tip:** User information is automatically registered in the database on first login.

## 💳 Card Management

### Card Registration Steps

1. Click the `Card Management` button on the main screen
2. Click the `+ Add New Card` button
3. Enter the following information:

| Field               | Description                                                      | Example                     |
| ------------------- | ---------------------------------------------------------------- | --------------------------- |
| **Card Name**       | Easy-to-remember name                                            | "Main Card", "Rakuten Card" |
| **Card Brand**      | Choose from Visa, Mastercard, JCB, American Express, Diners Club | Visa                        |
| **Last 4 Digits**   | Last 4 digits of card number                                     | 1234                        |
| **Expiration Date** | Select month and year                                            | 12/2027                     |

> ⚠️ **Security Note:** Full card numbers are not stored. Only the last 4 digits are recorded for identification purposes.

### Card Deletion

1. Click the `Delete` button for the card you want to remove in the card management screen
2. Confirm deletion in the confirmation dialog

> ⚠️ **Warning:** Deleting a card will also clear the card settings for subscriptions using that card.

## 💰 Subscription Management

### Adding New Subscriptions

1. Click the `+ Add Subscription` button on the main screen
2. Enter the subscription information:

| Field             | Description                            | Example                  |
| ----------------- | -------------------------------------- | ------------------------ |
| **Service Name**  | Name of the subscription service       | "Netflix"                |
| **Monthly Fee**   | Amount charged per billing cycle       | 1980                     |
| **Payment Day**   | Day of the month payment is processed  | 15                       |
| **Payment Cycle** | Billing frequency                      | Monthly/Annual           |
| **Payment Card**  | Card used for payment                  | Main Card (\*\*\*\*1234) |
| **Service URL**   | Direct link to service management page | https://netflix.com      |

### Editing Subscriptions

1. Click the `Edit` button for the subscription you want to modify
2. Update the necessary information
3. Click the `Save` button

### Deleting Subscriptions

1. Click the `Delete` button for the subscription you want to remove
2. Confirm deletion in the confirmation dialog

### ON/OFF Toggle

- **ON (Green)**: Active subscription included in monthly total calculation
- **OFF (Red)**: Inactive subscription excluded from monthly total calculation

> 💡 **Tip:** Use the OFF setting for temporarily unused services instead of deleting them.

## 📊 Dashboard Features

### Monthly Total Display

- Shows the total of all active (ON) subscriptions
- Annual subscriptions are converted to monthly equivalents for calculation
- Displayed prominently at the top of the subscription list

### Subscription List

The subscription list displays the following information for each service:

| Column                 | Description                                     |
| ---------------------- | ----------------------------------------------- |
| **Service**            | Service name and direct access link             |
| **Monthly Equivalent** | Monthly amount (annual subscriptions converted) |
| **Actual Amount**      | Amount actually charged per billing cycle       |
| **Payment Day**        | Day of the month payment is processed           |
| **Next Payment**       | Next scheduled payment date                     |
| **Payment Cycle**      | Billing frequency (Monthly/Annual)              |
| **Card**               | Last 4 digits of the payment card               |
| **Actions**            | Edit and Delete buttons                         |
| **Status**             | ON/OFF toggle                                   |

## 🛠️ Technical Information

### Technology Stack

| Category           | Technology                        |
| ------------------ | --------------------------------- |
| **Frontend**       | Next.js 15.5.2, React, TypeScript |
| **Styling**        | Tailwind CSS                      |
| **Authentication** | NextAuth.js (Google OAuth)        |
| **Database**       | PostgreSQL (via Neon)             |
| **ORM**            | Prisma                            |
| **Deployment**     | Vercel                            |

### Development Setup

1. Clone the repository:

```bash
git clone https://github.com/youzoom64/subscription-manager-web.git
cd subscription-manager-web
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:

```env
# Database
POSTGRES_PRISMA_URL="your_database_url"
POSTGRES_URL_NON_POOLING="your_non_pooling_database_url"

# NextAuth
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

4. Set up the database:

```bash
npm run db:push
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command               | Description                     |
| --------------------- | ------------------------------- |
| `npm run dev`         | Start development server        |
| `npm run build`       | Build for production            |
| `npm run start`       | Start production server         |
| `npm run lint`        | Run ESLint                      |
| `npm run db:studio`   | Open Prisma Studio              |
| `npm run db:push`     | Push schema changes to database |
| `npm run db:generate` | Generate Prisma client          |

## 🔒 Security & Privacy

### Data Protection

- **Card Security**: Only the last 4 digits of card numbers are stored for identification
- **User Authentication**: Secure authentication via Google OAuth
- **Data Isolation**: Each user's data is completely isolated and accessible only to them

### Privacy

- User data is stored securely and used only for app functionality
- No sharing of personal information with third parties
- Users can delete their account and all associated data at any time

## 📱 Future Plans

### Planned Features

- [ ] **Mobile App**: Native iOS/Android applications
- [ ] **Push Notifications**: Payment reminders and alerts
- [ ] **Analytics Dashboard**: Spending trends and insights
- [ ] **Family Sharing**: Shared subscription management for families
- [ ] **Budget Alerts**: Notifications when spending exceeds set limits
- [ ] **Service Recommendations**: Suggestions for similar services with better pricing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **Live Demo**: [https://subscription-manager-web.vercel.app](https://subscription-manager-web.vercel.app)
- **Repository**: [https://github.com/youzoom64/subscription-manager-web](https://github.com/youzoom64/subscription-manager-web)
- **Japanese Documentation**: [README_jp.md](https://github.com/youzoom64/subscription-manager-web/blob/main/README_jp.md)
