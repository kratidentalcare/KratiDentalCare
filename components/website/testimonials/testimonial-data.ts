/**
 * Homepage smile transformation testimonials.
 * Kept serializable-friendly for a future MongoDB/CMS migration.
 *
 * Image convention (public/images/testimonials):
 *   testimonial-{n}-a.png → Before
 *   testimonial-{n}-b.png → After
 */

export interface Testimonial {
  id: string;
  patientName: string;
  treatment: string;
  rating: number;
  review: string;
  beforeImage: string;
  afterImage: string;
}

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    id: "priya-sharma",
    patientName: "Priya Sharma",
    treatment: "Smile Makeover",
    rating: 5,
    review:
      "The transformation exceeded my expectations. I finally smile with confidence.",
    beforeImage: "/images/testimonials/testimonial-1-a.png",
    afterImage: "/images/testimonials/testimonial-1-b.png",
  },
  {
    id: "rahul-mehta",
    patientName: "Rahul Mehta",
    treatment: "Teeth Whitening",
    rating: 5,
    review:
      "Subtle, natural results that still feel like a complete upgrade. Friends keep asking what changed.",
    beforeImage: "/images/testimonials/testimonial-2-a.png",
    afterImage: "/images/testimonials/testimonial-2-b.png",
  },
  {
    id: "ananya-verma",
    patientName: "Ananya Verma",
    treatment: "Veneers",
    rating: 5,
    review:
      "From hesitant to proud in a few visits. The care felt personal and the finish looks effortless.",
    beforeImage: "/images/testimonials/testimonial-3-a.png",
    afterImage: "/images/testimonials/testimonial-3-b.png",
  },
  {
    id: "vikram-singh",
    patientName: "Vikram Singh",
    treatment: "Dental Implants",
    rating: 5,
    review:
      "I can eat and laugh without worrying again. The process was clear, calm, and genuinely life-changing.",
    beforeImage: "/images/testimonials/testimonial-4-a.png",
    afterImage: "/images/testimonials/testimonial-4-b.png",
  },
  {
    id: "neha-kapoor",
    patientName: "Neha Kapoor",
    treatment: "Orthodontic Alignment",
    rating: 5,
    review:
      "My smile finally matches how I feel. Professional, gentle treatment with results I am proud of.",
    beforeImage: "/images/testimonials/testimonial-5-a.png",
    afterImage: "/images/testimonials/testimonial-5-b.png",
  },
] as const;

/** Section copy — separate from records for CMS-friendly editing. */
export const TESTIMONIALS_SECTION = {
  badge: "Smile Transformations",
  heading: "See the difference",
  headingAccent: "a beautiful smile can make",
  description:
    "Real patients. Real results. Drag the slider to compare before and after — then read what they shared.",
} as const;
