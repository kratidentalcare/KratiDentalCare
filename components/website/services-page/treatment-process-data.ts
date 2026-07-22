import {
  CalendarCheck,
  ClipboardList,
  HeartPulse,
  ScanSearch,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

export interface TreatmentStep {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const TREATMENT_PROCESS_SECTION = {
  badge: "How It Works",
  heading: "Your Treatment",
  headingAccent: "Journey",
  description:
    "A clear, calm path from first visit to lasting results — guided by our clinical team at every step.",
} as const;

export const TREATMENT_STEPS: readonly TreatmentStep[] = [
  {
    id: "consultation",
    title: "Consultation",
    description: "We listen to your concerns and understand your smile goals.",
    icon: ClipboardList,
  },
  {
    id: "diagnosis",
    title: "Diagnosis",
    description: "Precise exams and imaging reveal the right path forward.",
    icon: ScanSearch,
  },
  {
    id: "treatment",
    title: "Treatment",
    description: "Gentle, modern care delivered with clinical precision.",
    icon: Stethoscope,
  },
  {
    id: "recovery",
    title: "Recovery",
    description: "Clear aftercare so healing stays comfortable and steady.",
    icon: HeartPulse,
  },
  {
    id: "follow-up",
    title: "Follow-up",
    description: "We check progress and protect your long-term results.",
    icon: CalendarCheck,
  },
] as const;
