import { TypedEmitter } from "tiny-typed-emitter";
import { v4 as uuid } from "uuid";
import {
  getAlbumMetadata,
  getArtistMetadata,
  getCoverArtMetadata,
  getGenreMetadata,
  getTitleMetadata,
} from "../helpers";
import { StoredCover, StoredTrackInfo, TrackInfo } from "../types";
import { AIMPState } from "./aimp-state";

type Events = {
  ["track-updated"]: (meta: Record<string, any>) => void;
  ["title-updated"]: (meta: Record<string, any>) => void;
  ["artist-updated"]: (meta: Record<string, any>) => void;
  ["album-updated"]: (meta: Record<string, any>) => void;
  ["genre-updated"]: (meta: Record<string, any>) => void;
  ["cover-art-updated"]: (meta: Record<string, any>) => void;
};

export class TrackService extends TypedEmitter<Events> {
  readonly #state: AIMPState;

  #trackInfo: StoredTrackInfo;
  #coverHashToId: Map<string, string> = new Map();
  #covers: Map<string, StoredCover> = new Map();

  constructor(state: AIMPState) {
    super();

    this.#state = state;

    this.#trackInfo = {
      title: "",
      artist: "",
      album: "",
      coverArtId: null,
      genre: "",
      rating: 0,
      playCount: 0,
      bitrate: 0,
      sampleRate: 0,
    };
  }

  get info(): StoredTrackInfo {
    return this.#trackInfo;
  }

  get meta(): Record<string, unknown> {
    return {
      ...getTitleMetadata(this.#trackInfo.title),
      ...getArtistMetadata(this.#trackInfo.artist),
      ...getAlbumMetadata(this.#trackInfo.album),
      ...getGenreMetadata(this.#trackInfo.genre),
    };
  }

  public async initialize() {
    const remoteTrackInfo = await this.#state.rest.fetchTrackInfo();
    if (remoteTrackInfo) {
      await this.updateInfo(remoteTrackInfo);
    }
  }

  public async updateInfo(trackInfo: TrackInfo) {
    if (this.#trackInfo.title !== trackInfo.title) {
      this.#trackInfo.title = trackInfo.title;
      this.emit("title-updated", getTitleMetadata(trackInfo.title));
    }

    if (this.#trackInfo.artist !== trackInfo.artist) {
      this.#trackInfo.artist = trackInfo.artist;
      this.emit("artist-updated", getArtistMetadata(trackInfo.artist));
    }

    if (this.#trackInfo.album !== trackInfo.album) {
      this.#trackInfo.album = trackInfo.album;
      this.emit("album-updated", getAlbumMetadata(trackInfo.album));
    }

    if (this.#trackInfo.genre !== trackInfo.genre) {
      this.#trackInfo.genre = trackInfo.genre;
      this.emit("genre-updated", getGenreMetadata(trackInfo.genre));
    }

    // More mundane stuff
    this.#trackInfo.rating = trackInfo.rating;
    this.#trackInfo.playCount = trackInfo.play_count;
    this.#trackInfo.bitrate = trackInfo.bitrate;
    this.#trackInfo.sampleRate = trackInfo.sample_rate;

    // Grab art Id
    const coverArtId = await this.#fetchCoverArtId();
    if (this.#trackInfo.coverArtId !== coverArtId) {
      this.#trackInfo.coverArtId = coverArtId;
      this.emit(
        "cover-art-updated",
        getCoverArtMetadata(this.#getCoverArtUrl(coverArtId)),
      );
    }
  }

  public getCoverArt(id?: string): StoredCover | null {
    if (typeof id === "string" && this.#covers.has(id)) {
      return this.#covers.get(id) as StoredCover;
    }

    return null;
  }

  #fetchCoverArtId = async (): Promise<string | null> => {
    const cover = await this.#state.rest.fetchCoverArt();

    if (!cover) {
      return null;
    }

    if (this.#coverHashToId.has(cover.hash)) {
      return this.#coverHashToId.get(cover.hash) as string;
    }

    const id = uuid();
    this.#coverHashToId.set(cover.hash, id);
    this.#covers.set(id, cover);

    return id;
  };

  #getCoverArtUrl(coverId: string | null): string {
    return `${this.#state.firebotUrl}plugins/oceanity/aimp/cover/${coverId ?? "default"}`;
  }
}
