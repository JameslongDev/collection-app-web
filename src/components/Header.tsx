import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function Header() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-white/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] shadow-sm">
            <div className="relative h-5 w-5">
              <div className="absolute left-0 top-0 h-4 w-4 rounded border-2 border-white opacity-60" />
              <div className="absolute bottom-0 right-0 h-4 w-4 rounded border-2 border-white bg-[var(--color-primary)]" />
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-[var(--color-text)] sm:text-lg">
              Collection App
            </h1>

            <p className="hidden text-xs text-[var(--color-text-muted)] sm:block">
              Your personal collection
            </p>
          </div>
        </div>

        {/* User */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="hidden max-w-48 truncate text-sm text-[var(--color-text-muted)] sm:block">
            {session?.user.email}
          </span>

          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
          >
            Settings
          </button>

          <button
            type="button"
            onClick={signOut}
            className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
