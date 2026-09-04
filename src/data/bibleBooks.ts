import { BibleBook } from '../types';

export const BIBLE_BOOKS: BibleBook[] = [
  // Old Testament (39 Books)
  // Law / Pentateuch
  { id: 'GEN', name: 'Genesis', shortName: 'Gen', testament: 'OT', chaptersCount: 50, category: 'Law' },
  { id: 'EXO', name: 'Exodus', shortName: 'Exo', testament: 'OT', chaptersCount: 40, category: 'Law' },
  { id: 'LEV', name: 'Leviticus', shortName: 'Lev', testament: 'OT', chaptersCount: 27, category: 'Law' },
  { id: 'NUM', name: 'Numbers', shortName: 'Num', testament: 'OT', chaptersCount: 36, category: 'Law' },
  { id: 'DEU', name: 'Deuteronomy', shortName: 'Deu', testament: 'OT', chaptersCount: 34, category: 'Law' },
  
  // History
  { id: 'JOS', name: 'Joshua', shortName: 'Josh', testament: 'OT', chaptersCount: 24, category: 'History' },
  { id: 'JDG', name: 'Judges', shortName: 'Judg', testament: 'OT', chaptersCount: 21, category: 'History' },
  { id: 'RUT', name: 'Ruth', shortName: 'Ruth', testament: 'OT', chaptersCount: 4, category: 'History' },
  { id: '1SA', name: '1 Samuel', shortName: '1Sam', testament: 'OT', chaptersCount: 31, category: 'History' },
  { id: '2SA', name: '2 Samuel', shortName: '2Sam', testament: 'OT', chaptersCount: 24, category: 'History' },
  { id: '1KI', name: '1 Kings', shortName: '1Kgs', testament: 'OT', chaptersCount: 22, category: 'History' },
  { id: '2KI', name: '2 Kings', shortName: '2Kgs', testament: 'OT', chaptersCount: 25, category: 'History' },
  { id: '1CH', name: '1 Chronicles', shortName: '1Chr', testament: 'OT', chaptersCount: 29, category: 'History' },
  { id: '2CH', name: '2 Chronicles', shortName: '2Chr', testament: 'OT', chaptersCount: 36, category: 'History' },
  { id: 'EZR', name: 'Ezra', shortName: 'Ezra', testament: 'OT', chaptersCount: 10, category: 'History' },
  { id: 'NEH', name: 'Nehemiah', shortName: 'Neh', testament: 'OT', chaptersCount: 13, category: 'History' },
  { id: 'EST', name: 'Esther', shortName: 'Esth', testament: 'OT', chaptersCount: 10, category: 'History' },

  // Poetry & Wisdom
  { id: 'JOB', name: 'Job', shortName: 'Job', testament: 'OT', chaptersCount: 42, category: 'Poetry & Wisdom' },
  { id: 'PSA', name: 'Psalms', shortName: 'Ps', testament: 'OT', chaptersCount: 150, category: 'Poetry & Wisdom' },
  { id: 'PRO', name: 'Proverbs', shortName: 'Prov', testament: 'OT', chaptersCount: 31, category: 'Poetry & Wisdom' },
  { id: 'ECC', name: 'Ecclesiastes', shortName: 'Eccl', testament: 'OT', chaptersCount: 12, category: 'Poetry & Wisdom' },
  { id: 'SNG', name: 'Song of Solomon', shortName: 'Song', testament: 'OT', chaptersCount: 8, category: 'Poetry & Wisdom' },

  // Major Prophets
  { id: 'ISA', name: 'Isaiah', shortName: 'Isa', testament: 'OT', chaptersCount: 66, category: 'Major Prophets' },
  { id: 'JER', name: 'Jeremiah', shortName: 'Jer', testament: 'OT', chaptersCount: 52, category: 'Major Prophets' },
  { id: 'LAM', name: 'Lamentations', shortName: 'Lam', testament: 'OT', chaptersCount: 5, category: 'Major Prophets' },
  { id: 'EZK', name: 'Ezekiel', shortName: 'Ezek', testament: 'OT', chaptersCount: 48, category: 'Major Prophets' },
  { id: 'DAN', name: 'Daniel', shortName: 'Dan', testament: 'OT', chaptersCount: 12, category: 'Major Prophets' },

  // Minor Prophets
  { id: 'HOS', name: 'Hosea', shortName: 'Hos', testament: 'OT', chaptersCount: 14, category: 'Minor Prophets' },
  { id: 'JOL', name: 'Joel', shortName: 'Joel', testament: 'OT', chaptersCount: 3, category: 'Minor Prophets' },
  { id: 'AMO', name: 'Amos', shortName: 'Amos', testament: 'OT', chaptersCount: 9, category: 'Minor Prophets' },
  { id: 'OBA', name: 'Obadiah', shortName: 'Obad', testament: 'OT', chaptersCount: 1, category: 'Minor Prophets' },
  { id: 'JON', name: 'Jonah', shortName: 'Jon', testament: 'OT', chaptersCount: 4, category: 'Minor Prophets' },
  { id: 'MIC', name: 'Micah', shortName: 'Mic', testament: 'OT', chaptersCount: 7, category: 'Minor Prophets' },
  { id: 'NAM', name: 'Nahum', shortName: 'Nah', testament: 'OT', chaptersCount: 3, category: 'Minor Prophets' },
  { id: 'HAB', name: 'Habakkuk', shortName: 'Hab', testament: 'OT', chaptersCount: 3, category: 'Minor Prophets' },
  { id: 'ZEP', name: 'Zephaniah', shortName: 'Zeph', testament: 'OT', chaptersCount: 3, category: 'Minor Prophets' },
  { id: 'HAG', name: 'Haggai', shortName: 'Hag', testament: 'OT', chaptersCount: 2, category: 'Minor Prophets' },
  { id: 'ZEC', name: 'Zechariah', shortName: 'Zech', testament: 'OT', chaptersCount: 14, category: 'Minor Prophets' },
  { id: 'MAL', name: 'Malachi', shortName: 'Mal', testament: 'OT', chaptersCount: 4, category: 'Minor Prophets' },

  // New Testament (27 Books)
  // Gospels
  { id: 'MAT', name: 'Matthew', shortName: 'Matt', testament: 'NT', chaptersCount: 28, category: 'Gospels' },
  { id: 'MRK', name: 'Mark', shortName: 'Mark', testament: 'NT', chaptersCount: 16, category: 'Gospels' },
  { id: 'LUK', name: 'Luke', shortName: 'Luke', testament: 'NT', chaptersCount: 24, category: 'Gospels' },
  { id: 'JHN', name: 'John', shortName: 'John', testament: 'NT', chaptersCount: 21, category: 'Gospels' },

  // Acts
  { id: 'ACT', name: 'Acts', shortName: 'Acts', testament: 'NT', chaptersCount: 28, category: 'Acts' },

  // Epistles
  { id: 'ROM', name: 'Romans', shortName: 'Rom', testament: 'NT', chaptersCount: 16, category: 'Epistles' },
  { id: '1CO', name: '1 Corinthians', shortName: '1Cor', testament: 'NT', chaptersCount: 16, category: 'Epistles' },
  { id: '2CO', name: '2 Corinthians', shortName: '2Cor', testament: 'NT', chaptersCount: 13, category: 'Epistles' },
  { id: 'GAL', name: 'Galatians', shortName: 'Gal', testament: 'NT', chaptersCount: 6, category: 'Epistles' },
  { id: 'EPH', name: 'Ephesians', shortName: 'Eph', testament: 'NT', chaptersCount: 6, category: 'Epistles' },
  { id: 'PHP', name: 'Philippians', shortName: 'Phil', testament: 'NT', chaptersCount: 4, category: 'Epistles' },
  { id: 'COL', name: 'Colossians', shortName: 'Col', testament: 'NT', chaptersCount: 4, category: 'Epistles' },
  { id: '1TH', name: '1 Thessalonians', shortName: '1Thess', testament: 'NT', chaptersCount: 5, category: 'Epistles' },
  { id: '2TH', name: '2 Thessalonians', shortName: '2Thess', testament: 'NT', chaptersCount: 3, category: 'Epistles' },
  { id: '1TI', name: '1 Timothy', shortName: '1Tim', testament: 'NT', chaptersCount: 6, category: 'Epistles' },
  { id: '2TI', name: '2 Timothy', shortName: '2Tim', testament: 'NT', chaptersCount: 4, category: 'Epistles' },
  { id: 'TIT', name: 'Titus', shortName: 'Titus', testament: 'NT', chaptersCount: 3, category: 'Epistles' },
  { id: 'PHM', name: 'Philemon', shortName: 'Phlm', testament: 'NT', chaptersCount: 1, category: 'Epistles' },
  { id: 'HEB', name: 'Hebrews', shortName: 'Heb', testament: 'NT', chaptersCount: 13, category: 'Epistles' },
  { id: 'JAS', name: 'James', shortName: 'Jas', testament: 'NT', chaptersCount: 5, category: 'Epistles' },
  { id: '1PE', name: '1 Peter', shortName: '1Pet', testament: 'NT', chaptersCount: 5, category: 'Epistles' },
  { id: '2PE', name: '2 Peter', shortName: '2Pet', testament: 'NT', chaptersCount: 3, category: 'Epistles' },
  { id: '1JN', name: '1 John', shortName: '1John', testament: 'NT', chaptersCount: 5, category: 'Epistles' },
  { id: '2JN', name: '2 John', shortName: '2John', testament: 'NT', chaptersCount: 1, category: 'Epistles' },
  { id: '3JN', name: '3 John', shortName: '3John', testament: 'NT', chaptersCount: 1, category: 'Epistles' },
  { id: 'JUD', name: 'Jude', shortName: 'Jude', testament: 'NT', chaptersCount: 1, category: 'Epistles' },

  // Revelation
  { id: 'REV', name: 'Revelation', shortName: 'Rev', testament: 'NT', chaptersCount: 22, category: 'Revelation' }
];

export const getBookByName = (name: string): BibleBook | undefined => {
  const clean = name.trim().toLowerCase();
  return BIBLE_BOOKS.find(b => 
    b.name.toLowerCase() === clean || 
    b.shortName.toLowerCase() === clean || 
    b.id.toLowerCase() === clean
  );
};
