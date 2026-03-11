# TradeTrack 📈

TradeTrack is a premium, high-performance business management and trade tracking application designed for modern commerce. Built with a focus on speed, reliability, and ease of use, it empowers business owners and administrators to track sales, manage inventory, and monitor financial health in real-time.

---

## 🚀 Key Features

### 📦 Inventory & Purchase Management
- **FIFO Costing Engine**: Accurate Cost of Goods Sold (COGS) calculation using First-In-First-Out logic.
- **Purchase Tracking**: Log and monitor stock acquisitions with detailed unit pricing.
- **Stock Monitoring**: Real-time visibility into inventory levels.

### 💰 Financial Operations
- **Sales Logging**: Streamlined interface for recording daily transactions.
- **Expense Tracking**: Categorize and monitor business expenditures.
- **Credit & Supply**: Manage debtor records and credit-based supply chains.
- **Lodgments**: Track bank deposits and cash handling.
- **Starting Capital**: Record and track initial business investments.

### 📊 Reporting & Analytics
- **Dynamic Dashboards**: Visual summaries of sales, profits, and expenses.
- **Audit Logs**: Comprehensive tracking of all system actions for transparency and security.
- **Periodic Selection**: Choose custom date ranges for financial reports.

### 🛡️ Role-Based Access Control (RBAC)
- **Admin**: Full system control and user management.
- **Owner**: Comprehensive business oversight and financial reporting.
- **Salesboy**: Focused interface for daily sales logging and basic operations.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/)
- **Backend / Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Validation**: [Zod](https://zod.dev/)
- **Date Handling**: [date-fns](https://date-fns.org/)

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (local or Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tracktrade-project/tradetrack
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Use `.env.example` as a template:
     ```bash
     cp .env.example .env
     ```
   - Fill in your `MONGODB_URI`, `NEXTAUTH_SECRET`, and other required variables.

### Development

Run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📂 Project Structure

- `/src/app`: Next.js pages and API routes.
- `/src/components`: Reusable UI components.
- `/src/models`: Mongoose schemas for data entities.
- `/src/lib`: Shared utilities, database connection, and authentication logic.
- `/src/scripts`: Maintenance and initialization scripts (e.g., seeding).

---

## 🌐 Deployment

TradeTrack is optimized for deployment on [Vercel](https://vercel.com). Ensure all environment variables are correctly configured in your Vercel project settings.

---

## 📄 License

Private - All rights reserved.
