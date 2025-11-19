import {UserAccessItem, UserAppAccessList} from './UserAccessItem';
import {UserProfileModel} from './UserProfile.model';

export interface UserDataResponse {
  userAccessList: UserAccessItem[];
  appAccessList: UserAppAccessList[];
  userProfile: UserProfileModel;
}
