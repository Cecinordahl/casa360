import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) return <p>{t("common.loading")}</p>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <p>{t("admin.notAdmin")}</p>;
  return <>{children}</>;
}
