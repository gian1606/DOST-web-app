import SettingsPage from "../components/ui/Settings";
import { PB_CREDENTIALS } from "../mock/data";

export default function PBSettings() {
  return (
    <SettingsPage
      profile={{
        name:       PB_CREDENTIALS.name,
        email:      PB_CREDENTIALS.email,
        role:       "Punong Barangay",
        scope:      PB_CREDENTIALS.barangay,
        scopeLabel: "Barangay",
      }}
      logoutKey="bs_pb_auth"
      logoutPath="/login"
    />
  );
}
