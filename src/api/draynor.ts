import { api } from "./client";
import type {
  MangaPageData,
  User,
  Exists,
  PaginationResponse,
  UserSession,
  Manga,
  MangaChapters,
  ChapterImageList,
  MangaReadingStatus,
  Collection,
  BugReport,
  ReadingStatusLiteral,
} from "../types";

// ---------- AUTH ----------
class AuthAPI {
  async me() {
    return await api.get<User>("/auth/me");
  }

  async login(email: string, password: string) {
    return await api.post<User>("/auth/login", { email, password });
  }

  async signup(username: string, email: string, password: string) {
    return await api.post("/auth/signup", { username, email, password });
  }

  async refresh() {
    return await api.post<User>("/auth/refresh");
  }

  async logout() {
    return await api.post("/auth/logout");
  }

  async logoutAll() {
    return await api.post("/auth/logout/all");
  }

  async usernameExists(username: string) {
    return await api.get<Exists>("/auth/username/exists", { username });
  }

  async emailExists(email: string) {
    return await api.get<Exists>("/auth/email/exists", { email });
  }

  async sessions(limit = 64, offset = 0) {
    return await api.get<PaginationResponse<UserSession>>("/auth/sessions", {
      limit,
      offset,
    });
  }
}

// ---------- USER ----------
class UserAPI {
  async updateProfile(data: { username?: string; email?: string }) {
    return await api.put<User>("/user/", data);
  }

  async updateProfileImage(file: File) {
    return await api.upload("/user/image/perfil", file, "file");
  }

  async deleteProfileImage() {
    return await api.delete("/user/image/perfil");
  }
}

// ---------- MANGAS ----------
class MangaAPI {
  async getPopular(limit = 64, offset = 0) {
    return await api.get<PaginationResponse<Manga>>("/mangas/popular", {
      limit,
      offset,
    });
  }

  async getLatest(limit = 64, offset = 0) {
    return await api.get<PaginationResponse<Manga>>("/mangas/latest", {
      limit,
      offset,
    });
  }

  async getRandom(limit = 64) {
    return await api.get<PaginationResponse<Manga>>("/mangas/random", {
      limit,
    });
  }

  async getByTitle(q: string, limit = 64, offset = 0) {
    return await api.get<PaginationResponse<Manga>>("/mangas/search", {
      q,
      limit,
      offset,
    });
  }

  async getPageData(manga_id: number) {
    return await api.get<MangaPageData>("/mangas/page", { manga_id });
  }

  async getByGenre(genre_id: number, limit = 64, offset = 0) {
    return await api.get<PaginationResponse<Manga>>("/mangas/genre", {
      limit,
      offset,
      id: genre_id,
    });
  }
}

// ---------- CHAPTERS ----------
class ChapterAPI {
  async getChaptersByMangaId(
    manga_id: number,
    order: "ASC" | "DESC" = "ASC",
    limit?: number
  ) {
    return await api.get<MangaChapters>("/chapters/", {
      manga_id,
      order,
      limit,
    });
  }

  async getChapterImages(chapter_id: number) {
    return await api.get<ChapterImageList>("/chapters/images", {
      chapter_id,
    });
  }
}

// ---------- LIBRARY ----------
class LibraryAPI {
  async getByStatus(
    reading_status: ReadingStatusLiteral,
    limit = 64,
    offset = 0
  ) {
    return await api.get<PaginationResponse<Manga>>("/library/", {
      reading_status,
      limit,
      offset,
    });
  }

  async getMangaStatus(manga_id: number) {
    return await api.get<MangaReadingStatus>("/library/manga", { manga_id });
  }

  async createReadingStatus(manga_id: number, reading_status: string) {
    return await api.post("/library/", { manga_id, reading_status });
  }

  async deleteReadingStatus(manga_id: number) {
    return await api.delete("/library/", { manga_id });
  }
}

// ---------- COLLECTIONS ----------
class CollectionAPI {
  async getCollections(limit = 64, offset = 0) {
    return await api.get<PaginationResponse<Collection>>("/collections/", {
      limit,
      offset,
    });
  }

  async getCollectionMangas(collection_id: number, limit = 64, offset = 0) {
    return await api.get<PaginationResponse<Manga>>("/collections/mangas", {
      limit,
      offset,
      id: collection_id,
    });
  }
}

// ---------- BUG REPORTS ----------
class BugAPI {
  async reportBug(
    title: string,
    bug_type: string,
    descr?: string
  ): Promise<BugReport> {
    return await api.post<BugReport>("/reports/bugs/", {
      title,
      bug_type,
      descr,
    });
  }
}

// ---------- MANGA REQUESTS ----------
class MangaRequestAPI {
  async createRequest(title: string, message?: string) {
    return await api.post("/manga/requests/", { title, message });
  }
}

// ---------- ROOT WRAPPER ----------
class DraynorApi {
  readonly auth = new AuthAPI();
  readonly user = new UserAPI();
  readonly mangas = new MangaAPI();
  readonly chapters = new ChapterAPI();
  readonly library = new LibraryAPI();
  readonly collections = new CollectionAPI();
  readonly bugs = new BugAPI();
  readonly mangaRequests = new MangaRequestAPI();
}

// Singleton instance
export const draynorApi = new DraynorApi();
