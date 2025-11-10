

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  perfil_image_url?: string;
  last_login_at?: string;
}

export interface Manga {
  id: number;
  title: string;
  descr?: string;
  cover_image_url: string;
  status: string;
  color: string;
  updated_at: string;
  created_at: string;
  mal_url?: string;
}

export interface Chapter {
  id: number;
  manga_id: number;
  chapter_index: number;
  chapter_name: string;
  created_at: string;
}

export interface ChapterImage {
  chapter_id: number;
  image_index: number;
  image_url: string;
  width: number;
  height: number;
  created_at: string;
}


export interface PaginationResponse<T> {
  total: number;
  limit: number;
  offset: number;
  page?: number;
  pages?: number;
  results: T[];
}

export interface MangaPagData {
  manga: Manga
  chapters: {id: number, chapter_name: string}[]
  reading_status?: string
}


export interface AuthContextType {
  user: User | null;
  setUser: (user: User) => void;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export interface Exists {

  exists: boolean

}


export interface UserSession  {

  user_id: string
  issued_at: string
  expires_at: string
  revoked: boolean
  revoked_at?: string
  device_name?: string
  device_ip: string
  user_agent?: string
  last_used_at: string

}



export interface MangaPageChapter {
  
  id: number
  chapter_name: string

}


export type ReadingStatusLiteral = 'Reading' | 'Completed' | 'On Hold' | 'Dropped' | 'Plan to Read' | 'Rereading'


export interface Genre {
  id: number
  genre: string
  created_at: string
}



export interface MangaAuthor {

  author_name: string
  author_id: number
  role: string

}


export interface MangaPageData {

  manga: Manga
  manga_num_views: number
  genres: Genre[]
  authors: MangaAuthor[]
  reading_status?: ReadingStatusLiteral
  chapters: MangaPageChapter[]

}


export interface MangaChapters {
  manga: Manga
  chapters: Chapter[]

}



export interface ChapterImageList {

  manga?: Manga
  chapter?: Chapter
  num_images: number
  images: ChapterImage[]

}




export interface MangaReadingStatus {

  id: number
  manga_id: number
  user_id: string
  reading_status: ReadingStatusLiteral
  created_at: string
  updated_at: string

}


export interface Collection {

  id: number
  title: string
  descr?: string
  created_at: string

}


export type BugType = 'UI' | 'Backend' | 'Performance' | 'Security' | 'Database' | 'Network' | 'Crash' | 'Logic' | 'Compatibility' | 'Other'


export interface BugReport {

  id: number
  title: string
  descr?: string
  bug_type: BugType
  created_at: string

}


export type PageType = 'home' | 'library' | 'login' | 'signup' | 'manga' | 'reader' | 'search' | 'bug' | 'request' | 'account' | 'most-popular' | 'latest-mangas';


export type MangaStatus = 'Ongoing' | 'Completed' | 'Hiatus' | 'Cancelled' | 'Discontinued' | 'One-shot' | 'Upcoming'