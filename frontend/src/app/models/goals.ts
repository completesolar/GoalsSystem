export interface Goals {
  goalid?: number;
  who: string;
  p: number | null;
  proj: string;
  vp: string;
  b: number | null;
  e: number | null;
  d: string;
  s: string;
  memo: string;
  fiscalyear: number;
  updateBy: string;
  createddatetime: Date;
  updateddatetime: Date;
  description: string;
  action:string;
  [key: string]: any;

}