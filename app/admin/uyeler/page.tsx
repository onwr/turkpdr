import { redirect } from "next/navigation";

export default function AdminUyelerRedirect() {
  redirect("/admin/users");
}
