export type NPSResponse = {
  npsScore: number;
  responseDate: string | Date;
};

export type ProjectWithNPS = {
  id: string;
  name: string;
  client: string;
  status: string;
  price?: number | null;
  saleDate?: string | Date | null;
  isENB: boolean;
  endDate?: string | Date | null;

  // outros campos do seu Project (se precisar)
  npsResponse?: NPSResponse | null;
};
