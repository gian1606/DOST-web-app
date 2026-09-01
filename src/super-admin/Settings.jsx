import SettingsPage from "../components/ui/Settings";
import { MOCK_CREDENTIALS } from "./mock/data";

export default function SuperAdminSettings() {
  return (
    <SettingsPage
      profile={{
        name:       "Super Admin",
        email:      MOCK_CREDENTIALS.email,
        role:       "Super Administrator",
        scope:      "Batangas City",
        scopeLabel: "Jurisdiction",
      }}
      logoutKey="bs_auth"
      logoutPath="/login"
    />
  );
}
