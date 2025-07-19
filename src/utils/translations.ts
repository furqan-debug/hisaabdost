
import { Language } from '@/hooks/use-language';

export const translations = {
  en: {
    title: "App Guide",
    subtitle: "Understanding your financial management tools",
    welcomeTitle: "Welcome to Your Financial Journey",
    welcomeDescription: "This app isn't just about tracking expenses—it's about transforming your relationship with money. Each feature is designed to give you deeper insights, better control, and ultimately, financial peace of mind. Let's explore how each tool can help you achieve your financial goals.",
    features: {
      dashboard: {
        title: "Dashboard & Wallet",
        purpose: "Your financial command center",
        description: "The dashboard gives you an instant overview of your financial health. Your wallet balance combines income and added funds, showing exactly what you have available to spend.",
        howTo: [
          "View your current wallet balance at a glance",
          "Add extra funds when you receive unexpected income",
          "Edit your monthly income to keep calculations accurate",
          "Monitor your savings rate to track financial progress"
        ],
        whyItMatters: "Having a clear view of your available funds prevents overspending and helps you make informed financial decisions. The savings rate shows if you're building wealth or just breaking even."
      },
      expenses: {
        title: "Expense Tracking",
        purpose: "Capture every penny spent",
        description: "Track all your expenses with detailed categorization and receipt scanning. This is the foundation of financial awareness.",
        howTo: [
          "Add expenses manually or scan receipts automatically",
          "Categorize expenses to understand spending patterns",
          "Add notes and payment methods for detailed records",
          "Set up recurring expenses for regular bills"
        ],
        whyItMatters: "You can't manage what you don't measure. Tracking expenses reveals spending patterns, identifies waste, and helps you make better financial choices."
      },
    },
    footerTitle: "Ready to Take Control?",
    footerDescription: "Financial success isn't about perfection—it's about progress. Start with one feature, build the habit, then gradually incorporate others. Your future self will thank you.",
    startButton: "Start Your Financial Journey"
  },
  es: {
    title: "Guía de la Aplicación",
    subtitle: "Entendiendo tus herramientas de gestión financiera",
    welcomeTitle: "Bienvenido a tu Viaje Financiero",
    welcomeDescription: "Esta aplicación no se trata solo de rastrear gastos, se trata de transformar tu relación con el dinero. Cada característica está diseñada para darte ideas más profundas, mejor control y, en última instancia, paz mental financiera.",
    features: {
      dashboard: {
        title: "Panel de Control y Billetera",
        purpose: "Tu centro de comando financiero",
        description: "El panel te da una visión instantánea de tu salud financiera. Tu saldo de billetera combina ingresos y fondos agregados, mostrando exactamente lo que tienes disponible para gastar.",
        howTo: [
          "Ve tu saldo actual de billetera de un vistazo",
          "Agrega fondos extra cuando recibas ingresos inesperados",
          "Edita tus ingresos mensuales para mantener cálculos precisos",
          "Monitorea tu tasa de ahorro para rastrear el progreso financiero"
        ],
        whyItMatters: "Tener una vista clara de tus fondos disponibles previene el sobregasto y te ayuda a tomar decisiones financieras informadas."
      },
      expenses: {
        title: "Seguimiento de Gastos",
        purpose: "Captura cada centavo gastado",
        description: "Rastrea todos tus gastos con categorización detallada y escaneo de recibos. Esta es la base de la conciencia financiera.",
        howTo: [
          "Agrega gastos manualmente o escanea recibos automáticamente",
          "Categoriza gastos para entender patrones de gasto",
          "Agrega notas y métodos de pago para registros detallados",
          "Configura gastos recurrentes para facturas regulares"
        ],
        whyItMatters: "No puedes manejar lo que no mides. El seguimiento de gastos revela patrones de gasto, identifica desperdicios y te ayuda a tomar mejores decisiones financieras."
      },
    },
    footerTitle: "¿Listo para Tomar Control?",
    footerDescription: "El éxito financiero no se trata de perfección, se trata de progreso. Comienza con una característica, construye el hábito, luego incorpora gradualmente otras.",
    startButton: "Inicia tu Viaje Financiero"
  },
};

export const getTranslation = (language: Language, key: string): any => {
  const keys = key.split('.');
  let value: any = translations[language] || translations.en;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to English if translation is missing
      value = translations.en;
      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) break;
      }
      break;
    }
  }
  
  return value || key;
};
