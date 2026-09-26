import { useNavigate } from "react-router-dom";

export default function Topbar({
  title,
  user,
}) {
  const navigate = useNavigate();

  const userName =
    user?.name ||
    user?.username ||
    "User";

  const email =
    user?.email ||
    "user@example.com";

  const initial =
    userName.charAt(0).toUpperCase() ||
    "U";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <header className="hm-topbar">

      {/* =================================================
          LEFT
      ================================================= */}

      <div className="min-w-0">

        <p className="hm-top-eyebrow">
          Personal Habit Analytics
        </p>

        <h1 className="hm-top-title">
          {title}
        </h1>

        <p className="hm-top-subtitle">
          Stay consistent. Build your future.
        </p>

      </div>

      {/* =================================================
          RIGHT
      ================================================= */}

      <div className="hm-top-actions">

        <button
          type="button"
          className="hm-icon-button"
          aria-label="Appearance"
          title="Appearance"
        >
          ◐
        </button>

        <div className="hm-top-user">

          <div className="hm-top-avatar">
            {initial}
          </div>

          <div className="hidden sm:block min-w-0">

            <p className="hm-top-user-name truncate">
              {userName}
            </p>

            <p className="hm-top-user-email truncate">
              {email}
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="hm-top-logout"
        >
          Sign out
        </button>

      </div>

    </header>
  );
}