/** Admin list-row DTO for Dashboard → FAQs. */
export type FaqListItem = {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Public accordion item — question/answer only. */
export type PublicFaqItem = {
  id: string;
  question: string;
  answer: string;
};
