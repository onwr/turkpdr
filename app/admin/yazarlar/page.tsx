import { redirect } from "next/navigation";

export default function AdminYazarlarRedirect() {
  redirect("/admin/authors");
}
