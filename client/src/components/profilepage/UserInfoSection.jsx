import { useState } from "react";
import { AlertCircle, Cake, KeyRound, Save } from "lucide-react";
import { useAuth } from "../../context/Auth/useAuth.jsx";
import { normalizeImageUrl } from "../../utils/imageUtils.js";
import { EmptyState } from "./EmptyState.jsx";

const toDateInputValue = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const UserInfoSection = () => {
  const { user: authUser, updateProfile, changePassword } = useAuth();
  const user = authUser || { username: "Customer", email: "user@example.com" };
  const [form, setForm] = useState({
    username: user.username || "",
    email: user.email || "",
    avatar: user.avatar || "",
    birthday: toDateInputValue(user.birthday) || "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdError, setPwdError] = useState("");

  const handleProfileChange = (field) => (e) => {
    setSuccess("");
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!authUser) {
      setError("กรุณาเข้าสู่ระบบก่อนแก้ไขข้อมูล");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await updateProfile({
        username: form.username,
        email: form.email,
        avatar: form.avatar,
        birthday: form.birthday
          ? new Date(form.birthday).toISOString()
          : null,
      });
      setSuccess("บันทึกข้อมูลส่วนตัวสำเร็จ");
    } catch (err) {
      const apiError =
        err?.response?.data?.errors?.[0] || err?.response?.data?.message;
      setError(apiError || "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!authUser) {
      setError("กรุณาเข้าสู่ระบบก่อนเปลี่ยนรหัสผ่าน");
      return;
    }
    setPwdMsg("");
    setPwdError("");
    try {
      const res = await changePassword(pwdForm);
      setPwdMsg(res?.data?.message || "เปลี่ยนรหัสผ่านสำเร็จ");
      setPwdForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      const apiError =
        err?.response?.data?.errors?.[0] || err?.response?.data?.message;
      setPwdError(apiError || "เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">ข้อมูลส่วนตัว</h2>
      {!authUser ? (
        <EmptyState
          title="ยังไม่ได้เข้าสู่ระบบ"
          description="เข้าสู่ระบบเพื่อดูและแก้ไขข้อมูลส่วนตัวของคุณ"
        />
      ) : (
        <>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {success && (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                <span>{success}</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div>
              <label
                htmlFor="profile-username"
                className="mb-1 block text-sm font-medium text-gray-600"
              >
                Username
              </label>
              <input
                id="profile-username"
                type="text"
                value={form.username}
                onChange={handleProfileChange("username")}
                required
                minLength={3}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="profile-email"
                className="mb-1 block text-sm font-medium text-gray-600"
              >
                Email
              </label>
              <input
                id="profile-email"
                type="email"
                value={form.email}
                onChange={handleProfileChange("email")}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="profile-birthday"
                className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-600"
              >
                <Cake size={14} className="text-accent" />
                วันเดือนปีเกิด (วันเกิดสำหรับคูปองส่วนลด)
              </label>
              <input
                id="profile-birthday"
                type="date"
                value={form.birthday}
                max={new Date().toISOString().split("T")[0]}
                onChange={handleProfileChange("birthday")}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-400">
                ใช้คำนวณคูปองวันเกิด (Birthday Reward) ตรงแท็บ "คูปองและรางวัล"
              </p>
            </div>
            {/* <div>
              <label htmlFor="profile-avatar" className="mb-1 block text-sm font-medium text-gray-600">
                รูปโปรไฟล์ (ลิงก์รูปภาพ)
              </label>
              <input
                id="profile-avatar"
                type="url"
                value={form.avatar}
                onChange={handleProfileChange('avatar')}
                placeholder="https://example.com/avatar.jpg"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
              {form.avatar && (
                <img
                  src={normalizeImageUrl(form.avatar)}
                  alt="ตัวอย่างรูปโปรไฟล์"
                  className="mt-3 h-20 w-20 rounded-full border border-gray-200 object-cover"
                />
              )}
            </div> */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-primary-hover transition disabled:opacity-50 cursor-pointer"
              >
                <Save size={16} />
                {saving ? "กำลังบันทึก…" : "บันทึกข้อมูล"}
              </button>
            </div>
          </form>

          <form
            onSubmit={handleChangePassword}
            className="mt-10 space-y-4 border-t border-gray-200 pt-6"
          >
            <h3 className="inline-flex items-center gap-2 text-base font-bold text-primary">
              <KeyRound size={18} />
              เปลี่ยนรหัสผ่าน
            </h3>
            {pwdMsg && (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                <span>{pwdMsg}</span>
              </div>
            )}
            {pwdError && (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle size={18} className="shrink-0" />
                <span>{pwdError}</span>
              </div>
            )}
            <div>
              <label
                htmlFor="pwd-current"
                className="mb-1 block text-sm font-medium text-gray-600"
              >
                รหัสผ่านปัจจุบัน
              </label>
              <input
                id="pwd-current"
                type="password"
                value={pwdForm.currentPassword}
                onChange={(e) =>
                  setPwdForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
<label htmlFor="pwd-new" className="mb-1 block text-sm font-medium text-gray-600">
                รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)
              </label>
              <input
                id="pwd-new"
                type="password"
                value={pwdForm.newPassword}
                onChange={(e) =>
                  setPwdForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div className="pt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow hover:opacity-90 transition cursor-pointer"
              >
                <KeyRound size={16} />
                เปลี่ยนรหัสผ่าน
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};
