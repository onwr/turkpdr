import { redirect } from "next/navigation";

export default function AdminYorumlarRedirect() {
  redirect("/admin/comments");
}
