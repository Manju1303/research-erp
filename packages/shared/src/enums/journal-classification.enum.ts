export enum JournalIndexing {
  SCOPUS = 'SCOPUS',
  WEB_OF_SCIENCE = 'WEB_OF_SCIENCE',
  UGC_CARE = 'UGC_CARE',
  PEER_REVIEWED = 'PEER_REVIEWED',
  OPEN_ACCESS = 'OPEN_ACCESS',
  SUBSCRIPTION = 'SUBSCRIPTION',
  NATIONAL = 'NATIONAL',
  INTERNATIONAL = 'INTERNATIONAL',
  SCI_SCIE = 'SCI_SCIE',
  PUBMED = 'PUBMED',
}

export const JOURNAL_INDEXING_LABELS: Record<JournalIndexing, string> = {
  [JournalIndexing.SCOPUS]: 'Scopus',
  [JournalIndexing.WEB_OF_SCIENCE]: 'Web of Science (WoS)',
  [JournalIndexing.UGC_CARE]: 'UGC-CARE Listed',
  [JournalIndexing.PEER_REVIEWED]: 'Peer Reviewed',
  [JournalIndexing.OPEN_ACCESS]: 'Open Access',
  [JournalIndexing.SUBSCRIPTION]: 'Subscription / Hybrid',
  [JournalIndexing.NATIONAL]: 'National Journal',
  [JournalIndexing.INTERNATIONAL]: 'International Journal',
  [JournalIndexing.SCI_SCIE]: 'SCI / SCIE Indexed',
  [JournalIndexing.PUBMED]: 'PubMed / MEDLINE',
};
