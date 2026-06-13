import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get("token");
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState({ loading: true, message: "" });
  const [manualToken, setManualToken] = useState("");
  // devLink removed: production-only verify flow
  const navigate = useNavigate();

  useEffect(() => {
    const doVerify = async (tokenToUse) => {
      if (!tokenToUse) {
        setStatus({
          loading: false,
          message:
            "Please check your email for a verification link, or paste the token below.",
        });
        return;
      }
      setStatus({ loading: true, message: "Verifying..." });
      try {
        const res = await verifyEmail(tokenToUse);
        setStatus({
          loading: false,
          message: res.message || "Email verified successfully.",
        });
        // Redirect to login after short delay
        setTimeout(() => navigate("/login"), 2000);
      } catch (err) {
        setStatus({
          loading: false,
          message: err.response?.data?.message || "Verification failed.",
        });
      }
    };

    // Auto-run if token is present in query params
    doVerify(tokenParam);

    // Redirect signed-in users away from verify page
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      try {
        const parsed = stored ? JSON.parse(stored) : null;
        if (parsed && parsed.emailVerified) {
          // If already verified and signed-in, redirect home
          navigate("/");
        }
      } catch (e) {
        // ignore
      }
    }

    // No dev fallback: show message if no token present
  }, [tokenParam, verifyEmail, navigate]);

  return (
    <div className="page-enter" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div className="card">
        <div className="card-header">
          <h2>Verify Email</h2>
        </div>
        <div className="card-body">
          {status.loading ? (
            <>
              <div className="spinner"></div>
              <p>{status.message || "Verifying..."}</p>
            </>
          ) : (
            <div>
              <div className="alert alert-info">{status.message}</div>
              <div style={{ marginTop: "16px" }}>
                <label htmlFor="token">
                  Paste verification token (if you have it):
                </label>
                <input
                  id="token"
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Enter verification token"
                  style={{ width: "100%", marginTop: "8px" }}
                />
                <button
                  className="btn btn-primary"
                  style={{ marginTop: "10px" }}
                  onClick={async () => {
                    if (!manualToken)
                      return setStatus({
                        loading: false,
                        message: "Please enter a token.",
                      });
                    setStatus({ loading: true, message: "Verifying..." });
                    try {
                      const res = await verifyEmail(manualToken);
                      setStatus({
                        loading: false,
                        message: res.message || "Email verified successfully.",
                      });
                      setTimeout(() => navigate("/login"), 2000);
                    } catch (err) {
                      setStatus({
                        loading: false,
                        message:
                          err.response?.data?.message || "Verification failed.",
                      });
                    }
                  }}
                >
                  Verify Token
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
