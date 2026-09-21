import { redirect } from "next/navigation";

/** Legacy /login → canonical /sign-in */
export default async function LoginRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/sign-in`);
}
