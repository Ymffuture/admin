export const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem("adminUser"));
  return user?.role === "admin";
};
