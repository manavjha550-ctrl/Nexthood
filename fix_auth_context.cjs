const fs = require('fs');
let content = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

// Add logout to AuthContextType
content = content.replace("setUser: (user: User | null) => void;", "setUser: (user: User | null) => void;\n  logout: () => void;");

// Add logout implementation
const logoutImpl = `
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  useEffect(() => {
`;
content = content.replace("useEffect(() => {", logoutImpl);

// Export logout
content = content.replace("refreshUser, setUser }", "refreshUser, setUser, logout }");

fs.writeFileSync('src/context/AuthContext.tsx', content);
