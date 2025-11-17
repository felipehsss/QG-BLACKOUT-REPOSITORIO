import bcrypt from "bcryptjs";

const gerarHash = async () => {
  const hash = await bcrypt.hash("1234", 10);
  console.log("Hash gerado:", hash);
};

gerarHash();
