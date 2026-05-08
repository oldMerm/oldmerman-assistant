// 用户管理相关
const UserStatus = new Map([
    [-1, "删除"],
    [0, "禁用"],
    [1, "启用"],
])

interface UserSettingParam{
    user_uuid: string; // the unique sign about user
    username: string | null;
    email: string | null;
    phone: string | null;
    status: number
}

export { UserStatus, type UserSettingParam}