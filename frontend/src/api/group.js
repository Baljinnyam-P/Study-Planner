import api from './axios';

export const removeGroupMember = (group_id, member_id) =>
  api.post('/invites/remove-member', { group_id, member_id });
