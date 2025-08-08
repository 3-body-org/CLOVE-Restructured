import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEdit, faSave, faTimes, faEnvelope, faBirthdayCake, faIdBadge, faCalendarAlt, faCamera, faBolt, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import styles from "features/profile/styles/ProfilePage.module.scss";
import TitleAndProfile from "components/layout/Navbar/TitleAndProfile";
import { useAuth } from "contexts/AuthContext";
import { useApi } from "../../../hooks/useApi";
import { showSuccessNotification, showErrorNotification } from "../../../utils/notifications";
import LoadingScreen from "components/layout/StatusScreen/LoadingScreen";
import ErrorScreen from "components/layout/StatusScreen/ErrorScreen";

const ProfilePage = () => {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const { put } = useApi();
  const [formData, setFormData] = useState({
    username: user?.username || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    birthday: user?.birthday ? new Date(user.birthday).toISOString().split('T')[0] : "",
    bio: user?.bio || "",
    current_password: "",
    password: "",
    confirm_password: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.profile_photo_url || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false); // Only for save operations
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editingSection, setEditingSection] = useState(null); // 'profile', 'about', 'info', 'account'
  const [minTimePassed, setMinTimePassed] = useState(false);
  
  // Minimum loading time effect
  useEffect(() => {
    setMinTimePassed(false);
    const timer = setTimeout(() => setMinTimePassed(true), 200);
    return () => clearTimeout(timer);
  }, []); // Only on mount

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      if (formData.username.length < 3) {
        showErrorNotification("Username must be at least 3 characters long");
        setSaving(false);
        return;
      }
      if (formData.username.length > 50) {
        showErrorNotification("Username must be less than 50 characters");
        setSaving(false);
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        showErrorNotification("Username can only contain letters, numbers, and underscores");
        setSaving(false);
        return;
      }
      if (formData.password || formData.confirm_password) {
        if (formData.password.length < 8) {
          showErrorNotification("New password must be at least 8 characters long");
          setSaving(false);
          return;
        }
        if (formData.password !== formData.confirm_password) {
          showErrorNotification("New password and confirm password do not match");
          setSaving(false);
          return;
        }
      }
      const sensitiveChanges = formData.email !== user?.email || formData.password;
      if (sensitiveChanges && !formData.current_password) {
        showErrorNotification("Current password is required to change email or password");
        setSaving(false);
        return;
      }
      const changedFields = {};
      Object.keys(formData).forEach(key => {
        if (["current_password", "password", "confirm_password"].includes(key)) {
          if (formData[key]) changedFields[key] = formData[key];
        } else if (formData[key] !== user?.[key]) {
          changedFields[key] = formData[key];
        }
      });
      delete changedFields.confirm_password;
      if (avatarFile) {
        showErrorNotification("Avatar upload logic not implemented.");
        setSaving(false);
        return;
      }
      const userId = String(user.id).split(':')[0];
      if (!userId || isNaN(Number(userId))) {
        showErrorNotification("Invalid user ID. Please reload the page and try again.");
        setSaving(false);
        return;
      }
      const response = await put(`/users/${userId}`, changedFields);
      if (response.ok) {
        setAvatarFile(null);
        setFormData(prev => ({
          ...prev,
          current_password: "",
          password: "",
          confirm_password: ""
        }));
        await refreshUser();
        setEditingSection(null); 
        showSuccessNotification("Profile updated successfully!");
      } else {
        let errorMsg = response.statusText;
        try {
          const text = await response.text();
          if (text) {
            const errorData = JSON.parse(text);
            errorMsg = errorData.detail || errorData.message || errorMsg;
          }
        } catch (e) {}
        showErrorNotification(errorMsg);
      }
    } catch (error) {
      showErrorNotification("Failed to update profile. Please try again.");
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSection = () => {
    setEditingSection(null);
    setFormData({
      username: user?.username || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      birthday: user?.birthday ? new Date(user.birthday).toISOString().split('T')[0] : "",
      bio: user?.bio || "",
      current_password: "",
      password: "",
      confirm_password: "",
    });
    setError("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Remove minTimePassed and local loading for initial load
  // Only use saving for save operations

  useEffect(() => {
    const msg = sessionStorage.getItem('profileSuccess');
    if (msg) {
      showSuccessNotification(msg);
      sessionStorage.removeItem('profileSuccess');
    }
  }, []);

  const isFormChanged = () => {
    if (!user) return false;
    if (editingSection === 'profile') {
      return (
        formData.first_name !== user.first_name ||
        formData.last_name !== user.last_name
      );
    }
    if (editingSection === 'about') {
      return formData.bio !== (user.bio || "");
    }
    if (editingSection === 'info') {
      return (
        formData.username !== user.username ||
        formData.birthday !== (user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : "")
      );
    }
    if (editingSection === 'account') {
      return (
        formData.email !== user.email ||
        !!formData.password ||
        !!formData.confirm_password ||
        !!formData.current_password
      );
    }
    return false;
  };

  if (authLoading || !user || !minTimePassed) return <LoadingScreen message="Loading profile..." />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <div className={styles.container}>
      <main className={styles.dashboard}>
        <TitleAndProfile
          nonColored={"Profile"}
          colored={"Settings"}
          description={"Manage your account and preferences"}
          showProfileButton={false}
        />
        <div className={styles.mainContent}>
          <div className={styles.profileHeroWrap}>
            <div className={styles.profileHero}>
              <div className={styles.heroContent}>
                <div className={styles.avatarHeroOuter}>
                  <img
                    className={styles.avatarHero}
                    src={avatarPreview || `https://api.dicebear.com/7.x/rings/svg?seed=${user?.username || 'default'}&color[]=a78bfa&color[]=38bdf8&color[]=06b6d4&color[]=818cf8`}
                    alt="Profile avatar"
                  />
                  {editingSection === 'profile' && (
                    <label className={styles.avatarHeroUploadOverlay} title="Click to upload new photo">
                      <FontAwesomeIcon icon={faCamera} />
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleAvatarChange}
                      />
                    </label>
                  )}
                </div>
                <div className={styles.heroInfo}>
                  <h1 className={styles.heroName}>
                    {editingSection === 'profile' ? (
                      <>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          placeholder="First Name"
                          className={styles.heroNameInput}
                        />
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          placeholder="Last Name"
                          className={styles.heroNameInput}
                        />
                      </>
                    ) : (
                      <>{user?.first_name} {user?.last_name}</>
                    )}
                    <span className={styles.heroBadge}>
                      <FontAwesomeIcon icon={faBolt} />
                      <span>{user?.is_active ? "Active" : "Inactive"}</span>
                    </span>
                  </h1>
                  <div className={styles.heroUsername}>
                    <span className={styles.usernameText}>@{user?.username}</span>
                    <span className={styles.accountTypeBadge}>
                      {user?.is_adaptive ? "Adaptive" : "Non-Adaptive"}
                    </span>
                  </div>
                  {editingSection !== 'profile' ? (
                    <button onClick={() => setEditingSection('profile')} className={styles.heroEditButton}>
                      <FontAwesomeIcon icon={faEdit} /> Edit Profile
                    </button>
                  ) : (
                    <div className={styles.editActionRow + ' ' + styles.editActionRowLeft}>
                      <button onClick={handleCancelSection} className={styles.cancelButton}>
                        <FontAwesomeIcon icon={faTimes} /> Cancel
                      </button>
                      <button onClick={handleSave} className={styles.saveButton} disabled={saving || !isFormChanged()}>
                        <FontAwesomeIcon icon={faSave} /> Save
                  </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.profileContent}>
              <div className={styles.bioSection}>
                <h3 className={styles.sectionTitle}>
                  About
                  <button onClick={() => setEditingSection('about')} className={styles.sectionEditBtn}>
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                </h3>
                {editingSection === 'about' ? (
                  <>
                  <textarea
                    className={styles.bioInput}
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us a bit about yourself..."
                    rows={3}
                  />
                    <div className={styles.editActionRow}>
                      <button onClick={handleCancelSection} className={styles.cancelButton}>
                        <FontAwesomeIcon icon={faTimes} /> Cancel
                      </button>
                      <button onClick={handleSave} className={styles.saveButton} disabled={saving || !isFormChanged()}>
                        <FontAwesomeIcon icon={faSave} /> Save
                      </button>
                    </div>
                  </>
                ) : (
                  <p className={styles.bioText}>{user?.bio || "Add a short bio to let others know more about you!"}</p>
                )}
              </div>
              <div className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>
                  Profile Information
                  <button onClick={() => setEditingSection('info')} className={styles.sectionEditBtn}>
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                </h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoHeader}>
                      <FontAwesomeIcon icon={faIdBadge} className={styles.infoIcon} />
                      <span className={styles.infoLabel}>Username</span>
                    </div>
                    {editingSection === 'info' ? (
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={styles.infoInput}
                      />
                    ) : (
                      <div className={styles.infoValue}>{user?.username}</div>
                    )}
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoHeader}>
                      <FontAwesomeIcon icon={faBirthdayCake} className={styles.infoIcon} />
                      <span className={styles.infoLabel}>Birthday</span>
                    </div>
                    {editingSection === 'info' ? (
                      <input
                        type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleInputChange}
                        className={styles.infoInput}
                      />
                    ) : (
                      <div className={styles.infoValue}>{formatDate(user?.birthday)}</div>
                    )}
                  </div>
                </div>
                {editingSection === 'info' && (
                  <div className={styles.editActionRow}>
                    <button onClick={handleCancelSection} className={styles.cancelButton}>
                      <FontAwesomeIcon icon={faTimes} /> Cancel
                    </button>
                    <button onClick={handleSave} className={styles.saveButton} disabled={saving || !isFormChanged()}>
                      <FontAwesomeIcon icon={faSave} /> Save
                    </button>
                  </div>
                )}
              </div>
              <div className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>
                  Account Information
                  <button onClick={() => setEditingSection('account')} className={styles.sectionEditBtn}>
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                </h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoHeader}>
                      <FontAwesomeIcon icon={faEnvelope} className={styles.infoIcon} />
                      <span className={styles.infoLabel}>Email</span>
                    </div>
                    {editingSection === 'account' ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={styles.infoInput}
                      />
                    ) : (
                      <div className={styles.infoValue}>{user?.email}</div>
                    )}
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoHeader}>
                      <FontAwesomeIcon icon={faEye} className={styles.infoIcon} />
                      <span className={styles.infoLabel}>Password</span>
                    </div>
                    {editingSection === 'account' ? (
                      <>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={styles.infoInput}
                          placeholder="New Password"
                        />
                        <button type="button" onClick={() => setShowNewPassword(v => !v)} className={styles.passwordToggleBtn}>
                          <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                        </button>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirm_password"
                          value={formData.confirm_password}
                          onChange={handleInputChange}
                          className={styles.infoInput}
                          placeholder="Confirm New Password"
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className={styles.passwordToggleBtn}>
                          <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                        </button>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="current_password"
                          value={formData.current_password}
                          onChange={handleInputChange}
                          className={styles.infoInput}
                          placeholder="Current Password (required for changes)"
                        />
                        <button type="button" onClick={() => setShowPassword(v => !v)} className={styles.passwordToggleBtn}>
                          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                      </>
                    ) : (
                      <div className={styles.infoValue}>********</div>
                    )}
                  </div>
                </div>
                {editingSection === 'account' && (
                  <div className={styles.editActionRow}>
                    <button onClick={handleCancelSection} className={styles.cancelButton}>
                    <FontAwesomeIcon icon={faTimes} /> Cancel
                  </button>
                    <button onClick={handleSave} className={styles.saveButton} disabled={saving || !isFormChanged()}>
                      <FontAwesomeIcon icon={faSave} /> Save
                  </button>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage; 