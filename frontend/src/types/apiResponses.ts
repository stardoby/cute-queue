import type { CourseSummary } from "./courseSummary";
import { Schedule } from "./schedule";
import { Link } from "./link";
import type { RequestSummary} from "./requestSummary";

export interface PostNextRequestAPIResponse {
  requestId: string;
}

export interface GetRequestHistoryAPIResponse {
    requests: RequestSummary[];
}

export interface GetCoursesAPIResponse {
  courses: CourseSummary[];
}

export interface GetCourseMetaDataAPIResponse {
  name: string;
  location: string;
  schedule: Schedule;
  resources: Link[];
}

export interface JoinCourseAPIResponse {
  course: CourseSummary;
}

export interface GetRequestAPIResponse {
  requestId: string;
  courseId: string;
  creatorId: string;

  status: string;
  updatedAt: string;
  createdAt: string;

  creatorName: string;
  location: string;
  assignment: string;
  problem: string;
  shortDescription: string;
  questionType: string;
  alreadyTried: string[];
  bestGuess: string;
  howToHelp: string;
  stuckTime: string;

  resolution?: string | undefined;

  helperId?: string | undefined;
  helperName?: string | undefined;

  comments?:
    | undefined
    | {
        createdAt: string;
        text: string;
      }[];
}
