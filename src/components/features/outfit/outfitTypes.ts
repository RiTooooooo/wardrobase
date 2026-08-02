export type PickerItem = {
  id: string;
  name: string;
  imageUrl: string | null;
};

export type OutfitFormValues = {
  wornOn: string;
  itemIds: string[];
  satisfaction?: number;
  weather?: string;
  memo?: string;
};
