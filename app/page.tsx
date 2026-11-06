import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";

export const instant = false;

export default async function Home() {
  await connection();
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">YouTube Roast</h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Sign in with Google and let AI roast your YouTube taste.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="rounded-full bg-white px-6 py-3 text-base font-medium text-zinc-900 shadow ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-700"
          >
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
}
