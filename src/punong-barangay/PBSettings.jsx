import SettingsPage from "../components/ui/Settings";

export default function PBSettings() {
  const user = JSON.parse(sessionStorage.getItem("bs_user") || "{}");

  return (
    <SettingsPage
      profile={{
        name:       user.name     || "Punong Barangay",
        email:      user.email    || "",
        role:       "Punong Barangay",
        scope:      user.barangay || "",
        scopeLabel: "Barangay",
      }}
      logoutKey="bs_token"
      logoutPath="/login"
    />
  );
}
