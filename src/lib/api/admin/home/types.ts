export type MiniroomItemData = {
    id: number;
    name: string | null;
    url: string;
    width: number | null;
    height: number | null;
  };
  
  export type MiniroomLayer = {
    id: string;
    item_id: number;
    x: number;
    y: number;
    w: number;
    h: number;
    z: number;
  };
  
  export type UploadMiniroomItemRequest = {
    file: File;
    width?: number;
    height?: number;
  };

  export type MiniroomData = {
    id: number;
    layers: MiniroomLayer[];
    url: string | null;
    created_at: Date;
    updated_at: Date;
  };