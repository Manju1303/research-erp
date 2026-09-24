export enum CommunicationType {
  EMAIL = 'EMAIL',
  INTERNAL_NOTE = 'INTERNAL_NOTE',
  CLIENT_COMMENT = 'CLIENT_COMMENT',
  JOURNAL_COMMUNICATION = 'JOURNAL_COMMUNICATION',
  REVISION_COMMUNICATION = 'REVISION_COMMUNICATION',
  PAYMENT_COMMUNICATION = 'PAYMENT_COMMUNICATION',
}

export const COMMUNICATION_TYPE_LABELS: Record<CommunicationType, string> = {
  [CommunicationType.EMAIL]: 'Email Correspondence',
  [CommunicationType.INTERNAL_NOTE]: 'Internal Staff Note',
  [CommunicationType.CLIENT_COMMENT]: 'Client / Author Comment',
  [CommunicationType.JOURNAL_COMMUNICATION]: 'Editorial / Journal Message',
  [CommunicationType.REVISION_COMMUNICATION]: 'Revision Feedback',
  [CommunicationType.PAYMENT_COMMUNICATION]: 'Billing & Payment Notice',
};
