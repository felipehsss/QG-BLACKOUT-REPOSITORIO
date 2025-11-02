const API_URL = "http://localhost:3080/api/auth";

export async function loginService(credentials) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao fazer login");
    }

    return data;
  } catch (err) {
    console.error("Erro no loginService:", err);
    // Se for um erro de rede, retorna mensagem mais amigável
    if (err instanceof TypeError && err.message.includes("fetch")) {
      throw new Error("Erro de conexão. Verifique se o backend está rodando.");
    }
    throw err;
  }
}
