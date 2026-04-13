export type CourseStatus = 
  | '体验课完课' 
  | '正价课完课' 
  | '已购试听未约课' 
  | '正价课首课' 
  | '连续缺席三节课' 
  | '近30天未约课';

export type FollowUpStatus = '待跟进' | '已跟进';

export interface FollowUpNote {
  id: string;
  stage: string;
  content: string;
  time: string;
  operator: string;
}

export interface Student {
  id: string;
  nickname: string;
  jid: string;
  followUpStatus: FollowUpStatus;
  lastClassTime: string;
  sceneId: string;
  officialAccount: string;
  courseName: string;
  courseStatus: CourseStatus;
  learningProgress: {
    completed: number;
    total: number;
  };
  followUpPerson: string | null;
  followUpTime: string | null;
  purchaseCount: number;
  purchaseAmount: number;
  tags: string[];
  organization: string;
  project: string;
  notes: FollowUpNote[];
}

export interface DashboardStats {
  todayPending: number;
  todayFollowed: number;
  notFollowed: number;
}
