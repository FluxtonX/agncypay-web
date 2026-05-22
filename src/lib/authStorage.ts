export type RegisteredUser = {
  email: string;
  password: string;
  fullName: string;
  accountType: "individual" | "agency" | "brand";
  verificationFlow?: "manual" | "instant";
};

const REGISTERED_USERS_KEY = "agncypay_registered_users";

export function getRegisteredUsers(): RegisteredUser[] {
  if (typeof window === "undefined") return [];

  try {
    const storedUsers = localStorage.getItem(REGISTERED_USERS_KEY);
    const parsedUsers = storedUsers ? JSON.parse(storedUsers) : [];

    if (!Array.isArray(parsedUsers)) return [];

    return parsedUsers.filter((user): user is RegisteredUser => (
      typeof user?.email === "string" &&
      typeof user?.password === "string" &&
      typeof user?.fullName === "string" &&
      ["individual", "agency", "brand"].includes(user?.accountType) &&
      (user?.verificationFlow === undefined ||
        ["manual", "instant"].includes(user.verificationFlow))
    ));
  } catch (error) {
    console.error("Failed to load registered users:", error);
    return [];
  }
}

export function saveRegisteredUser(user: RegisteredUser) {
  if (typeof window === "undefined") return;

  const normalizedEmail = user.email.trim().toLowerCase();
  const existingUsers = getRegisteredUsers();
  const nextUsers = [
    ...existingUsers.filter((existingUser) => existingUser.email.toLowerCase() !== normalizedEmail),
    { ...user, email: normalizedEmail },
  ];

  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(nextUsers));
}
