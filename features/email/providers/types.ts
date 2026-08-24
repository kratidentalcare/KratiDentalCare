export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  tags?: string[];
};

export type SendEmailResult = {
  ok: boolean;
  messageId: string | null;
  error: string | null;
};

export type EmailProvider = {
  readonly name: string;
  send(input: SendEmailInput): Promise<SendEmailResult>;
};
