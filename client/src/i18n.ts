import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      appTitle: "Project Estimation Chatbot",
      language: "Language",
      assistant: "Assistant",
      steps: [
        "Project Info",
        "FP Counts",
        "GSC",
        "UCP Actors & Use Cases",
        "TCF",
        "EF",
        "Economics",
        "Results",
        "Freeze",
        "Download"
      ],
      prompts: [
        "Tell me about your project.",
        "Provide Function Point counts by complexity.",
        "Rate 14 General System Characteristics (0..5).",
        "Provide actor and use case counts.",
        "Rate technical complexity factors (0..5).",
        "Rate environmental factors (0..5).",
        "Set economic assumptions.",
        "Review computed estimation results.",
        "Confirm to freeze final snapshot.",
        "Download Arabic PDF report."
      ],
      save: "Save",
      next: "Next",
      back: "Back",
      calculate: "Calculate",
      freeze: "Freeze Estimate",
      frozen: "Estimate frozen successfully.",
      download: "Download Arabic PDF",
      projectName: "Project name",
      description: "Description",
      domain: "Domain",
      targetUsers: "Target users",
      platforms: "Platforms (comma separated)",
      assumptions: "Assumptions",
      currency: "Currency",
      hourlyRate: "Hourly rate",
      personMonthCost: "Person-month cost",
      hoursPerFP: "Hours per FP",
      hoursPerUCP: "Hours per UCP",
      hoursPerPersonMonth: "Hours per person-month",
      teamSize: "Team size (optional)",
      simple: "Simple",
      avg: "Average",
      complex: "Complex",
      low: "Low",
      high: "High"
    }
  },
  ar: {
    translation: {
      appTitle: "روبوت تقدير المشروع",
      language: "اللغة",
      assistant: "المساعد",
      steps: [
        "معلومات المشروع",
        "عدّ FP",
        "عوامل GSC",
        "الممثلون وحالات الاستخدام",
        "عوامل TCF",
        "عوامل EF",
        "الافتراضات الاقتصادية",
        "النتائج",
        "تجميد التقدير",
        "تحميل التقرير"
      ],
      prompts: [
        "أخبرني عن مشروعك.",
        "أدخل قيم Function Point حسب التعقيد.",
        "قيّم 14 عاملًا من GSC من 0 إلى 5.",
        "أدخل أعداد الممثلين وحالات الاستخدام.",
        "قيّم عوامل التعقيد التقني من 0 إلى 5.",
        "قيّم العوامل البيئية من 0 إلى 5.",
        "حدّد الافتراضات الاقتصادية.",
        "راجع نتائج التقدير المحسوبة.",
        "أكد لتجميد النسخة النهائية.",
        "حمّل تقرير PDF بالعربية."
      ],
      save: "حفظ",
      next: "التالي",
      back: "السابق",
      calculate: "احسب",
      freeze: "تجميد التقدير",
      frozen: "تم تجميد التقدير بنجاح.",
      download: "تحميل تقرير PDF بالعربية",
      projectName: "اسم المشروع",
      description: "الوصف",
      domain: "المجال",
      targetUsers: "المستخدمون المستهدفون",
      platforms: "المنصات (مفصولة بفاصلة)",
      assumptions: "الافتراضات",
      currency: "العملة",
      hourlyRate: "سعر الساعة",
      personMonthCost: "تكلفة شهر-شخص",
      hoursPerFP: "الساعات لكل FP",
      hoursPerUCP: "الساعات لكل UCP",
      hoursPerPersonMonth: "ساعات شهر-شخص",
      teamSize: "حجم الفريق (اختياري)",
      simple: "بسيط",
      avg: "متوسط",
      complex: "معقد",
      low: "منخفض",
      high: "مرتفع"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
