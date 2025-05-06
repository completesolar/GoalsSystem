export interface Goals {
  goalid?: number;
  who: string;
  p: number | null;
  proj: string;
  vp: string | null;
  b: number | null;
  e: number | null;
  d: number | null
  s: string;
  memo: string;
  fiscalyear: number;
  updateBy: string;
  createddatetime: Date;
  updateddatetime: Date;
  description: string;
  action:string;
  [key: string]: any;
  isconfidential: boolean;
  description_diff?: {
    combined_diff: any;
  };
}

export interface GoalUpdateResponse {
  description_diff?: {
    combined_diff: string;
  };
} 