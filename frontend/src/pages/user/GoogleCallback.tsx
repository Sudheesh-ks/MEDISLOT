import { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { updateUserAccessToken } from "../../context/tokenManagerUser";
import { toast } from "react-toastify";

const GoogleCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("Must use within AppContext");
  }

  const { setToken } = context;

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      updateUserAccessToken(token);
      setToken(token);
                      localStorage.removeItem("isDoctorLoggedOut");
                      toast.success("Registration successful")
      navigate("/home");
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.spinner} />
      <p style={styles.text}>Logging in, please wait...</p>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f9fafb",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  spinner: {
    border: "6px solid #eee",
    borderTop: "6px solid #3b82f6",
    borderRadius: "50%",
    width: 50,
    height: 50,
    animation: "spin 1s linear infinite",
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: "#333",
  },
};

// CSS keyframes for spinner animation
const styleSheet = document.styleSheets[0];
const keyframes = `@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }`;
styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

export default GoogleCallback;
