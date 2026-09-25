import { redirect } from "next/navigation";
import { currentMember } from "@/lib/admin/supabase-server";
import Panel from "./Panel";
import LogOutButton from "./LogOutButton";

// Every panel page checks the login on the server, and that the person is on the team.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, member } = await currentMember();
  if (!user) redirect("/admin/login");
  if (!member) {
    return (
      <div className="content" style={{ maxWidth: 560, margin: "0 auto", paddingTop: 80 }}>
        <div className="card">
          <h2>This account isn&apos;t on the team</h2>
          <p className="muted" style={{ margin: "8px 0 14px" }}>You&apos;re logged in as {user.email}, but only people the owner has added can open the team panel. Ask the owner to add you.</p>
          <LogOutButton />
        </div>
      </div>
    );
  }
  return <Panel me={member}>{children}</Panel>;
}
