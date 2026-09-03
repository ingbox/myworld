export type JukeboxData = {
  id: number;
  title: string;
  artist: string;
  download_url: string;
};

export type JukeboxPaginationResult = {
  jukebox: JukeboxData[];
  totalCount: number;
};
